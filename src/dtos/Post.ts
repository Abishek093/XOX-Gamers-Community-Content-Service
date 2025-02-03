
export interface Post {
    _id: string;
    title: string;
    content: string;
    author: {
      _id: string;
      displayName: string;
      profileImage?: string;
    };
    community?: {
      _id: string;
      name: string;
      image?: string;
    };
    likeCount: number;
    commentCount: number;
    createdAt: string;
  }