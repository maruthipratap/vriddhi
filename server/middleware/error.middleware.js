import { ZodError } from 'zod'

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// All errors flow here via next(err) in controllers
// Single place to handle all error types consistently
// ─────────────────────────────────────────────────────────────
export function errorHandler(err, req, res, next) {

  // Log error — but sanitize sensitive data (VULN-015)
  console.error({
    message:  err.message,
    code:     err.code,
    stack:    process.env.NODE_ENV === 'development'
              ? err.stack : undefined,
    path:     req.path,
    method:   req.method,
    userId:   req.user?.id || 'guest',
    // Never log: passwords, tokens, card numbers
  })

  // ── Zod Validation Error ──────────────────────────────────
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code:    'VALIDATION_ERROR',
      errors:  err.errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }))
    })
  }

  // ── Mongoose Duplicate Key ────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code:    'DUPLICATE_KEY',
    })
  }

  // ── Mongoose Validation Error ─────────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field:   e.path,
      message: e.message,
    }))
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code:    'VALIDATION_ERROR',
      errors,
    })
  }

  // ── Mongoose Cast Error (invalid ObjectId) ────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      code:    'INVALID_ID',
    })
  }

  // ── Known app errors (thrown with status + code) ──────────
  if (err.status && err.code) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code:    err.code,
    })
  }

  // ── Unknown errors ────────────────────────────────────────
  // Never expose internal error details in production
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
             ? err.message
             : 'Something went wrong. Please try again.',
    code:    'INTERNAL_SERVER_ERROR',
  })
}

// ─────────────────────────────────────────────────────────────
// 404 HANDLER
// Catch all unmatched routes
// ─────────────────────────────────────────────────────────────
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code:    'NOT_FOUND',
  })
}