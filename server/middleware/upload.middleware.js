import multer       from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import config        from '../config/index.js'

// Configure Cloudinary once on module load
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key:    config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

// ─────────────────────────────────────────────────────────────
// MULTER — memory storage, 5 MB limit, images only
// Files land in req.file.buffer ready for Cloudinary
// ─────────────────────────────────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('Only image files are allowed'), { code: 'INVALID_FILE_TYPE' }))
    }
    cb(null, true)
  },
})

// ─────────────────────────────────────────────────────────────
// CLOUDINARY HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer  - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder, e.g. 'shops' | 'products'
 * @returns {{ url: string, publicId: string }}
 */
export function uploadToCloudinary(buffer, folder = 'vriddhi') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

/**
 * Delete an asset from Cloudinary by its public_id.
 * @param {string} publicId
 */
export function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId)
}
