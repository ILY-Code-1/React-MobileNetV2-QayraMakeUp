// ============================================================================
// PDF GENERATOR - Analysis Report
// ============================================================================

import jsPDF from 'jspdf';
import type { AnalysisData } from '../services/firestoreService';

// ============================================================================
// TYPES
// ============================================================================

export interface PDFGenerationOptions {
  includeImage?: boolean;
  fileName?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  primary: [198, 142, 45], // #C68E2D
  black: [0, 0, 0],
  gray: [100, 100, 100],
  lightGray: [200, 200, 200],
  white: [255, 255, 255],
  success: [34, 197, 94],
  warning: [234, 179, 8],
  error: [239, 68, 68],
} as const;

// ============================================================================
// PDF GENERATOR CLASS
// ============================================================================

class PDFGenerator {
  private doc: jsPDF;
  private currentY: number = MARGIN;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.currentY = MARGIN;
  }

  /**
   * Add header section
   */
  private addHeader(title: string): void {
    // Background
    this.doc.setFillColor(...COLORS.black);
    this.doc.rect(0, 0, PAGE_WIDTH, 40, 'F');

    // Title
    this.doc.setTextColor(...COLORS.primary);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, MARGIN, 28);

    // Subtitle
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('BY QAYRA MAKE UP', MARGIN, 36);

    this.currentY = 50;
  }

  /**
   * Add section header
   */
  private addSectionHeader(title: string): void {
    this.currentY += 10;

    // Line
    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN, this.currentY, PAGE_WIDTH - MARGIN, this.currentY);

    // Title
    this.currentY += 8;
    this.doc.setTextColor(...COLORS.primary);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, MARGIN, this.currentY);

    this.currentY += 5;
  }

  /**
   * Add info row
   */
  private addInfoRow(label: string, value: string): void {
    this.doc.setTextColor(...COLORS.gray);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(label, MARGIN, this.currentY);

    this.doc.setTextColor(...COLORS.black);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(value, MARGIN + 60, this.currentY);

    this.currentY += 7;
  }

  /**
   * Add text block
   */
  private addTextBlock(text: string, fontSize = 11): void {
    this.doc.setTextColor(...COLORS.black);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'normal');

    const lines = this.doc.splitTextToSize(text, CONTENT_WIDTH);
    this.doc.text(lines, MARGIN, this.currentY);

    this.currentY += lines.length * (fontSize * 0.5) + 5;
  }

  /**
   * Add confidence score with color coding
   */
  private addConfidenceScore(score: number): void {
    this.currentY += 5;

    const percentage = (score * 100).toFixed(1);
    let color: number[] = [...COLORS.gray];
    let label = 'Tidak Diketahui';

    if (score >= 0.80) {
      color = [...COLORS.success];
      label = 'Tinggi';
    } else if (score >= 0.60) {
      color = [...COLORS.warning];
      label = 'Sedang';
    } else if (score >= 0.40) {
      color = [...COLORS.warning];
      label = 'Rendah';
    } else {
      color = [...COLORS.error];
      label = 'Tidak Pasti';
    }

    // Score
    this.doc.setTextColor(...COLORS.black);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Tingkat Keyakinan: ${percentage}%`, MARGIN, this.currentY);

    // Badge
    this.currentY += 5;
    const [r, g, b] = color;
    this.doc.setFillColor(r, g, b);
    this.doc.roundedRect(MARGIN, this.currentY - 4, 40, 8, 2, 2, 'F');
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(label, MARGIN + 5, this.currentY + 2);

    this.currentY += 10;
  }

  /**
   * Add probability distribution bars
   */
  private addProbabilityDistribution(probabilities: number[], predictedLabel?: string): void {
    this.currentY += 5;

    const labels = ['Acne-Prone Skin', 'Dry Skin', 'Normal Skin', 'Oily Skin', 'Sensitive Skin'];

    const labelMap: Record<string, number> = {
      acne: 0,
      dry: 1,
      normal: 2,
      oily: 3,
      sensitive: 4,
    };
    const predictedIndex = predictedLabel ? labelMap[predictedLabel] : -1;

    labels.forEach((label, index) => {
      const prob = probabilities[index];
      const percentage = (prob * 100).toFixed(1);
      const isPredicted = index === predictedIndex;

      // Label
      this.doc.setTextColor(...COLORS.black);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(label, MARGIN, this.currentY);

      // Bar background
      this.doc.setFillColor(...COLORS.lightGray);
      this.doc.rect(MARGIN, this.currentY + 2, CONTENT_WIDTH, 5, 'F');

      // Bar fill
      const barWidth = (prob * CONTENT_WIDTH);
      const colorPredicted = isPredicted ? COLORS.primary : COLORS.gray;
      const [r, g, b] = colorPredicted;
      this.doc.setFillColor(r, g, b);
      this.doc.rect(MARGIN, this.currentY + 2, barWidth, 5, 'F');

      // Percentage
      this.doc.setTextColor(...COLORS.black);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${percentage}%`, PAGE_WIDTH - MARGIN - 20, this.currentY + 6);

      this.currentY += 10;
    });
  }

  /**
   * Add image to PDF
   */
  private async addImage(imageUrl: string): Promise<void> {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      // Calculate dimensions to fit within content width
      const maxWidth = CONTENT_WIDTH;
      const maxHeight = 80;
      const aspectRatio = img.width / img.height;

      let width = maxWidth;
      let height = maxWidth / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      this.currentY += 5;

      // Draw image centered
      const x = MARGIN + (CONTENT_WIDTH - width) / 2;
      this.doc.addImage(imageUrl, 'JPEG', x, this.currentY, width, height);

      this.currentY += height + 10;
    } catch (error) {
      console.error('[PDFGenerator] Error adding image:', error);
      // Continue without image if loading fails
    }
  }

  /**
   * Check if new page is needed
   */
  private checkNewPage(requiredSpace: number): void {
    if (this.currentY + requiredSpace > PAGE_HEIGHT - MARGIN) {
      this.doc.addPage();
      this.currentY = MARGIN;
    }
  }

  /**
   * Generate PDF from analysis data
   */
  async generatePDF(
    analysisData: AnalysisData,
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const { includeImage = true, fileName = `analysis-${analysisData.id}` } = options;

    // Add header
    this.addHeader('Laporan Analisis Kulit Wajah');

    // User Information Section
    this.addSectionHeader('Informasi Pengguna');
    this.addInfoRow('Nama:', analysisData.name);
    this.addInfoRow('Email:', analysisData.email);

    if (analysisData.eventDate && !isNaN(new Date(analysisData.eventDate).getTime())) {
      const eventDate = new Date(analysisData.eventDate).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      this.addInfoRow('Tanggal Acara:', eventDate);
    }

    // Analysis Results Section
    this.checkNewPage(80);
    this.addSectionHeader('Hasil Analisis');

    // Predicted Label
    this.doc.setTextColor(...COLORS.black);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Kondisi Kulit Terdeteksi:', MARGIN, this.currentY);

    this.currentY += 5;
    this.doc.setTextColor(...COLORS.primary);
    this.doc.setFontSize(16);
    this.doc.text(analysisData.predictedLabelDisplay || '-', MARGIN, this.currentY);

    // Confidence Score
    if (analysisData.confidenceScore !== undefined) {
      this.addConfidenceScore(analysisData.confidenceScore);
    }

    // Summary
    if (analysisData.generatedSummary) {
      this.checkNewPage(40);
      this.doc.setTextColor(...COLORS.black);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Ringkasan:', MARGIN, this.currentY);

      this.currentY += 5;
      this.addTextBlock(analysisData.generatedSummary);
    }

    // Clinical Notes
    if (analysisData.clinicalNotes) {
      this.checkNewPage(40);
      this.doc.setTextColor(...COLORS.black);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Catatan Klinis:', MARGIN, this.currentY);

      this.currentY += 5;
      this.addTextBlock(analysisData.clinicalNotes);
    }

    // Probability Distribution
    if (analysisData.modelOutputRaw && analysisData.modelOutputRaw.length > 0) {
      this.checkNewPage(80);
      this.addSectionHeader('Distribusi Probabilitas');
      this.addProbabilityDistribution(analysisData.modelOutputRaw, analysisData.predictedLabel);
    }

    // Image
    if (includeImage && analysisData.imageUrl) {
      this.checkNewPage(100);
      this.addSectionHeader('Foto Analisis');
      await this.addImage(analysisData.imageUrl);
    }

    // Qayra Notes
    if (analysisData.catatan_qayra) {
      this.checkNewPage(40);
      this.addSectionHeader('Catatan Qayra');
      this.addTextBlock(analysisData.catatan_qayra);
    }

    // Footer
    if (analysisData.createdAt && !isNaN(new Date(analysisData.createdAt).getTime())) {
      this.checkNewPage(20);
      this.currentY = PAGE_HEIGHT - MARGIN;

      this.doc.setTextColor(...COLORS.gray);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Dianalisis pada ${new Date(analysisData.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        MARGIN,
        this.currentY
      );
    }

    // Save PDF
    this.doc.save(`${fileName}.pdf`);
  }
}

// ============================================================================
// EXPORT UTILITY FUNCTION
// ============================================================================

/**
 * Generate and download PDF analysis report
 */
export const generateAnalysisPDF = async (
  analysisData: AnalysisData,
  options?: PDFGenerationOptions
): Promise<void> => {
  const generator = new PDFGenerator();
  await generator.generatePDF(analysisData, options);
};

export default generateAnalysisPDF;
