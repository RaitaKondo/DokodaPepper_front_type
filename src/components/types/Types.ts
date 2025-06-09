
  
  export interface City {
    id: number;
    name: string;
  }
  
  export interface User {
    id: number;
    username: string;
    password: string;
    created_at: string;
    updated_at: string;
  }
  
// types/Types.ts
export interface PostImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}


export interface Post {
  postId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  userName: string; 
  latitude:number;
  longitude:number;
  address:string;
  city: {
    id: number;
    name: string;
  };
  images: PostImage[]; // ← ここを追加
  prefectureName: string; // 追加
  prefectureId: number;
  numberOfFoundIt: number;
  numberOfReported: number;
  foundIt: boolean;
  reported: boolean;
}


  export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }
  
  export type Pref = { id: number; name: string };

  export type PrefContextType = {
  prefs: Pref[];
  isLoading: boolean;
  isError: boolean;
};