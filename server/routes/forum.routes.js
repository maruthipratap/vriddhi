import { Router } from 'express'
import {
  addReply,
  createPost,
  listPosts,
  toggleUpvote,
  updateSolvedState,
} from '../controllers/forum.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)
router.get('/', listPosts)
router.post('/', createPost)
router.post('/:postId/replies', addReply)
router.post('/:postId/upvote', toggleUpvote)
router.patch('/:postId/solve', updateSolvedState)

export default router
