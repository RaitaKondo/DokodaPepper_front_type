export interface Image {
    id: number;
    imageUrl: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Area {
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
  
  export interface Post {
    id: number;
    user: User;
    area: Area;
    content: string;
    createdAt: string;
    updatedAt: string;
    images: Image[];
  }
  