

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  statusCode: number
  data: T | null
  success: boolean
  message: string | null
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

