import api from './api.js'

export async function getForumPosts({ accessToken, category = '', search = '' }) {
  const res = await api.get('/forum', {
    params: { category, search },
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return res.data.data
}

export async function createForumPost({ accessToken, post }) {
  const res = await api.post('/forum', post, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return res.data.data.post
}

export async function toggleForumUpvote({ accessToken, postId }) {
  const res = await api.post(`/forum/${postId}/upvote`, {}, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return res.data.data
}

export async function replyToForumPost({ accessToken, postId, content }) {
  const res = await api.post(`/forum/${postId}/replies`, { content }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return res.data.data
}

export async function toggleForumSolved({ accessToken, postId }) {
  const res = await api.patch(`/forum/${postId}/solve`, {}, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return res.data.data
}
