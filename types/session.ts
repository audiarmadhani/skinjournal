export interface AppSession {
  user: {
    id: string;
    email?: string;
  };
  access_token?: string;
}
