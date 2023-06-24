export type UpdateUserType = {
  file: FormData;
  fullName: string;
  username: string;
  bio: string;
  twitter_url: string;
  website: string;
  location: string;
};

export type UserProfileFormType = {
  name: string;
  username: string;
  bio: string;
  location: string;
  twitterUrl: string;
  website: string;
};
