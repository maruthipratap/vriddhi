import mongoose from 'mongoose'
import { z } from 'zod'

export const createForumPostSchema = z.object({
  title: z.string().min(8).max(160).trim(),
  content: z.string().min(20).max(2000).trim(),
  category: z.enum(['disease', 'seeds', 'weather', 'scheme', 'market', 'general']).default('general'),
  cropType: z.string().max(60).trim().optional().or(z.literal('')),
})

export const createForumReplySchema = z.object({
  content: z.string().min(4).max(800).trim(),
})

const forumPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 160,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['disease', 'seeds', 'weather', 'scheme', 'market', 'general'],
      default: 'general',
      index: true,
    },
    cropType: {
      type: String,
      default: '',
      trim: true,
      maxlength: 60,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    upvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isSolved: {
      type: Boolean,
      default: false,
    },
    solvedAt: {
      type: Date,
      default: null,
    },
    solvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    location: {
      district: { type: String, default: '' },
      state: { type: String, default: '' },
    },
    replies: [{
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      authorName: {
        type: String,
        required: true,
        trim: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 800,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  { timestamps: true }
)

forumPostSchema.index({ createdAt: -1 })
forumPostSchema.index({ title: 'text', content: 'text', cropType: 'text' })

const ForumPost = mongoose.model('ForumPost', forumPostSchema)
export default ForumPost
