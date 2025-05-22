// Upload doctor comment image
export interface UploadCommentImageRequest {
  commentId: string;
  image: File;
}
// Private post detail request
export interface PrivatePostDetailRequest {
  password: string;
}

// 1. Create Post
export interface CreatePostRequest {
  title: string;
  content: string;
  author: string;
  password: string;
  visibility: "PUBLIC" | "PRIVATE";
}

export interface CreatePostResponse {
  status: number;
  data: {
    postId: string;
  };
}

// 2. Add Comment to Post
export interface AddCommentRequest {
  postId: string;
  content: string;
}

export interface AddCommentResponse {
  status: number;
  data: {
    message: string;
  };
}

// 3. Update Comment Status
export interface UpdateCommentStatusRequest {
  commentId: string;
  status: "NORMAL" | "SOLVED" | "UNSOLVED";
}

export interface StatusMessageResponse {
  status: number;
  data: {
    message: string;
  };
}

// 4. Get Post List
export type PostStatus = "ALL" | "NORMAL" | "DOCTOR_COMMENTED" | "AI_COMMENTED";

export interface PostListResponse {
  status: number;
  data: {
    posts: Post[];
    keywords: KeywordCount[];
    totalPage: number;
  };
}


// 게시물 목록 조회
export interface Post {
  postId: string;
  title: string;
  content: string;
  author: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  keywords: string[];
  visibility: "PUBLIC" | "PRIVATE";
}

export interface KeywordCount {
  keyword: string;
  postCount: number;
}

// 5 & 6. Comments
export interface PublicCommentsResponse {
  status: number;
  data: {
    comments: Comment[];
  };
}

export interface PrivateCommentRequest {
  password: string;
}

export interface Comment {
  commentId: string;
  status: "NORMAL" | "SOLVED" | "UNSOLVED" | "DRAFT";
  content: string;
  author: "AI" | "DOCTOR" | string;
  createdAt: string;
  updatedAt: string;
  imageUrls?: string[];
}

// 7. Edit Post
export interface EditPostRequest {
  postId: string;
  title: string;
  content: string;
  password: string;
}

// 8. Delete Post
export interface DeletePostRequest {
  postId: string;
  password: string;
}

// 9. Doctor Add Comment
export interface CreateDoctorCommentRequest {
  postId: string;
  content: string;
}

export interface CreateDoctorCommentResponse {
  status: number;
  data: {
    commentId: string;
  };
}

export interface UploadCommentImageResponse {
  status: number;
  data: {
    imageUrl: string;
  };
}

// 10. Doctor Post List
export interface DoctorPostListResponse {
  status: number;
  data: {
    posts: Post[];
    keywords: KeywordCount[];
    totalPage: number;
  };
}

// 11. Post Status Count
export interface PostStatusCountResponse {
  status: number;
  data: {
    NORMAL: number;
    DOCTOR_COMMENTED: number;
    AI_COMMENTED: number;
  };
}

// 12. Doctor Comments View
export interface DoctorCommentsResponse {
  status: number;
  data: {
    comments: Comment[];
  };
}
// 13. Doctor Post Status Count
export interface DoctorPostStatusCountResponse {
  status: number;
  data: {
    totalCount: number;
    commentedCount: number;
    unCommentCount: number;
  };
}
export interface PostDetailResponse {
  status: number;
  data: {
    post: Post;
    comments: Comment[];
  };
}

export interface UploadImageResponse {
  status: number;
  data: {
    imageUrl: string;
  };
}
// Doctor post detail request/response
export interface DoctorPostDetailRequest {
  postId: string;
}

export interface DoctorPostDetailResponse {
  status: number;
  data: {
    post: Post;
    comments: Comment[];
  };
}