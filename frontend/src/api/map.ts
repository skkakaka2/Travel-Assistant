import { request } from '@/utils/request'
import type { GeocodingResult, RouteResult } from '@/types/map'
import type { Result } from '@/types/api'

// 地理编码（地址转坐标）
export function geocode(address: string): Promise<Result<GeocodingResult>> {
  return request.get<GeocodingResult>('/api/map/geocode', { address })
}

// 逆地理编码（坐标转地址）
export function reverseGeocode(longitude: number, latitude: number): Promise<Result<string>> {
  return request.get<string>('/api/map/reverse-geocode', { longitude, latitude })
}

// 路线规划
export function getRoute(
  origin: string,
  destination: string
): Promise<Result<RouteResult>> {
  return request.get<RouteResult>('/api/map/route', { origin, destination })
}

// 坐标路线规划
export function getRouteByCoords(
  originLng: number,
  originLat: number,
  destLng: number,
  destLat: number
): Promise<Result<RouteResult>> {
  return request.get<RouteResult>('/api/map/route', {
    originLng,
    originLat,
    destLng,
    destLat
  })
}