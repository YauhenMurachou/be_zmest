export type Post = {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PostCreateInput = {
  title: string;
  content: string;
};

export type PostUpdateInput = {
  title?: string;
  content?: string;
};

export type PostWithAuthor = Post & {
  author: {
    id: number;
    username: string;
    email: string;
  };
};


