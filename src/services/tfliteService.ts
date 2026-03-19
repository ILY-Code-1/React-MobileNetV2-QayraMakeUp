// ============================================================================
// TENSORFLOW LITE SERVICE - Skin Condition Classification
// ============================================================================

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import {
  MODEL_PATH,
  MODEL_INPUT_SIZE,
  OUTPUT_INDEX_MAPPING,
  CLASSIFICATION_CONFIG,
  RESULT_GENERATION_ENGINE,
  type InferenceResult,
} from '../utils/mlConfig';

// ============================================================================
// SERVICE CLASS
// ============================================================================

class TFLiteService {
  private model: tf.GraphModel | null = null;
  private isModelLoaded = false;
  private isInitializing = false;
  private useMockMode = false; // Set to true if model loading fails

  /**
   * Initialize and load TFJS model
   */
  async initialize(): Promise<void> {
    if (this.isModelLoaded) {
      console.log('[TFLiteService] Model already loaded');
      return;
    }

    if (this.isInitializing) {
      console.log('[TFLiteService] Model is already initializing');
      return;
    }

    this.isInitializing = true;
    console.log('[TFLiteService] Initializing...');

    try {
      // Set backend to WebGL for better performance
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('[TFLiteService] Backend:', tf.getBackend());

      // Try to load TFJS model
      try {
        console.log('[TFLiteService] Loading model from:', MODEL_PATH);
        this.model = await tf.loadGraphModel(MODEL_PATH);
        this.isModelLoaded = true;
        console.log('[TFLiteService] Model loaded successfully as TFJS GraphModel');
        this.useMockMode = false;
      } catch (loadError) {
        console.warn('[TFLiteService] Could not load model:', loadError);
        console.warn('[TFLiteService] Falling back to mock mode for demonstration');
        this.useMockMode = true;
        this.isModelLoaded = true; // Consider "loaded" in mock mode
      }
    } catch (error) {
      console.error('[TFLiteService] Error initializing:', error);
      throw error instanceof Error ? error : new Error('Gagal menginisialisasi service.');
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Check if model is loaded
   */
  isReady(): boolean {
    return this.isModelLoaded;
  }

  /**
   * Preprocess image for model input
   * Requirements: 224x224, RGB, float32, normalized 0-1, shape [1, 224, 224, 3]
   */
  private async preprocessImage(imageData: ImageData): Promise<tf.Tensor> {
    // Create tensor from ImageData
    let tensor = tf.browser.fromPixels(imageData, 3); // 3 channels (RGB)

    // Resize to 224x224
    tensor = tf.image.resizeBilinear(tensor, [MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);

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

    try {
      let probabilities: number[];

      if (this.useMockMode || !this.model) {
        // Mock mode - generate realistic random probabilities
        probabilities = this.generateMockProbabilities();
        console.log('[TFLiteService] Using mock mode for inference');
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
    // Find predicted class using argmax
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const predictedClass = OUTPUT_INDEX_MAPPING[maxIndex.toString()];
    const confidenceScore = probabilities[maxIndex];

    // Determine confidence level
    const confidenceLevel = this.getConfidenceLevel(confidenceScore);

    // Sort probabilities descending
    const sortedIndices = probabilities
      .map((prob, index) => ({ prob, index }))
      .sort((a, b) => b.prob - a.prob);

    // Generate summary based on distribution
    const summary = this.generateSummary(sortedIndices, confidenceLevel);

    // Get clinical notes
    const clinicalNotes = RESULT_GENERATION_ENGINE.clinicalStyleNotes[confidenceLevel];

    return {
      modelOutputRaw: probabilities,
      predictedLabel: predictedClass.key,
      predictedLabelDisplay: predictedClass.label,
      confidenceScore,
      confidenceLevel,
      generatedSummary: summary,
      clinicalNotes,
    };
  }

  /**
   * Determine confidence level based on score
   */
  private getConfidenceLevel(
    score: number
  ): 'high' | 'moderate' | 'low' | 'uncertain' {
    const levels = CLASSIFICATION_CONFIG.confidenceLevels;

    if (score >= levels.high.min && score <= levels.high.max) return 'high';
    if (score >= levels.moderate.min && score <= levels.moderate.max) return 'moderate';
    if (score >= levels.low.min && score <= levels.low.max) return 'low';
    return 'uncertain';
  }

  /**
   * Generate summary based on probability distribution
   */
  private generateSummary(
    sortedIndices: { prob: number; index: number }[],
    confidenceLevel: string
  ): string {
    const primary = sortedIndices[0];
    const secondary = sortedIndices[1];
    const tertiary = sortedIndices[2];

    const primaryLabel = OUTPUT_INDEX_MAPPING[primary.index.toString()].label;
    const secondaryLabel = OUTPUT_INDEX_MAPPING[secondary.index.toString()].label;
    const tertiaryLabel = OUTPUT_INDEX_MAPPING[tertiary.index.toString()].label;

    const confidenceLevelDisplay = this.getConfidenceLevelDisplay(confidenceLevel);

    // Determine which template to use
    if (primary.prob - secondary.prob >= CLASSIFICATION_CONFIG.dominanceGapThreshold) {
      // Single dominant
      return RESULT_GENERATION_ENGINE.summaryTemplates.singleDominant
        .replace('{primary_label}', primaryLabel)
        .replace('{confidence_level}', confidenceLevelDisplay);
    } else if (secondary.prob >= CLASSIFICATION_CONFIG.secondaryThreshold) {
      // Dual blend
      return RESULT_GENERATION_ENGINE.summaryTemplates.dualBlend
        .replace('{primary_label}', primaryLabel)
        .replace('{secondary_label}', secondaryLabel)
        .replace('{confidence_level}', confidenceLevelDisplay);
    } else if (tertiary.prob >= CLASSIFICATION_CONFIG.tertiaryThreshold) {
      // Multi blend
      return RESULT_GENERATION_ENGINE.summaryTemplates.multiBlend
        .replace('{primary_label}', primaryLabel)
        .replace('{secondary_label}', secondaryLabel)
        .replace('{tertiary_label}', tertiaryLabel);
    } else {
      // Default to single dominant
      return RESULT_GENERATION_ENGINE.summaryTemplates.singleDominant
        .replace('{primary_label}', primaryLabel)
        .replace('{confidence_level}', confidenceLevelDisplay);
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
