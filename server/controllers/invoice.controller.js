import PDFDocument from 'pdfkit'
import orderRepository from '../repositories/order.repository.js'

export async function downloadInvoice(req, res, next) {
  try {
    const { id } = req.params
    const order = await orderRepository.findById(id)

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Auth check: only the buyer or seller can download the invoice
    const userId = req.user.id.toString()
    const isFarmer = order.farmerId.toString() === userId
    const isShop   = order.shopId.toString() === userId

    if (!isFarmer && !isShop && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`)

    const doc = new PDFDocument({ margin: 50 })
    doc.pipe(res)

    // Helper functions
    const fmt = (paise) => `Rs ${(paise / 100).toFixed(2)}`
    
    // Header
    doc
      .fontSize(20)
      .text('TAX INVOICE', { align: 'center' })
      .moveDown()

    // Shop Info vs Buyer Info (Side by side)
    doc.fontSize(10)
    doc.text(`Shop Name: ${order.items[0]?.productName?.split(' ')[0] || 'Vriddhi Seller'}`, 50, 100) // Generic fallback, but you could lookup Shop details
    doc.text(`Order Number: ${order.orderNumber}`, 50, 115)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 50, 130)

    doc.text(`Buyer ID: ${order.farmerId}`, 350, 100)
    doc.text(`Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}`, 350, 115)
    doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, 350, 130)

    doc.moveDown()
    doc.moveTo(50, 160).lineTo(550, 160).stroke()

    // Table Header
    doc.font('Helvetica-Bold')
    doc.text('Item', 50, 180)
    doc.text('Qty', 350, 180)
    doc.text('Price', 400, 180)
    doc.text('Total', 480, 180)
    
    doc.moveTo(50, 195).lineTo(550, 195).stroke()
    
    // Table Rows
    doc.font('Helvetica')
    let yPosition = 210
    
    order.items.forEach((item) => {
      doc.text(item.productName, 50, yPosition, { width: 280 })
      doc.text(`${item.quantity} ${item.unit}`, 350, yPosition)
      doc.text(fmt(item.priceAtOrder), 400, yPosition)
      doc.text(fmt(item.subtotal), 480, yPosition)
      yPosition += 20
    })

    doc.moveTo(50, yPosition + 10).lineTo(550, yPosition + 10).stroke()
    yPosition += 30

    // Footer Pricing
    doc.font('Helvetica-Bold')
    doc.text('Subtotal:', 400, yPosition)
    doc.font('Helvetica')
    doc.text(fmt(order.pricing.subtotal), 480, yPosition)
    yPosition += 20
    
    // Indian GST Breakdown (Assuming 18% inclusive or exclusive, for display we show mathematical splits)
    const gstAmount = Math.round(order.pricing.subtotal * 0.18) // 18% GST estimate for Agri goods if applicable
    const cgst = Math.round(gstAmount / 2)
    const sgst = Math.round(gstAmount / 2)

    doc.font('Helvetica-Bold')
    doc.text('CGST (9%):', 400, yPosition)
    doc.font('Helvetica')
    doc.text(fmt(cgst), 480, yPosition)
    yPosition += 20

    doc.font('Helvetica-Bold')
    doc.text('SGST (9%):', 400, yPosition)
    doc.font('Helvetica')
    doc.text(fmt(sgst), 480, yPosition)
    yPosition += 20

    doc.font('Helvetica-Bold')
    doc.text('Delivery Fee:', 400, yPosition)
    doc.font('Helvetica')
    doc.text(order.pricing.deliveryFee > 0 ? fmt(order.pricing.deliveryFee) : 'Free', 480, yPosition)
    yPosition += 20

    if (order.pricing.discount > 0) {
      doc.font('Helvetica-Bold')
      doc.text('Discount:', 400, yPosition)
      doc.font('Helvetica')
      doc.text(`-${fmt(order.pricing.discount)}`, 480, yPosition)
      yPosition += 20
    }

    doc.moveTo(400, yPosition).lineTo(550, yPosition).stroke()
    yPosition += 10

    doc.font('Helvetica-Bold')
    doc.fontSize(12)
    doc.text('Total:', 400, yPosition)
    doc.text(fmt(order.pricing.total), 480, yPosition)

    // Finalizing PDF
    doc.end()

  } catch (err) {
    next(err)
  }
}
