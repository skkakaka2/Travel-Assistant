// 地理编码结果
export interface GeocodingResult {
  longitude: number
  latitude: number
  confidence: number
  level: string
}

// 路线规划结果
export interface RouteResult {
  distance: number
  duration: number
  originName: string
  destinationName: string
}

// 地理编码请求参数
export interface GeocodeParams {
  address: string
}

// 逆地理编码请求参数
export interface ReverseGeocodeParams {
  longitude: number
  latitude: number
}

// 路线规划请求参数
export interface RouteParams {
  originLongitude: number
  originLatitude: number
  destinationLongitude: number
  destinationLatitude: number
}