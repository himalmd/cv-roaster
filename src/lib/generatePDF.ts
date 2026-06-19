import jsPDF from 'jspdf'
import type { RoastResult } from '../types'

function hex(r: number, g: number, b: number) {
  return [r, g, b] as [number, number, number]
}

const PURPLE = hex(139, 92, 246)
const PINK = hex(236, 72, 153)
const DARK = hex(15, 15, 25)
const CARD = hex(30, 27, 50)
const TEXT = hex(226, 232, 240)
const MUTED = hex(148, 163, 184)
const GREEN = hex(52, 211, 153)
const RED = hex(248, 113, 113)

export function generatePDF(result: RoastResult, fileName: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = 0

  // ── helpers ──────────────────────────────────────────────────────────────
  function fill(r: [number, number, number]) { doc.setFillColor(...r) }
  function stroke(r: [number, number, number]) { doc.setDrawColor(...r) }
  function color(r: [number, number, number]) { doc.setTextColor(...r) }
  function font(size: number, style: 'normal' | 'bold' = 'normal') {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
  }

  function rect(x: number, yy: number, w: number, h: number, r = 3) {
    doc.roundedRect(x, yy, w, h, r, r, 'F')
  }

  function wrapText(text: string, x: number, yy: number, maxW: number, lineH = 5): number {
    const lines = doc.splitTextToSize(text, maxW)
    doc.text(lines, x, yy)
    return yy + lines.length * lineH
  }

  function sectionHeader(title: string) {
    if (y > 250) { doc.addPage(); y = 15 }
    fill(CARD)
    rect(10, y, W - 20, 9)
    color(PURPLE)
    font(10, 'bold')
    doc.text(title, 15, y + 6)
    y += 13
  }

  function bullet(text: string, c: [number, number, number] = TEXT) {
    if (y > 272) { doc.addPage(); y = 15 }
    color(PURPLE)
    font(9, 'bold')
    doc.text('•', 16, y)
    color(c)
    font(9)
    wrapText(text, 21, y, W - 35)
    y += doc.splitTextToSize(text, W - 35).length * 4.5 + 2
  }

  function progressBar(label: string, value: number) {
    if (y > 272) { doc.addPage(); y = 15 }
    color(MUTED)
    font(8)
    doc.text(label, 16, y)
    doc.text(`${value}%`, W - 20, y, { align: 'right' })
    y += 4
    fill([40, 35, 60])
    rect(16, y, W - 32, 4, 2)
    const barColor: [number, number, number] =
      value >= 75 ? GREEN : value >= 50 ? [251, 191, 36] : RED
    fill(barColor)
    rect(16, y, (W - 32) * (value / 100), 4, 2)
    y += 8
  }

  // ── HEADER ────────────────────────────────────────────────────────────────
  fill(DARK)
  doc.rect(0, 0, W, 297, 'F')

  // gradient header band
  fill(PURPLE)
  doc.rect(0, 0, W, 45, 'F')
  fill(PINK)
  doc.rect(W * 0.55, 0, W * 0.45, 45, 'F')

  color([255, 255, 255])
  font(22, 'bold')
  doc.text('🔥 AI CV Roaster', 14, 20)
  color([230, 220, 255])
  font(9)
  doc.text('Get roasted. Get hired.', 14, 27)
  color([200, 190, 255])
  font(8)
  doc.text(`Report for: ${fileName}`, 14, 34)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 39)

  y = 55

  // ── SCORE CARDS ───────────────────────────────────────────────────────────
  // Roast Score
  fill(CARD)
  rect(10, y, 85, 28)
  color(PURPLE)
  font(8)
  doc.text('🔥 ROAST SCORE', 15, y + 7)
  color([255, 255, 255])
  font(22, 'bold')
  doc.text(`${result.roastScore}`, 15, y + 20)
  color(MUTED)
  font(10)
  doc.text('/100', 15 + doc.getTextWidth(`${result.roastScore}`) + 1, y + 20)
  color(PINK)
  font(8, 'bold')
  doc.text(result.roastLevel ?? '', 15, y + 26)

  // ATS Score
  fill(CARD)
  rect(105, y, 85, 28)
  color(GREEN)
  font(8)
  doc.text('📊 ATS SCORE', 110, y + 7)
  color([255, 255, 255])
  font(22, 'bold')
  doc.text(`${result.atsScore}`, 110, y + 20)
  color(MUTED)
  font(10)
  doc.text('/100', 110 + doc.getTextWidth(`${result.atsScore}`) + 1, y + 20)

  y += 35

  // ── FINAL VERDICT ─────────────────────────────────────────────────────────
  fill([50, 30, 80])
  stroke(PURPLE)
  doc.setLineWidth(0.3)
  doc.roundedRect(10, y, W - 20, 12, 3, 3, 'FD')
  color([255, 255, 255])
  font(11, 'bold')
  doc.text(result.finalVerdict ?? '', W / 2, y + 8, { align: 'center' })
  y += 18

  // ── ROAST SUMMARY ─────────────────────────────────────────────────────────
  sectionHeader('🔥 CV Roast')
  color(TEXT)
  font(9)
  y = wrapText(result.roastSummary ?? '', 16, y, W - 32, 5) + 3

  if (result.recruiterReaction) {
    fill([40, 20, 60])
    const rLines = doc.splitTextToSize(result.recruiterReaction, W - 36)
    rect(12, y - 2, W - 24, rLines.length * 5 + 6)
    color(PURPLE)
    font(9, 'bold')
    doc.text('👔 Recruiter Reaction', 16, y + 3)
    y += 7
    color(TEXT)
    font(9)
    y = wrapText(result.recruiterReaction, 16, y, W - 36, 5) + 5
  }

  if (result.funnyObservations?.length) {
    color(MUTED)
    font(8, 'bold')
    doc.text('Funny Observations', 16, y)
    y += 5
    result.funnyObservations.forEach((o) => bullet(o))
  }
  y += 3

  // ── STRENGTHS ─────────────────────────────────────────────────────────────
  sectionHeader('💪 What Your CV Does Well')
  result.strengths?.forEach((s) => bullet(s, GREEN))
  y += 3

  // ── WEAKNESSES ────────────────────────────────────────────────────────────
  sectionHeader('⚠️ Weaknesses')
  result.weaknesses?.forEach((w) => bullet(w, RED))
  y += 3

  // ── ATS BREAKDOWN ─────────────────────────────────────────────────────────
  sectionHeader('📊 ATS Compatibility')
  if (result.atsBreakdown) {
    progressBar('Keyword Optimization', result.atsBreakdown.keywordOptimization)
    progressBar('Formatting Compatibility', result.atsBreakdown.formattingCompatibility)
    progressBar('Section Completeness', result.atsBreakdown.sectionCompleteness)
  }
  y += 2

  // ── MISSING KEYWORDS ──────────────────────────────────────────────────────
  sectionHeader('🔍 Missing Keywords')
  result.missingKeywords?.forEach(({ keyword, reason }) => {
    if (y > 272) { doc.addPage(); y = 15 }
    color([250, 204, 21])
    font(9, 'bold')
    doc.text(`• ${keyword}`, 16, y)
    color(MUTED)
    font(8)
    wrapText(reason, 21, y + 4, W - 35, 4)
    y += doc.splitTextToSize(reason, W - 35).length * 4 + 8
  })
  y += 2

  // ── BEFORE / AFTER ────────────────────────────────────────────────────────
  if (result.beforeAfterExamples?.length) {
    sectionHeader('✨ Before & After Examples')
    result.beforeAfterExamples.forEach(({ before, after }, i) => {
      if (y > 260) { doc.addPage(); y = 15 }
      color(MUTED)
      font(8, 'bold')
      doc.text(`Example ${i + 1}`, 16, y)
      y += 5
      fill([60, 20, 20])
      const bLines = doc.splitTextToSize(before, W - 38)
      rect(14, y - 3, W - 28, bLines.length * 4.5 + 6)
      color(RED)
      font(7, 'bold')
      doc.text('BEFORE', 17, y + 1)
      color(TEXT)
      font(8)
      y = wrapText(before, 17, y + 6, W - 38, 4.5) + 4
      fill([20, 50, 35])
      const aLines = doc.splitTextToSize(after, W - 38)
      rect(14, y - 3, W - 28, aLines.length * 4.5 + 6)
      color(GREEN)
      font(7, 'bold')
      doc.text('AFTER', 17, y + 1)
      color(TEXT)
      font(8)
      y = wrapText(after, 17, y + 6, W - 38, 4.5) + 6
    })
  }

  // ── SUGGESTIONS ───────────────────────────────────────────────────────────
  sectionHeader('✅ How To Improve')
  result.suggestions?.forEach((s, i) => {
    if (y > 272) { doc.addPage(); y = 15 }
    color(GREEN)
    font(9, 'bold')
    doc.text(`${i + 1}.`, 16, y)
    color(TEXT)
    font(9)
    wrapText(s, 22, y, W - 35)
    y += doc.splitTextToSize(s, W - 35).length * 4.5 + 3
  })

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    color(MUTED)
    font(7)
    doc.text('AI CV Roaster — Get roasted. Get hired.', W / 2, 292, { align: 'center' })
    doc.text(`Page ${p} of ${pageCount}`, W - 14, 292, { align: 'right' })
  }

  doc.save(`cv-roast-report-${Date.now()}.pdf`)
}
