// Visibility options for saves
export type Visibility = "private" | "public" | "unlisted";

// Tag type returned from API
export interface Tag {
  id: string;
  spaceId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    saves: number;
  };
}

// Save type returned from API
export interface Save {
  id: string;
  spaceId: string;
  url: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
  imageUrl: string | null;
  contentType: string | null;
  visibility: Visibility;
  isArchived: boolean;
  isFavorite: boolean;
  createdBy: string;
  savedAt: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  collections?: { id: string; name: string }[];
}

// Input for creating a save
export interface CreateSaveInput {
  url: string;
  title?: string;
  visibility?: Visibility;
  tagNames?: string[];
  collectionIds?: string[];
  note?: string;
}

// tRPC response wrapper
export interface TrpcResponse<T> {
  result?: {
    data: T;
  };
  error?: {
    message: string;
    code: number;
    data?: {
      code: string;
      httpStatus: number;
      path: string;
    };
  };
}

// tRPC error codes
export type TrpcErrorCode = "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR";
