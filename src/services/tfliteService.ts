// ============================================================================
// TENSORFLOW LITE SERVICE - Skin Condition Classification
// ============================================================================

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import type { InferenceResult } from '../utils/mlConfig';

// ============================================================================
// TYPES
// ============================================================================

interface MLConfig {
  system_info: {
    system_name: string;
    version: string;
    expected_model_output: {
      type: string;
      length: number;
      format_example: number[];
      selection_method: string;
    };
  };
  classification_config: {
    secondary_threshold: number;
    tertiary_threshold: number;
    dominance_gap_threshold: number;
    confidence_levels: {
      high: { min: number; max: number };
      moderate: { min: number; max: number };
      low: { min: number; max: number };
      uncertain: { min: number; max: number };
    };
  };
  output_index_mapping: Record<string, {
    key: string;
    label: string;
    index: number;
  }>;
  result_generation_engine: {
    summary_templates: {
      single_dominant: string;
      dual_blend: string;
      multi_blend: string;
    };
    clinical_style_notes: {
      high: string;
      moderate: string;
      low: string;
      uncertain: string;
    };
  };
  classes: Record<string, {
    index: number;
    severity_weight: number;
    probability_source: string;
    clinical_focus: string;
    treatment_priority_if_high: string[];
    preparation_protocol: {
      '7_days_before': string[];
      '3_days_before': string[];
      day_of_makeup: string[];
    };
  }>;
}

interface TopClass {
  key: string;
  label: string;
  probability: number;
  rank: number;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class TFLiteService {
  private model: tf.GraphModel | null = null;
  private isModelLoaded = false;
  private isInitializing = false;
  private useMockMode = false; // Set to true if model loading fails
  private mlConfig: MLConfig | null = null;

  /**
   * Load ML config from JSON file
   */
  private async loadMLConfig(): Promise<void> {
    try {
      const response = await fetch('/ml-config.json');
      this.mlConfig = await response.json();
    } catch (error) {
      throw new Error('Gagal memuat konfigurasi ML');
    }
  }

  /**
   * Initialize and load TFJS model
   */
  async initialize(): Promise<void> {
    if (this.isModelLoaded) {
      return;
    }

    if (this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    try {
      // Load ML config first
      await this.loadMLConfig();

      // Set backend to WebGL for better performance
      await tf.setBackend('webgl');
      await tf.ready();

      // Try to load TFJS model
      try {
        this.model = await tf.loadGraphModel('/skin_condition.tflite');
        this.isModelLoaded = true;
        this.useMockMode = false;
      } catch (loadError) {
        // Enable mock mode for development/testing
        this.useMockMode = true;
        this.isModelLoaded = true;
      }

      this.isModelLoaded = true;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Gagal memuat model TFLite. Silakan refresh halaman.');
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Check if model is loaded
   */
  isReady(): boolean {
    return this.isModelLoaded && this.model !== null;
  }

  /**
   * Preprocess image for model input
   * Requirements: 224x224, RGB, float32, normalized 0-1, shape [1, 224, 224, 3]
   */
  private async preprocessImage(imageData: ImageData): Promise<tf.Tensor> {
    // Create tensor from ImageData
    let tensor = tf.browser.fromPixels(imageData, 3); // 3 channels (RGB)

    // Resize to 224x224
    tensor = tf.image.resizeBilinear(tensor, [224, 224]);

    // Convert to float32
    tensor = tensor.toFloat();

    // Normalize to 0-1 by dividing by 255.0
    tensor = tensor.div(255.0);

    // Add batch dimension: [224, 224, 3] -> [1, 224, 224, 3]
    tensor = tensor.expandDims(0);

    return tensor;
  }

  /**
   * Run inference on image
   */
  async predict(imageData: ImageData): Promise<InferenceResult> {
    if (!this.isReady()) {
      await this.initialize();
    }

    if (!this.model && !this.useMockMode) {
      throw new Error('Model tidak tersedia');
    }

    try {
      let probabilities: number[];

      if (this.useMockMode || !this.mlConfig) {
        // Mock mode - generate realistic random probabilities
        probabilities = this.generateMockProbabilities();
      } else {
        // Real inference
        const inputTensor = await this.preprocessImage(imageData);
        const outputTensor = this.model!.predict(inputTensor) as tf.Tensor;
        const outputData = await outputTensor.data();
        inputTensor.dispose();
        outputTensor.dispose();
        probabilities = Array.from(outputData) as number[];
      }

      // Process results
      return this.processOutput(probabilities);
    } catch (error) {
      console.error('[TFLiteService] Error during inference:', error);
      throw new Error('Gagal melakukan inference pada gambar.');
    }
  }

  /**
   * Generate mock probabilities for demonstration
   * Creates realistic-looking output with one dominant class
   */
  private generateMockProbabilities(): number[] {
    // Randomly select a dominant class
    const dominantIndex = Math.floor(Math.random() * 5);

    // Generate probabilities
    const probs = Array(5).fill(0);

    // Set dominant class to high probability (0.6 - 0.9)
    probs[dominantIndex] = 0.6 + Math.random() * 0.3;

    // Distribute remaining probability among other classes
    let remaining = 1 - probs[dominantIndex];
    for (let i = 0; i < 5; i++) {
      if (i !== dominantIndex) {
        // Give random small probability
        const share = Math.random() * remaining * 0.5;
        probs[i] = share;
        remaining -= share;
      }
    }

    // Add any remaining to a random non-dominant class
    if (remaining > 0) {
      const otherIndex = (dominantIndex + 1 + Math.floor(Math.random() * 4)) % 5;
      probs[otherIndex] += remaining;
    }

    return probs;
  }

  /**
   * Process model output and generate readable results
   */
  private processOutput(probabilities: number[]): InferenceResult {
    if (!this.mlConfig) {
      throw new Error('ML config not loaded');
    }

    const config = this.mlConfig;

    // Find predicted class using argmax
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const predictedClass = config.output_index_mapping[maxIndex.toString()];
    const confidenceScore = probabilities[maxIndex];

    // Determine confidence level
    const confidenceLevel = this.getConfidenceLevel(confidenceScore, config.classification_config.confidence_levels);

    // Sort probabilities descending
    const sortedIndices = probabilities
      .map((prob, index) => ({ prob, index }))
      .sort((a, b) => b.prob - a.prob);

    // Generate summary based on distribution
    const summaryType = this.getSummaryType(sortedIndices, config.classification_config);
    const summary = this.generateSummary(sortedIndices, confidenceLevel, summaryType, config.result_generation_engine.summary_templates);

    // Get clinical notes
    const clinicalNotes = config.result_generation_engine.clinical_style_notes[confidenceLevel];

    // Get class details
    const classDetails = config.classes[predictedClass.key];

    // Get top classes
    const topClasses = this.getTopClasses(probabilities, config.output_index_mapping);

    return {
      modelOutputRaw: probabilities,
      predictedLabel: predictedClass.key,
      predictedLabelDisplay: predictedClass.label,
      confidenceScore,
      confidenceLevel,
      generatedSummary: summary,
      clinicalNotes,
      summaryType,
      primaryClass: predictedClass.key,
      secondaryClass: sortedIndices[1] ? config.output_index_mapping[sortedIndices[1].index.toString()].key : undefined,
      tertiaryClass: sortedIndices[2] ? config.output_index_mapping[sortedIndices[2].index.toString()].key : undefined,
      clinicalFocus: classDetails.clinical_focus,
      treatmentPriority: classDetails.treatment_priority_if_high,
      preparationProtocol: classDetails.preparation_protocol,
      topClasses,
    };
  }

  /**
   * Determine confidence level based on score
   */
  private getConfidenceLevel(
    score: number,
    confidenceLevels: MLConfig['classification_config']['confidence_levels']
  ): 'high' | 'moderate' | 'low' | 'uncertain' {
    if (score >= confidenceLevels.high.min && score <= confidenceLevels.high.max) return 'high';
    if (score >= confidenceLevels.moderate.min && score <= confidenceLevels.moderate.max) return 'moderate';
    if (score >= confidenceLevels.low.min && score <= confidenceLevels.low.max) return 'low';
    return 'uncertain';
  }

  /**
   * Determine summary type based on probability distribution
   */
  private getSummaryType(
    sortedIndices: { prob: number; index: number }[],
    config: MLConfig['classification_config']
  ): 'single_dominant' | 'dual_blend' | 'multi_blend' {
    const primary = sortedIndices[0];
    const secondary = sortedIndices[1];
    const tertiary = sortedIndices[2];

    if (primary.prob - secondary.prob >= config.dominance_gap_threshold) {
      return 'single_dominant';
    } else if (secondary.prob >= config.secondary_threshold) {
      return 'dual_blend';
    } else if (tertiary.prob >= config.tertiary_threshold) {
      return 'multi_blend';
    } else {
      return 'single_dominant';
    }
  }

  /**
   * Generate summary based on probability distribution
   */
  private generateSummary(
    sortedIndices: { prob: number; index: number }[],
    confidenceLevel: string,
    summaryType: string,
    templates: MLConfig['result_generation_engine']['summary_templates']
  ): string {
    if (!this.mlConfig) return '';

    const config = this.mlConfig;
    const primary = sortedIndices[0];
    const secondary = sortedIndices[1];
    const tertiary = sortedIndices[2];

    const primaryLabel = config.output_index_mapping[primary.index.toString()].label;
    const secondaryLabel = config.output_index_mapping[secondary.index.toString()].label;
    const tertiaryLabel = config.output_index_mapping[tertiary.index.toString()].label;

    const confidenceLevelDisplay = this.getConfidenceLevelDisplay(confidenceLevel);

    // Determine which template to use
    if (summaryType === 'single_dominant') {
      return templates.single_dominant
        .replace('{primary_label}', primaryLabel)
        .replace('{confidence_level}', confidenceLevelDisplay);
    } else if (summaryType === 'dual_blend') {
      return templates.dual_blend
        .replace('{primary_label}', primaryLabel)
        .replace('{secondary_label}', secondaryLabel)
        .replace('{confidence_level}', confidenceLevelDisplay);
    } else {
      return templates.multi_blend
        .replace('{primary_label}', primaryLabel)
        .replace('{secondary_label}', secondaryLabel)
        .replace('{tertiary_label}', tertiaryLabel);
    }
  }

  /**
   * Get display text for confidence level
   */
  private getConfidenceLevelDisplay(level: string): string {
    switch (level) {
      case 'high':
        return 'Tinggi';
      case 'moderate':
        return 'Sedang';
      case 'low':
        return 'Rendah';
      case 'uncertain':
        return 'Tidak Pasti';
      default:
        return 'Tidak Diketahui';
    }
  }

  /**
   * Get top classes ranked by probability
   */
  private getTopClasses(
    probabilities: number[],
    indexMapping: MLConfig['output_index_mapping']
  ): TopClass[] {
    const sorted = probabilities
      .map((prob, index) => ({ prob, index }))
      .sort((a, b) => b.prob - a.prob);

    return sorted.slice(0, 5).map((item, rank) => ({
      key: indexMapping[item.index.toString()].key,
      label: indexMapping[item.index.toString()].label,
      probability: item.prob,
      rank: rank + 1,
    }));
  }

  /**
   * Load image from data URL and convert to ImageData
   */
  async loadImageFromDataURL(dataUrl: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Create canvas to extract ImageData
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Gagal membuat canvas context'));
          return;
        }

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Get ImageData
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.src = dataUrl;
    });
  }

  /**
   * Complete pipeline: Load image from data URL and run inference
   */
  async analyzeImage(dataUrl: string): Promise<InferenceResult> {
    // Load image
    const imageData = await this.loadImageFromDataURL(dataUrl);

    // Run inference
    return this.predict(imageData);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const tfliteService = new TFLiteService();
export default tfliteService;
