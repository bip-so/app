export interface IStudio {
  name: string;
  body: string;
  followers_count: number;
  id: string;
  image_url: string;
  is_following: boolean;
  key: string;
  tags: string[];
  __typename: string;
}

export interface IStudioSearch {
  data: {
    search: {
      products: IStudio[];
    };
  };
}
