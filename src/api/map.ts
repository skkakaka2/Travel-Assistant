import { request } from '@/utils/request'
import type { GeocodingResult, RouteResult } from '@/types'

export const mapApi = {
  // 地理编码
  geocode(address: string) {
    return request.get<GeocodingResult>('/map/geocode', { params: { address } })
  },

  // 逆地理编码
  reverseGeocode(longitude: number, latitude: number) {
    return request.get<string>('/map/reverse-geocode', {
      params: { longitude, latitude },
    })
  },

  // 路线规划
  route(params: {
    originLongitude: number
    originLatitude: number
    destinationLongitude: number
    destinationLatitude: number
  }) {
    return request.get<RouteResult>('/map/route', { params })
  },
}