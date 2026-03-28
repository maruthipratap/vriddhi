import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  createForumPost,
  getForumPosts,
  replyToForumPost,
  toggleForumSolved,
  toggleForumUpvote,
} from '../../services/forum.service.js'

const categories = [
  { value: 'disease', label: 'Disease' },
  { value: 'seeds', label: 'Seeds' },
  { value: 'weather', label: 'Weather' },
  { value: 'scheme', label: 'Schemes' },
  { value: 'market', label: 'Market' },
  { value: 'general', label: 'General' },
]

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Forum() {
  const { accessToken, user } = useSelector((state) => state.auth)
  const [posts, setPosts] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [expandedPostId, setExpandedPostId] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [actionState, setActionState] = useState({})
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    cropType: '',
  })

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false

    async function loadPosts() {
      setLoading(true)
      setError('')
      try {
        const data = await getForumPosts({
          accessToken,
          category: activeCategory,
        })
        if (!cancelled) setPosts(data.posts)
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError('Your deployed backend does not have the updated forum routes yet. Redeploy the server to enable forum actions.')
          } else {
            setError(err.response?.data?.message || 'Failed to load forum posts')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPosts()
    return () => {
      cancelled = true
    }
  }, [accessToken, activeCategory])

  function resetForm() {
    setForm({
      title: '',
      content: '',
      category: 'general',
      cropType: '',
    })
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and description are required')
      return
    }

    setError('')
    setLoading(true)

    try {
      const post = await createForumPost({
        accessToken,
        post: {
          ...form,
          title: form.title.trim(),
          content: form.content.trim(),
          cropType: form.cropType.trim(),
        },
      })

      setPosts((current) => [{ ...post, isUpvoted: false, replyCount: 0, replies: [] }, ...current])
      setShowForm(false)
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post question')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpvote(postId) {
    setActionState((current) => ({ ...current, [`upvote-${postId}`]: true }))
    try {
      const result = await toggleForumUpvote({ accessToken, postId })
      setPosts((current) => current.map((post) => (
        post._id === postId
          ? { ...post, upvotes: result.upvotes, isUpvoted: result.isUpvoted }
          : post
      )))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update upvote')
    } finally {
      setActionState((current) => ({ ...current, [`upvote-${postId}`]: false }))
    }
  }

  async function handleReply(postId) {
    const content = (replyDrafts[postId] || '').trim()
    if (!content) return

    setActionState((current) => ({ ...current, [`reply-${postId}`]: true }))
    try {
      const result = await replyToForumPost({ accessToken, postId, content })
      setPosts((current) => current.map((post) => (
        post._id === postId
          ? {
              ...post,
              replies: [...(post.replies || []), result.reply],
              replyCount: result.replyCount,
            }
          : post
      )))
      setReplyDrafts((current) => ({ ...current, [postId]: '' }))
      setExpandedPostId(postId)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post reply')
    } finally {
      setActionState((current) => ({ ...current, [`reply-${postId}`]: false }))
    }
  }

  async function handleSolve(postId) {
    setActionState((current) => ({ ...current, [`solve-${postId}`]: true }))
    try {
      const result = await toggleForumSolved({ accessToken, postId })
      setPosts((current) => current.map((post) => (
        post._id === postId
          ? { ...post, isSolved: result.isSolved, solvedAt: result.solvedAt }
          : post
      )))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update solved status')
    } finally {
      setActionState((current) => ({ ...current, [`solve-${postId}`]: false }))
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker text-white/70">Community Exchange</p>
            <h1 className="mt-2 text-2xl font-heading font-bold text-white">Farmer Forum</h1>
            <p className="mt-2 text-sm text-white/75">
              Ask questions, share local knowledge, and close the loop when a solution works.
            </p>
          </div>
          <button
            onClick={() => setShowForm((value) => !value)}
            className="btn-accent"
          >
            {showForm ? 'Close' : 'Ask Question'}
          </button>
        </div>
      </div>

      <div className="section-container mt-6 space-y-5">
        {showForm && (
          <div className="panel p-5 space-y-4">
            <h2 className="font-heading text-xl text-foreground">Ask a Question</h2>
            <input
              className="input"
              placeholder="Question title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="input min-h-24 resize-none"
              placeholder="Describe your problem in detail..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <input
                className="input"
                placeholder="Crop type (optional)"
                value={form.cropType}
                onChange={(e) => setForm({ ...form, cropType: e.target.value })}
              />
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn-primary flex-1" disabled={isLoading}>
                {isLoading ? 'Posting...' : 'Post Question'}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {[{ value: '', label: 'All' }, ...categories].map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === category.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="panel p-8 text-center text-muted-foreground">
            No questions yet in this category. Be the first to ask one.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const authorId = String(post.authorId || '')
              const currentUserId = String(user?.id || user?._id || '')
              const isAuthor = authorId === currentUserId
              const isExpanded = expandedPostId === post._id
              const categoryLabel = categories.find((category) => category.value === post.category)?.label || 'General'

              return (
                <div key={post._id} className="panel p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                          {categoryLabel}
                        </span>
                        {post.isSolved && (
                          <span className="badge-green">Solved</span>
                        )}
                        {post.cropType && (
                          <span className="rounded-full bg-white border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                            {post.cropType}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-xl font-heading text-foreground">{post.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{post.content}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>{post.authorName}</span>
                        {post.location?.district && <span>{post.location.district}</span>}
                        <span>{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:w-[220px] lg:flex-col">
                      <button
                        onClick={() => handleUpvote(post._id)}
                        disabled={!!actionState[`upvote-${post._id}`]}
                        className={`btn-outline justify-center ${post.isUpvoted ? 'border-primary text-primary bg-secondary' : ''}`}
                      >
                        {post.isUpvoted ? 'Upvoted' : 'Upvote'} ({post.upvotes || 0})
                      </button>
                      <button
                        onClick={() => setExpandedPostId(isExpanded ? '' : post._id)}
                        className="btn-outline justify-center"
                      >
                        Replies ({post.replyCount || post.replies?.length || 0})
                      </button>
                      {isAuthor && (
                        <button
                          onClick={() => handleSolve(post._id)}
                          disabled={!!actionState[`solve-${post._id}`]}
                          className="btn-primary justify-center"
                        >
                          {post.isSolved ? 'Mark Open' : 'Mark Solved'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 border-t border-border pt-5">
                      <div className="space-y-3">
                        {(post.replies || []).length ? (
                          post.replies.map((reply, index) => (
                            <div key={`${post._id}-reply-${index}`} className="rounded-2xl bg-secondary p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-foreground">{reply.authorName}</p>
                                <p className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</p>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{reply.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border bg-white p-4 text-sm text-muted-foreground">
                            No replies yet. Start the discussion.
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <textarea
                          className="input min-h-20 resize-none"
                          placeholder="Write a helpful reply..."
                          value={replyDrafts[post._id] || ''}
                          onChange={(e) => setReplyDrafts((current) => ({ ...current, [post._id]: e.target.value }))}
                        />
                        <button
                          onClick={() => handleReply(post._id)}
                          disabled={!!actionState[`reply-${post._id}`]}
                          className="btn-primary self-end"
                        >
                          {actionState[`reply-${post._id}`] ? 'Replying...' : 'Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
