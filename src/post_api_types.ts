// post_api_types.ts

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
  status: "NORMAL" | "DOCTOR_COMMENTED" | "AI_COMMENTED";
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
  status: "NORMAL" | "SOLVED" | "UNSOLVED";
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
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
  status: "NORMAL" | "SOLVED" | "UNSOLVED";
}

// 10. Doctor Post List
export interface DoctorPostListResponse {
  status: number;
  data: {
    posts: Post[];
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