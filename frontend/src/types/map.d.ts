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