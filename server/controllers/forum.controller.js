import ForumPost, {
  createForumPostSchema,
  createForumReplySchema,
} from '../models/ForumPost.js'

export async function listPosts(req, res, next) {
  try {
    const { category, search } = req.query
    const filters = {}

    if (category) filters.category = category
    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      filters.$or = [
        { title: regex },
        { content: regex },
        { cropType: regex },
        { authorName: regex },
      ]
    }

    const posts = await ForumPost
      .find(filters)
      .sort({ isSolved: 1, createdAt: -1 })
      .limit(50)
      .lean()

    const normalizedPosts = posts.map((post) => ({
      ...post,
      isUpvoted: post.upvotedBy?.some((id) => String(id) === req.user.id) || false,
      replyCount: post.replies?.length || 0,
      upvotedBy: undefined,
    }))

    res.status(200).json({
      success: true,
      data: { posts: normalizedPosts, count: normalizedPosts.length },
    })
  } catch (err) {
    next(err)
  }
}

export async function toggleUpvote(req, res, next) {
  try {
    const post = await ForumPost.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found',
        code: 'POST_NOT_FOUND',
      })
    }

    const existingIndex = post.upvotedBy.findIndex((id) => String(id) === req.user.id)
    if (existingIndex >= 0) {
      post.upvotedBy.splice(existingIndex, 1)
    } else {
      post.upvotedBy.push(req.user.id)
    }

    post.upvotes = post.upvotedBy.length
    await post.save()

    res.status(200).json({
      success: true,
      data: {
        postId: post._id,
        upvotes: post.upvotes,
        isUpvoted: existingIndex < 0,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function addReply(req, res, next) {
  try {
    const validated = createForumReplySchema.parse(req.body)
    const post = await ForumPost.findById(req.params.postId)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found',
        code: 'POST_NOT_FOUND',
      })
    }

    const reply = {
      authorId: req.user.id,
      authorName: req.user.name,
      content: validated.content,
      createdAt: new Date(),
    }

    post.replies.push(reply)
    await post.save()

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      data: {
        reply: post.replies[post.replies.length - 1],
        replyCount: post.replies.length,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function updateSolvedState(req, res, next) {
  try {
    const post = await ForumPost.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found',
        code: 'POST_NOT_FOUND',
      })
    }

    if (String(post.authorId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the post author can change solved status',
        code: 'FORBIDDEN',
      })
    }

    post.isSolved = !post.isSolved
    post.solvedAt = post.isSolved ? new Date() : null
    post.solvedBy = post.isSolved ? req.user.id : null
    await post.save()

    res.status(200).json({
      success: true,
      data: {
        postId: post._id,
        isSolved: post.isSolved,
        solvedAt: post.solvedAt,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function createPost(req, res, next) {
  try {
    const validated = createForumPostSchema.parse(req.body)

    const post = await ForumPost.create({
      ...validated,
      authorId: req.user.id,
      authorName: req.user.name,
      location: {
        district: req.user.district || '',
        state: req.user.state || '',
      },
    })

    res.status(201).json({
      success: true,
      message: 'Question posted successfully',
      data: { post },
    })
  } catch (err) {
    next(err)
  }
}
