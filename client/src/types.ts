export interface User {
  id: number;
  name: string;
  email: string;
  company: { name: string };
  address: { city: string; street: string };
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface NewPostInput {
  userId: number;
  title: string;
  body: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  detail: string;
  errors?: ApiFieldError[];
}
