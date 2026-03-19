// ============================================================================
// ML CONFIGURATION - Skin Condition Classification
// ============================================================================

export interface SkinConditionClass {
  key: string;
  label: string;
  index: number;
}

export interface ModelOutput {
  probabilities: number[];
  predictedLabel: string;
  confidenceScore: number;
  confidenceLevel: 'high' | 'moderate' | 'low' | 'uncertain';
}

export interface InferenceResult {
  modelOutputRaw: number[];
  predictedLabel: string;
  predictedLabelDisplay: string;
  confidenceScore: number;
  confidenceLevel: 'high' | 'moderate' | 'low' | 'uncertain';
  generatedSummary: string;
  clinicalNotes: string;
}

export interface ClassificationConfig {
  secondaryThreshold: number;
  tertiaryThreshold: number;
  dominanceGapThreshold: number;
  confidenceLevels: {
    high: { min: number; max: number };
    moderate: { min: number; max: number };
    low: { min: number; max: number };
    uncertain: { min: number; max: number };
  };
}

export interface ClinicalNotes {
  high: string;
  moderate: string;
  low: string;
  uncertain: string;
}

export interface SummaryTemplates {
  singleDominant: string;
  dualBlend: string;
  multiBlend: string;
}

export interface ResultGenerationEngine {
  summaryTemplates: SummaryTemplates;
  clinicalStyleNotes: ClinicalNotes;
}

export interface MLConfig {
  systemInfo: {
    systemName: string;
    version: string;
    expectedModelOutput: {
      type: string;
      length: number;
      formatExample: number[];
      selectionMethod: string;
    };
  };
  classificationConfig: ClassificationConfig;
  outputIndexMapping: Record<string, SkinConditionClass>;
  resultGenerationEngine: ResultGenerationEngine;
}

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

export const OUTPUT_INDEX_MAPPING: Record<string, SkinConditionClass> = {
  '0': { key: 'acne', label: 'Acne-Prone Skin', index: 0 },
  '1': { key: 'dry', label: 'Dry Skin', index: 1 },
  '2': { key: 'normal', label: 'Normal Skin', index: 2 },
  '3': { key: 'oily', label: 'Oily Skin', index: 3 },
  '4': { key: 'sensitive', label: 'Sensitive Skin', index: 4 },
};

export const CLASSIFICATION_CONFIG: ClassificationConfig = {
  secondaryThreshold: 0.25,
  tertiaryThreshold: 0.15,
  dominanceGapThreshold: 0.20,
  confidenceLevels: {
    high: { min: 0.80, max: 1.0 },
    moderate: { min: 0.60, max: 0.79 },
    low: { min: 0.40, max: 0.59 },
    uncertain: { min: 0.0, max: 0.39 },
  },
};

export const RESULT_GENERATION_ENGINE: ResultGenerationEngine = {
  summaryTemplates: {
    singleDominant: 'Kulit calon pengantin terdeteksi dominan {primary_label} dengan tingkat keyakinan {confidence_level}.',
    dualBlend: 'Kulit calon pengantin menunjukkan kecenderungan {primary_label} dengan pengaruh {secondary_label}. Tingkat keyakinan: {confidence_level}.',
    multiBlend: 'Kulit menunjukkan kombinasi kondisi {primary_label}, {secondary_label}, dan {tertiary_label}. Disarankan pendekatan perawatan kombinasi.',
  },
  clinicalStyleNotes: {
    high: 'Analisis menunjukkan karakteristik kulit sangat konsisten.',
    moderate: 'Karakteristik cukup jelas namun tetap memerlukan pendekatan fleksibel.',
    low: 'Karakteristik kulit cenderung campuran dan memerlukan observasi tambahan.',
    uncertain: 'Model mendeteksi pola tidak dominan, disarankan evaluasi manual tambahan.',
  },
};

export const ML_CONFIG: MLConfig = {
  systemInfo: {
    systemName: 'AI Dermatology Grade System - Bride Skin Preparation',
    version: '2.0',
    expectedModelOutput: {
      type: 'float_array',
      length: 5,
      formatExample: [0.05, 0.70, 0.10, 0.10, 0.05],
      selectionMethod: 'argmax',
    },
  },
  classificationConfig: CLASSIFICATION_CONFIG,
  outputIndexMapping: OUTPUT_INDEX_MAPPING,
  resultGenerationEngine: RESULT_GENERATION_ENGINE,
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const MODEL_INPUT_SIZE = 224;
export const MODEL_PATH = '/skin_condition.tflite';
export const MODEL_OUTPUT_LENGTH = 5;
