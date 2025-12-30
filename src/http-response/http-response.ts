export interface HttpResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export function successResponse<T>(data: T): HttpResponse<T> {
  return {
    code: 200,
    message: 'success',
    data: data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse<T>(message: string, data: T): HttpResponse<T> {
  return {
    code: 400,
    message: message,
    data: data,
    timestamp: new Date().toISOString(),
  };
}