import PDFDocument from 'pdfkit'
import type { PriceBreakdown } from '@/components/SeasonalPriceCalculator'

interface BookingData {
  clientName: string
  clientEmail: string
  clientPhone?: string
  yachtName: string
  startDate: string
  endDate: string
  guests?: number
  priceBreakdown: PriceBreakdown
  currency: string
  taxPercentage: number
  apaPercentage: number
}

export function generateBookingPDF(data: BookingData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        autoFirstPage: true,
      })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
      doc.on('error', reject)

      // Company Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#002366') // luxury-blue
        .text('Balearic & Costa Blanca Charters', { align: 'center' })
        .moveDown(0.5)

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Premium Yacht Charter Services', { align: 'center' })
        .moveDown(1)

      // Contact Info
      doc
        .fontSize(10)
        .fillColor('#333333')
        .text('Phone: +34 680 957 096', { align: 'center' })
        .moveDown(0.3)

      // Divider
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor('#D4AF37') // luxury-gold
        .lineWidth(2)
        .stroke()
        .moveDown(1)

      // Title
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#002366')
        .text('Charter Booking Offer', { align: 'center' })
        .moveDown(1)

      // Client Information
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('Client Information:', { continued: false })
        .moveDown(0.3)

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Name: ${data.clientName}`)
        .text(`Email: ${data.clientEmail}`)
      if (data.clientPhone) {
        doc.text(`Phone: ${data.clientPhone}`)
      }
      doc.moveDown(0.5)

      // Charter Details
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('Charter Details:', { continued: false })
        .moveDown(0.3)

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Yacht: ${data.yachtName}`)
        .text(`Period: ${data.startDate} to ${data.endDate}`)
        .text(`Duration: ${data.priceBreakdown.days} ${data.priceBreakdown.days === 1 ? 'day' : 'days'}`)
      if (data.guests) {
        doc.text(`Number of Guests: ${data.guests}`)
      }
      doc.text(`Season: ${data.priceBreakdown.primarySeason.toUpperCase()}`)
      doc.moveDown(1)

      // Price Breakdown
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#002366')
        .text('Price Breakdown', { align: 'center' })
        .moveDown(0.5)

      // Table Header
      const tableTop = doc.y
      const itemHeight = 25
      const leftColumn = 50
      const rightColumn = 400

      // Base Charter Fee
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Base Charter Fee', leftColumn, tableTop)
      doc
        .font('Helvetica-Bold')
        .text(
          formatCurrency(data.priceBreakdown.baseCharterFee, data.currency),
          rightColumn,
          tableTop,
          { align: 'right', width: 145 }
        )

      // IVA
      const ivaY = tableTop + itemHeight
      doc
        .font('Helvetica')
        .fillColor('#666666')
        .text(`IVA (${data.taxPercentage}%)`, leftColumn, ivaY)
      doc
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text(
          formatCurrency(data.priceBreakdown.taxAmount, data.currency),
          rightColumn,
          ivaY,
          { align: 'right', width: 145 }
        )

      // APA
      const apaY = ivaY + itemHeight
      doc
        .font('Helvetica')
        .fillColor('#666666')
        .text(`APA (${data.apaPercentage}%)`, leftColumn, apaY)
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#999999')
        .text('Advance Provisioning Allowance', leftColumn + 5, apaY + 12, { width: 300 })
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#333333')
        .text(
          formatCurrency(data.priceBreakdown.apaAmount, data.currency),
          rightColumn,
          apaY,
          { align: 'right', width: 145 }
        )

      // Fixed Fees
      if (data.priceBreakdown.fixedFees > 0) {
        const fixedY = apaY + itemHeight + 5
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor('#666666')
          .text('Fixed Fees', leftColumn, fixedY)
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#999999')
          .text('Crew Service Fee + Cleaning Fee', leftColumn + 5, fixedY + 12, { width: 300 })
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#333333')
          .text(
            formatCurrency(data.priceBreakdown.fixedFees, data.currency),
            rightColumn,
            fixedY,
            { align: 'right', width: 145 }
          )
      }

      // Total Line
      const totalY = doc.y + itemHeight + 10
      doc
        .moveTo(50, totalY - 5)
        .lineTo(545, totalY - 5)
        .strokeColor('#D4AF37')
        .lineWidth(1)
        .stroke()

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#002366')
        .text('TOTAL ESTIMATE', leftColumn, totalY)
      doc
        .fontSize(18)
        .text(
          formatCurrency(data.priceBreakdown.totalEstimate, data.currency),
          rightColumn,
          totalY,
          { align: 'right', width: 145 }
        )

      // Footer
      const footerY = 750
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#999999')
        .text(
          'This is an estimate. Final pricing may vary based on specific requirements and availability.',
          leftColumn,
          footerY,
          { align: 'center', width: 495 }
        )
        .moveDown(0.5)
      doc
        .text(
          'Balearic & Costa Blanca Charters | +34 680 957 096',
          leftColumn,
          doc.y,
          { align: 'center', width: 495 }
        )

      doc.end()
    } catch (error) {
      console.error('[PDFGenerator] Error creating PDF:', error)
      reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

function formatCurrency(amount: number | null, currency: string = 'EUR'): string {
  if (amount === null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
