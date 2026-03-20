// ============================================================================
// ML CONFIGURATION - Skin Condition Classification
// ============================================================================

export interface SkinConditionClass {
  key: string;
  label: string;
  index: number;
}

export interface TopClass {
  key: string;
  label: string;
  probability: number;
  rank: number;
}

export interface InferenceResult {
  modelOutputRaw: number[];
  predictedLabel: string;
  predictedLabelDisplay: string;
  confidenceScore: number;
  confidenceLevel: 'high' | 'moderate' | 'low' | 'uncertain';
  generatedSummary: string;
  clinicalNotes: string;
  summaryType: 'single_dominant' | 'dual_blend' | 'multi_blend';
  primaryClass: string;
  secondaryClass?: string;
  tertiaryClass?: string;
  clinicalFocus: string;
  treatmentPriority: string[];
  preparationProtocol: {
    '7_days_before': string[];
    '3_days_before': string[];
    day_of_makeup: string[];
  };
  topClasses: TopClass[];
}

export const OUTPUT_INDEX_MAPPING: Record<string, SkinConditionClass> = {
  '0': { key: 'acne', label: 'Acne-Prone Skin', index: 0 },
  '1': { key: 'dry', label: 'Dry Skin', index: 1 },
  '2': { key: 'normal', label: 'Normal Skin', index: 2 },
  '3': { key: 'oily', label: 'Oily Skin', index: 3 },
  '4': { key: 'sensitive', label: 'Sensitive Skin', index: 4 },
};

export interface ClassificationConfig {
  secondary_threshold: number;
  tertiary_threshold: number;
  dominance_gap_threshold: number;
  confidence_levels: {
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
  single_dominant: string;
  dual_blend: string;
  multi_blend: string;
}

export interface ResultGenerationEngine {
  summary_templates: SummaryTemplates;
  clinical_style_notes: ClinicalNotes;
}

export interface MLConfig {
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
  classification_config: ClassificationConfig;
  result_generation_engine: ResultGenerationEngine;
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

// ============================================================================
// CONSTANTS
// ============================================================================

export const MODEL_INPUT_SIZE = 224;
export const MODEL_PATH = '/skin_condition.tflite';
export const MODEL_OUTPUT_LENGTH = 5;
