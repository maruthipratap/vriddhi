import nodemailer from 'nodemailer'

// ─────────────────────────────────────────────────────────────
// TRANSPORT
// Uses SMTP_* env vars in production; falls back to Ethereal
// (catch-all test inbox) in development so emails never escape.
// ─────────────────────────────────────────────────────────────
let transport

async function getTransport() {
  if (transport) return transport

  if (process.env.SMTP_HOST) {
    transport = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // Development — Ethereal test account (mails visible at ethereal.email)
    const testAccount = await nodemailer.createTestAccount()
    transport = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('[mailer] No SMTP config — using Ethereal test account:', testAccount.user)
  }

  return transport
}

const FROM = process.env.SMTP_FROM || '"Vriddhi" <noreply@vriddhi.in>'

// ─────────────────────────────────────────────────────────────
// INTERNAL SEND HELPER
// ─────────────────────────────────────────────────────────────
async function send({ to, subject, html }) {
  try {
    const t    = await getTransport()
    const info = await t.sendMail({ from: FROM, to, subject, html })
    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) console.log('[mailer] Preview:', previewUrl)
    }
  } catch (err) {
    // Never let a failed email crash the request
    console.error('[mailer] Send failed:', err.message)
  }
}

// ─────────────────────────────────────────────────────────────
// PUBLIC NOTIFICATION METHODS
// ─────────────────────────────────────────────────────────────

/**
 * Email sent after a farmer registers.
 * @param {{ name: string, email: string }} user
 */
export async function sendWelcomeEmail(user) {
  await send({
    to:      user.email,
    subject: 'Welcome to Vriddhi!',
    html:    `<p>Hi ${user.name},</p>
              <p>Welcome to Vriddhi — your hyperlocal agri marketplace.</p>
              <p>Start exploring nearby shops and products today.</p>`,
  })
}

/**
 * Email with OTP for password reset.
 * @param {{ name: string, email: string }} user
 * @param {string} otp
 */
export async function sendPasswordResetEmail(user, otp) {
  await send({
    to:      user.email,
    subject: 'Vriddhi — Reset your password',
    html:    `<p>Hi ${user.name},</p>
              <p>Your password reset OTP is: <strong>${otp}</strong></p>
              <p>It expires in 15 minutes. If you did not request this, ignore this email.</p>`,
  })
}

/**
 * Notify a farmer their order status changed.
 * @param {{ name: string, email: string }} farmer
 * @param {{ orderNumber: string, status: string }} order
 */
export async function sendOrderStatusEmail(farmer, order) {
  const statusLabel = {
    confirmed:        'Confirmed',
    processing:       'Being Prepared',
    ready:            'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    delivered:        'Delivered',
    cancelled:        'Cancelled',
  }[order.status] || order.status

  await send({
    to:      farmer.email,
    subject: `Order ${order.orderNumber} — ${statusLabel}`,
    html:    `<p>Hi ${farmer.name},</p>
              <p>Your order <strong>${order.orderNumber}</strong> is now <strong>${statusLabel}</strong>.</p>`,
  })
}

/**
 * Notify a shop owner about a new incoming order.
 * @param {{ name: string, email: string }} shopOwner
 * @param {{ orderNumber: string, total: number }} order
 */
export async function sendNewOrderEmail(shopOwner, order) {
  await send({
    to:      shopOwner.email,
    subject: `New Order — ${order.orderNumber}`,
    html:    `<p>Hi ${shopOwner.name},</p>
              <p>You have a new order <strong>${order.orderNumber}</strong> worth ₹${(order.total / 100).toFixed(2)}.</p>
              <p>Log in to your dashboard to confirm it.</p>`,
  })
}

/**
 * Alert a shop owner that a product is running low on stock.
 * @param {{ name: string, email: string }} shopOwner
 * @param {{ productName: string, stockQuantity: number }} product
 */
export async function sendLowStockAlert(shopOwner, product) {
  await send({
    to:      shopOwner.email,
    subject: `Low Stock Alert — ${product.productName}`,
    html:    `<p>Hi ${shopOwner.name},</p>
              <p>Your product <strong>${product.productName}</strong> is running low on stock.</p>
              <p>Current stock: <strong>${product.stockQuantity}</strong> units remaining.</p>
              <p>Please restock soon to avoid losing sales.</p>`,
  })
}

/**
 * Notify an admin that a new shop needs verification.
 * @param {{ shopName: string, ownerName: string }} shop
 */
export async function sendShopVerificationAlert(shop) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return
  await send({
    to:      adminEmail,
    subject: `New Shop Pending Verification — ${shop.shopName}`,
    html:    `<p>Shop <strong>${shop.shopName}</strong> (owner: ${shop.ownerName}) is waiting for admin verification.</p>`,
  })
}
