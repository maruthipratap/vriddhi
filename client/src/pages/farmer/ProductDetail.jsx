import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct } from '../../store/slices/productSlice.js'
import { addToCart } from '../../store/slices/orderSlice.js'
import reviewService from '../../services/review.service.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import { CATEGORY_ICON_NAMES } from '../../utils/iconMaps.js'

function StarDisplay({ rating }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-border'}>★</span>
      ))}
    </span>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const product = useSelector((s) => s.products.current)
  const [qty,     setQty]     = useState(1)
  const [added,   setAdded]   = useState(false)
  const [activeImg,      setActiveImg]     = useState(0)
  const [reviews,        setReviews]       = useState([])
  const [revPage,        setRevPage]       = useState(1)
  const [revMeta,        setRevMeta]       = useState(null)
  const [productReviews, setProductReviews] = useState([])
  const [prodRevPage,    setProdRevPage]   = useState(1)
  const [prodRevMeta,    setProdRevMeta]   = useState(null)

  const prevImg = useCallback(() =>
    setActiveImg(i => (i - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1)),
  [product?.images?.length])

  const nextImg = useCallback(() =>
    setActiveImg(i => (i + 1) % (product?.images?.length || 1)),
  [product?.images?.length])

  useEffect(() => {
    dispatch(fetchProduct(id))
  }, [dispatch, id])

  // Load shop reviews once product is loaded
  useEffect(() => {
    if (!product?.shopId) return
    reviewService.getShopReviews(product.shopId, revPage)
      .then(data => {
        setReviews(prev => revPage === 1 ? data.reviews : [...prev, ...data.reviews])
        setRevMeta(data)
      })
      .catch(() => {})
  }, [product?.shopId, revPage])

  // Load product reviews
  useEffect(() => {
    if (!id) return
    reviewService.getProductReviews(id, prodRevPage)
      .then(data => {
        setProductReviews(prev => prodRevPage === 1 ? data.reviews : [...prev, ...data.reviews])
        setProdRevMeta(data)
      })
      .catch(() => {})
  }, [id, prodRevPage])

  if (!product) {
    return (
      <div className="dashboard-page flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: product._id,
      productName: product.name,
      price: product.basePrice,
      unit: product.unit,
      quantity: qty,
      shopId: product.shopId,
    }))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="dashboard-page pb-28 pt-14 md:pt-0">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/15"
          >
            <IconGlyph name="arrowRight" size={18} className="rotate-180" />
          </button>
          <div>
            <p className="section-kicker text-white/70">Product</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-white">Product Details</h2>
          </div>
        </div>
      </div>

      <div className="section-container mt-6 space-y-4">
        {/* Image gallery */}
        <div className="panel overflow-hidden p-0">
          <div className="relative h-56 w-full bg-secondary">
            {product.images?.length > 0 ? (
              <>
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                    >‹</button>
                    <button
                      onClick={nextImg}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                    >›</button>
                    {/* Dot indicators */}
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {product.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === activeImg ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <IconGlyph
                  name={CATEGORY_ICON_NAMES[product.category] || 'box'}
                  size={72}
                  className="text-primary"
                />
              </div>
            )}
          </div>
          {/* Thumbnail strip */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === activeImg ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{product.name}</h1>
          {product.brand && (
            <p className="mt-1 text-sm text-muted-foreground">by {product.brand}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <p className="text-2xl font-bold text-primary">Rs {(product.basePrice / 100).toFixed(0)}</p>
            <span className="text-sm text-muted-foreground">per {product.unit}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.isOrganic && (
            <span className="badge-green inline-flex items-center gap-1">
              <IconGlyph name="leaf" size={12} />
              Organic
            </span>
          )}
          {product.isAvailable ? (
            <span className="badge-green inline-flex items-center gap-1">
              <IconGlyph name="check" size={12} />
              In Stock ({product.stockQuantity} {product.unit})
            </span>
          ) : (
            <span className="badge-red">Out of Stock</span>
          )}
        </div>

        {product.description && (
          <div className="panel p-5">
            <p className="mb-2 text-sm font-semibold text-foreground">Description</p>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
        )}

        {product.seedDetails && (
          <div className="panel p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">Seed Details</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.seedDetails.variety && (
                <div>
                  <p className="text-xs text-muted-foreground">Variety</p>
                  <p className="font-medium text-foreground">{product.seedDetails.variety}</p>
                </div>
              )}
              {product.seedDetails.daysToHarvest && (
                <div>
                  <p className="text-xs text-muted-foreground">Days to Harvest</p>
                  <p className="font-medium text-foreground">{product.seedDetails.daysToHarvest} days</p>
                </div>
              )}
              {product.seedDetails.germinationRate && (
                <div>
                  <p className="text-xs text-muted-foreground">Germination Rate</p>
                  <p className="font-medium text-foreground">{product.seedDetails.germinationRate}%</p>
                </div>
              )}
              {product.seedDetails.isHybrid && (
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground">Hybrid</p>
                </div>
              )}
            </div>
            {product.seedDetails.suitableSeasons?.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs text-muted-foreground">Suitable Seasons</p>
                <div className="flex flex-wrap gap-1">
                  {product.seedDetails.suitableSeasons.map((season) => (
                    <span key={season} className="badge-gold capitalize">{season}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Product Reviews ───────────────────────────────── */}
        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Product Reviews
              {prodRevMeta && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({prodRevMeta.total})
                </span>
              )}
            </p>
            {product.totalReviews > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-sm">★</span>
                <span className="text-sm font-bold text-foreground">{product.rating?.toFixed(1)}</span>
              </div>
            )}
          </div>

          {productReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No product reviews yet. Be the first to review after purchase!</p>
          ) : (
            <div className="space-y-3">
              {productReviews.map((r) => (
                <div key={r._id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{r.farmerId?.name || 'Farmer'}</p>
                    <StarDisplay rating={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {prodRevMeta && prodRevPage < prodRevMeta.totalPages && (
            <button
              onClick={() => setProdRevPage(p => p + 1)}
              className="mt-3 w-full rounded-xl border border-border py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
            >
              Load more
            </button>
          )}
        </div>

        {/* ── Shop Reviews ─────────────────────────────────── */}
        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Shop Reviews
              {revMeta && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({revMeta.total})
                </span>
              )}
            </p>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {r.farmerId?.name || 'Farmer'}
                    </p>
                    <StarDisplay rating={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {revMeta && revPage < revMeta.totalPages && (
            <button
              onClick={() => setRevPage(p => p + 1)}
              className="mt-3 w-full rounded-xl border border-border py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
            >
              Load more reviews
            </button>
          )}
        </div>

        {product.isAvailable && (
          <div className="panel p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">Quantity</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty((current) => Math.max(product.minOrderQty || 1, current - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xl font-bold text-foreground"
              >
                -
              </button>
              <span className="w-8 text-center text-xl font-bold text-foreground">{qty}</span>
              <button
                onClick={() => setQty((current) => current + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">{product.unit}</span>
            </div>
            <p className="mt-2 font-bold text-primary">
              Total: Rs {((product.basePrice * qty) / 100).toFixed(0)}
            </p>
          </div>
        )}
      </div>

      {product.isAvailable && (
        <div className="fixed bottom-16 left-0 right-0 bg-background/95 px-4 pb-2 pt-2 backdrop-blur md:bottom-4 md:left-[calc(18rem+1rem)] md:right-6 md:bg-transparent md:px-0 md:pb-0 md:pt-0">
          <button
            onClick={handleAddToCart}
            className={`w-full rounded-2xl py-4 text-lg font-bold transition-all ${
              added ? 'bg-green-500 text-white' : 'btn-primary'
            }`}
          >
            {added ? 'Added to Cart!' : `Add to Cart - Rs ${((product.basePrice * qty) / 100).toFixed(0)}`}
          </button>
        </div>
      )}
    </div>
  )
}
