import Equipment from '../models/Equipment.js'

const equipmentRepository = {

  // ── Create equipment listing ───────────────────────────────
  async create(data) {
    const equipment = new Equipment(data)
    await equipment.save()
    return equipment
  },

  // ── Find by ID ─────────────────────────────────────────────
  async findById(id) {
    return Equipment.findById(id).lean()
  },

  // ── Find by owner ──────────────────────────────────────────
  async findByOwnerId(ownerId) {
    return Equipment.find({ ownerId }).sort({ createdAt: -1 }).lean()
  },

  // ── Find nearby equipment ──────────────────────────────────
  // Uses 2dsphere index — fast geo query on Equipment collection
  async findNearby({ lat, lng, radiusKm = 30, category, limit = 50, skip = 0 }) {
    const query = {
      isAvailable: true,
      ...(category && category !== 'all' ? { category } : {}),
    }

    return Equipment.find({
      ...query,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,   // metres
        },
      },
    })
      .skip(skip)
      .limit(limit)
      .lean()
  },

  // ── Update by ID ───────────────────────────────────────────
  async updateById(id, data) {
    return Equipment.findByIdAndUpdate(id, { $set: data }, { new: true }).lean()
  },

  // ── Add images ─────────────────────────────────────────────
  async addImages(id, imageUrls) {
    return Equipment.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    ).lean()
  },

  // ── Soft delete ────────────────────────────────────────────
  async softDelete(id) {
    return Equipment.findByIdAndUpdate(id, {
      isDeleted:   true,
      deletedAt:   new Date(),
      isAvailable: false,
    }).lean()
  },

  // ── Toggle availability ────────────────────────────────────
  async setAvailability(id, isAvailable) {
    return Equipment.findByIdAndUpdate(id, { $set: { isAvailable } }, { new: true }).lean()
  },

  // ── Increment rental count ─────────────────────────────────
  async incrementRentalCount(id) {
    return Equipment.findByIdAndUpdate(id, { $inc: { totalRentals: 1 } }).lean()
  },

  // ── Owner + ID check (BOLA protection) ────────────────────
  async findByIdAndOwner(id, ownerId) {
    return Equipment.findOne({ _id: id, ownerId }).lean()
  },
}

export default equipmentRepository
