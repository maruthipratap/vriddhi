import fs from 'fs'

let s = fs.readFileSync('models/Shop.js', 'utf8')
const idx = s.indexOf('// HOOKS')

const newHooks = `// HOOKS
// ─────────────────────────────────────────────────────────────
shopSchema.pre('save', async function () {
  if (this.isModified('shopName')) {
    const base = slugify(this.shopName, { lower: true, strict: true })
    let slug = base
    let count = 0
    while (await mongoose.model('Shop').findOne({ slug, _id: { $ne: this._id } })) {
      count++
      slug = \`\${base}-\${count}\`
    }
    this.slug = slug
  }
})

shopSchema.pre(/^find/, function () {
  const options = this.getOptions() || {}
  if (!options.includeDeleted) {
    this.where({ isDeleted: false })
  }
})

const Shop = mongoose.model('Shop', shopSchema)
export default Shop
`

fs.writeFileSync('models/Shop.js', s.substring(0, idx) + newHooks, 'utf8')
console.log('Shop hooks completely overwritten.')
