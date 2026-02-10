export type ProfileContacts = {
  facebook: string | null;
  github: string | null;
  instagram: string | null;
  mainLink: string | null;
  twitter: string | null;
  vk: string | null;
  website: string | null;
  youtube: string | null;
};

export type Profile = {
  userId: number;
  aboutMe: string | null;
  contacts: ProfileContacts;
  lookingForAJob: boolean;
  lookingForAJobDescription: string | null;
  fullName: string;
  status: string;
  photos: {
    small: string | null;
    large: string | null;
  };
};

export type ProfileUpdateInput = {
  aboutMe: string | null;
  contacts: ProfileContacts;
  lookingForAJob: boolean;
  lookingForAJobDescription: string | null;
  fullName: string;
};

