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
};

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

  // --------------------------------------------------------------------------
  // NEW VISUAL HELPER METHODS
  // --------------------------------------------------------------------------

  /**
   * Draw a short brand accent underline directly below the header block.
   */
  private drawAccentLine(): void {
    this.doc.setDrawColor(...(COLORS.primary as [number, number, number]));
    this.doc.setLineWidth(1.5);
    this.doc.line(MARGIN, 42, MARGIN + 58, 42);
  }

  /**
   * Draw a decorative rounded frame border around the analysis image.
   * Called after addImage so the frame appears on top of the image edge.
   */
  private drawImageFrame(x: number, y: number, width: number, height: number): void {
    this.doc.setDrawColor(...(COLORS.primary as [number, number, number]));
    this.doc.setLineWidth(0.4);
    this.doc.roundedRect(x - 2, y - 2, width + 4, height + 4, 2, 2, 'S');
  }

  /**
   * Draw a short vertical accent bar to the left of a section header.
   * Positioned so it spans from the separator line through the title baseline.
   */
  private drawSectionAccentBar(y: number, height: number): void {
    this.doc.setFillColor(...(COLORS.primary as [number, number, number]));
    this.doc.rect(MARGIN - 6, y, 3, height, 'F');
  }

  /**
   * Draw a warm off-white background fill behind an info row.
   * Must be called BEFORE the row's text commands so text renders on top.
   */
  private drawInfoRowBackground(y: number): void {
    this.doc.setFillColor(252, 249, 245);
    this.doc.rect(MARGIN - 3, y - 5, CONTENT_WIDTH + 6, 7, 'F');
  }

  /**
   * Draw a thin brand-colored separator line above the footer text area.
   */
  private drawFooterLine(): void {
    this.doc.setDrawColor(...(COLORS.primary as [number, number, number]));
    this.doc.setLineWidth(0.4);
    this.doc.line(MARGIN, PAGE_HEIGHT - MARGIN - 8, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - MARGIN - 8);
  }

  // --------------------------------------------------------------------------
  // EXISTING METHODS (original logic preserved — visual helpers added)
  // --------------------------------------------------------------------------

  /**
   * Add header section
   */
  private addHeader(title: string): void {
    this.doc.setFillColor(...(COLORS.black as [number, number, number]));
    this.doc.rect(0, 0, PAGE_WIDTH, 40, 'F');

    const iconSize = 18;
    const iconX = MARGIN;
    const iconY = 11;

    try {
      this.doc.addImage('/qayra-icon.png', 'PNG', iconX, iconY, iconSize, iconSize);
    } catch (error) {
      console.warn('Icon gagal dimuat:', error);
    }

    const textX = iconX + iconSize + 8;
    this.doc.setTextColor(...(COLORS.primary as [number, number, number]));
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, textX, 24);
    this.doc.setTextColor(...(COLORS.white as [number, number, number]));
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('BY QAYRA MAKE UP', textX, 32);

    this.currentY = 50;

    // Accent line
    this.drawAccentLine();
  }

  /**
   * Add section header
   */
  private addSectionHeader(title: string): void {
    this.currentY += 10;

    // Line
    this.doc.setDrawColor(...(COLORS.primary as [number, number, number]));
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN, this.currentY, PAGE_WIDTH - MARGIN, this.currentY);

    // Title
    this.currentY += 8;
    this.doc.setTextColor(...(COLORS.primary as [number, number, number]));
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, MARGIN, this.currentY);

    // Left accent bar anchoring the section header visually
    this.drawSectionAccentBar(this.currentY - 10, 14);

    this.currentY += 5;
  }

  /**
   * Add info row
   */
  private addInfoRow(label: string, value: string): void {
    // Warm off-white background drawn before text so text renders on top
    this.drawInfoRowBackground(this.currentY);

    this.doc.setTextColor(...(COLORS.gray as [number, number, number]));
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(label, MARGIN, this.currentY);

    this.doc.setTextColor(...(COLORS.black as [number, number, number]));
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(value, MARGIN + 60, this.currentY);

    this.currentY += 7;
  }

  /**
   * Add text block
   */
  private addTextBlock(text: string, fontSize = 11): void {
    this.doc.setTextColor(...(COLORS.black as [number, number, number]));
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
    let color = COLORS.gray;
    let label = 'Tidak Diketahui';

    if (score >= 0.80) {
      color = COLORS.success;
      label = 'Tinggi';
    } else if (score >= 0.60) {
      color = COLORS.warning;
      label = 'Sedang';
    } else if (score >= 0.40) {
      color = COLORS.warning;
      label = 'Rendah';
    } else {
      color = COLORS.error;
      label = 'Tidak Pasti';
    }

    // Score
    this.doc.setTextColor(...(COLORS.black as [number, number, number]));
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Tingkat Keyakinan: ${percentage}%`, MARGIN, this.currentY);

    // Badge
    this.currentY += 4;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    const textWidth = this.doc.getTextWidth(label);
    const paddingX = 14;
    const badgeWidth = textWidth + paddingX;
    const badgeHeight = 12;
    const badgeX = MARGIN;
    const badgeY = this.currentY;
    this.doc.setFillColor(...(color as [number, number, number]));
    this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4, 4, 'F');
    this.doc.setTextColor(...(COLORS.white as [number, number, number]));
    this.doc.text(label, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2, {
      align: 'center',
      baseline: 'middle',
    });

    // Geser cursor ke bawah setelah badge
    this.currentY += badgeHeight + 1;

    this.currentY += 10;
  }

  /**
   * Add probability distribution bars
   */
  private addProbabilityDistribution(probabilities: number[]): void {
    this.currentY += 5;

    const labels = ['Acne-Prone Skin', 'Dry Skin', 'Normal Skin', 'Oily Skin', 'Sensitive Skin'];

    labels.forEach((label, index) => {
      const prob = probabilities[index];
      const percentage = (prob * 100).toFixed(1);
      const isPredicted = index === probabilities.indexOf(Math.max(...probabilities));

      // Label
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(label, MARGIN, this.currentY);

      // Bar background
      this.doc.setFillColor(...(COLORS.lightGray as [number, number, number]));
      this.doc.rect(MARGIN, this.currentY + 2, CONTENT_WIDTH, 5, 'F');
      // Rounded overlay for softer bar background (overdraws sharp rect edges)
      this.doc.roundedRect(MARGIN, this.currentY + 2, CONTENT_WIDTH, 5, 2.5, 2.5, 'F');

      // Bar fill
      const barWidth = (prob * CONTENT_WIDTH);
      this.doc.setFillColor(...(isPredicted ? (COLORS.primary as [number, number, number]) : (COLORS.gray as [number, number, number])));
      this.doc.rect(MARGIN, this.currentY + 2, barWidth, 5, 'F');
      // Rounded overlay for softer fill bar (only when wide enough for rounded corners)
      if (barWidth > 5) {
        this.doc.roundedRect(MARGIN, this.currentY + 2, barWidth, 5, 2.5, 2.5, 'F');
      }

      // Percentage
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
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
      const frameY = this.currentY;
      this.doc.addImage(imageUrl, 'JPEG', x, this.currentY, width, height);
      // Decorative border frame drawn after the image
      this.drawImageFrame(x, frameY, width, height);

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
   * Add treatment priority list
   */
  private addTreatmentPriority(treatmentPriority: string[]): void {
    this.currentY += 5;

    treatmentPriority.forEach((item, index) => {
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${index + 1}. ${item}`, MARGIN + 10, this.currentY);

      this.currentY += 5;
    });

    this.currentY += 5;
  }

  /**
   * Add preparation protocol
   */
  private addPreparationProtocol(preparationProtocol: any): void {
    this.currentY += 5;

    // 7 Days Before
    if (preparationProtocol['7_days_before'] && preparationProtocol['7_days_before'].length > 0) {
      this.checkNewPage(40);
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('7 Hari Sebelum:', MARGIN, this.currentY);

      this.currentY += 5;
      preparationProtocol['7_days_before'].forEach((item: string) => {
        this.doc.setTextColor(...(COLORS.black as [number, number, number]));
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`• ${item}`, MARGIN + 10, this.currentY);

        this.currentY += 4;
      });

      this.currentY += 5;
    }

    // 3 Days Before
    if (preparationProtocol['3_days_before'] && preparationProtocol['3_days_before'].length > 0) {
      this.checkNewPage(40);
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('3 Hari Sebelum:', MARGIN, this.currentY);

      this.currentY += 5;
      preparationProtocol['3_days_before'].forEach((item: string) => {
        this.doc.setTextColor(...(COLORS.black as [number, number, number]));
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`• ${item}`, MARGIN + 10, this.currentY);

        this.currentY += 4;
      });

      this.currentY += 5;
    }

    // Day of Makeup
    if (preparationProtocol.day_of_makeup && preparationProtocol.day_of_makeup.length > 0) {
      this.checkNewPage(40);
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Hari Makeup:', MARGIN, this.currentY);

      this.currentY += 5;
      preparationProtocol.day_of_makeup.forEach((item: string) => {
        this.doc.setTextColor(...(COLORS.black as [number, number, number]));
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`• ${item}`, MARGIN + 10, this.currentY);

        this.currentY += 4;
      });

      this.currentY += 5;
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
    const predictedLabel = analysisData.predictedLabelDisplay || analysisData.result || '-';
    this.doc.setTextColor(...(COLORS.black as [number, number, number]));
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Kondisi Kulit Terdeteksi:', MARGIN, this.currentY);

    this.currentY += 5;
    this.doc.setTextColor(...(COLORS.primary as [number, number, number]));
    this.doc.setFontSize(14);
    this.doc.text(predictedLabel, MARGIN, this.currentY);

    // Confidence Score
    if (analysisData.confidenceScore !== undefined) {
      this.addConfidenceScore(analysisData.confidenceScore);
    }

    // Summary
    if (analysisData.generatedSummary) {
      this.checkNewPage(40);
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Ringkasan:', MARGIN, this.currentY);

      this.currentY += 5;
      this.addTextBlock(analysisData.generatedSummary);
    }

    // Clinical Notes
    if (analysisData.clinicalNotes) {
      this.checkNewPage(40);
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Catatan Klinis:', MARGIN, this.currentY);

      this.currentY += 5;
      this.addTextBlock(analysisData.clinicalNotes);
    }

    // Clinical Focus
    if (analysisData.clinicalFocus) {
      this.checkNewPage(40);
      this.doc.setTextColor(...(COLORS.black as [number, number, number]));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Fokus Klinis:', MARGIN, this.currentY);

      this.currentY += 5;
      this.addTextBlock(analysisData.clinicalFocus);
    }

    // Treatment Priority
    if (analysisData.treatmentPriority && analysisData.treatmentPriority.length > 0) {
      this.checkNewPage(60);
      this.addSectionHeader('Prioritas Perawatan');
      this.addTreatmentPriority(analysisData.treatmentPriority);
    }

    // Preparation Protocol
    if (analysisData.preparationProtocol) {
      this.checkNewPage(80);
      this.addSectionHeader('Protokol Persiapan');
      this.addPreparationProtocol(analysisData.preparationProtocol);
    }

    // Probability Distribution
    if (analysisData.modelOutputRaw && analysisData.modelOutputRaw.length > 0) {
      this.checkNewPage(80);
      this.addSectionHeader('Distribusi Probabilitas');
      this.addProbabilityDistribution(analysisData.modelOutputRaw);
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

      // Brand separator line above footer text
      this.drawFooterLine();

      this.doc.setTextColor(...(COLORS.gray as [number, number, number]));
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
