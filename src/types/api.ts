

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  message: string | null;
  success: boolean;
  statusCode: number;
}

