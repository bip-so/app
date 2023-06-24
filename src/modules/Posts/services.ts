import ApiClient from "../../commons/ApiClient";
import { CreateCommentType, CreatePostType } from "./types";

const PostsService = {
  createPosts: (payload: CreatePostType) =>
    ApiClient.post(`/posts/create`, payload),
  getPosts: (page: number = 1) => ApiClient.get(`/posts/?page=${page}`),
  getHomePagePosts: (page: number = 1) =>
    ApiClient.get(`/posts/homepage?page=${page}`),
  createComment: (payload: CreateCommentType, postId: number) =>
    ApiClient.post(`/posts/${postId}/comments/create`, payload),
  getPostComments: (postId: number) =>
    ApiClient.get(`/posts/${postId}/comments/`),
  getPost: (postId: number) => ApiClient.get(`/posts/${postId}`),
  deletePost: (postId: number) => ApiClient.delete(`/posts/${postId}`),
  deleteComment: (postId: number, commentId: number) =>
    ApiClient.delete(`/posts/${postId}/comments/${commentId}`),
  addReaction: (postId: number, payload: { emoji: string }) =>
    ApiClient.post(`/posts/${postId}/add-reaction`, payload),
  addCommentReaction: (
    postId: number,
    commentId: number,
    payload: { emoji: string }
  ) =>
    ApiClient.post(
      `/posts/${postId}/comments/${commentId}/add-reaction`,
      payload
    ),
  removeCommentReaction: (
    postId: number,
    commentId: number,
    payload: { emoji: string }
  ) =>
    ApiClient.post(
      `/posts/${postId}/comments/${commentId}/remove-reaction`,
      payload
    ),
  removeReaction: (postId: number, payload: { emoji: string }) =>
    ApiClient.post(`/posts/${postId}/remove-reaction`, payload),
  editPost: (payload: CreatePostType, postId: number) =>
    ApiClient.patch(`/posts/${postId}/edit`, payload),
  editComment: (
    payload: CreateCommentType,
    postId: number,
    commentId: number
  ) => ApiClient.patch(`/posts/${postId}/comments/${commentId}/edit`, payload),
};

export default PostsService;
