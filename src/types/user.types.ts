export type User = {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserCreateInput = {
  email: string;
  username: string;
  password: string;
};

export type UserPublic = {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserListItem = {
  id: number;
  name: string;
  status: string | null;
  photos: {
    small: string | null;
    large: string | null;
  };
  followed: boolean;
};

export type UserLoginInput = {
  email: string;
  password: string;
};

export type JwtPayload = {
  userId: number;
  email: string;
};


