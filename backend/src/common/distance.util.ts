/**
 * 距离计算工具函数
 */

/**
 * 坐标点接口
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * 百度地图路径规划 API 响应类型
 */
interface BaiduDirectionResponse {
  status: number;
  message: string;
  result?: {
    routes: Array<{
      distance: number; // 距离（米）
      duration: number; // 时长（秒）
    }>;
  };
}

/**
 * 路径规划结果
 */
export interface RouteResult {
  // 距离（米）
  distance: number;
  // 时长（秒）
  duration: number;
}

/**
 * 获取百度地图 AK
 */
function getBaiduMapAK(): string {
  const ak = process.env.BAIDU_MAP_SERVER_AK;
  if (!ak) {
    throw new Error('BAIDU_MAP_SERVER_AK is not configured');
  }
  return ak;
}

/**
 * 使用百度地图路径规划 API 计算驾车距离
 * @param origin 起点坐标
 * @param destination 终点坐标
 * @returns 路径规划结果（距离和时长）
 */
export async function calculateDrivingDistance(
  origin: Coordinate,
  destination: Coordinate,
): Promise<RouteResult> {
  const ak = getBaiduMapAK();

  // 百度地图坐标格式：纬度,经度
  const originStr = `${origin.latitude},${origin.longitude}`;
  const destinationStr = `${destination.latitude},${destination.longitude}`;

  const url = new URL('https://api.map.baidu.com/direction/v2/driving');
  url.searchParams.set('origin', originStr);
  url.searchParams.set('destination', destinationStr);
  url.searchParams.set('ak', ak);

  try {
    const response = await fetch(url.toString());
    const data: BaiduDirectionResponse = await response.json();

    if (data.status !== 0) {
      throw new Error(`Baidu Map API error: ${data.message} (status: ${data.status})`);
    }

    if (!data.result?.routes?.length) {
      throw new Error('No route found');
    }

    const route = data.result.routes[0];
    return {
      distance: route.distance,
      duration: route.duration,
    };
  } catch (error) {
    // 如果 API 调用失败，回退到直线距离计算
    console.error('Baidu Map API call failed, falling back to Haversine:', error);
    const distance = calculateHaversineDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude,
    );
    return {
      distance,
      duration: 0, // 直线距离无法估算时长
    };
  }
}

/**
 * 使用百度地图路径规划 API 计算步行距离
 * @param origin 起点坐标
 * @param destination 终点坐标
 * @returns 路径规划结果（距离和时长）
 */
export async function calculateWalkingDistance(
  origin: Coordinate,
  destination: Coordinate,
): Promise<RouteResult> {
  const ak = getBaiduMapAK();

  const originStr = `${origin.latitude},${origin.longitude}`;
  const destinationStr = `${destination.latitude},${destination.longitude}`;

  const url = new URL('https://api.map.baidu.com/direction/v2/walking');
  url.searchParams.set('origin', originStr);
  url.searchParams.set('destination', destinationStr);
  url.searchParams.set('ak', ak);

  try {
    const response = await fetch(url.toString());
    const data: BaiduDirectionResponse = await response.json();

    if (data.status !== 0) {
      throw new Error(`Baidu Map API error: ${data.message} (status: ${data.status})`);
    }

    if (!data.result?.routes?.length) {
      throw new Error('No route found');
    }

    const route = data.result.routes[0];
    return {
      distance: route.distance,
      duration: route.duration,
    };
  } catch (error) {
    console.error('Baidu Map API call failed, falling back to Haversine:', error);
    const distance = calculateHaversineDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude,
    );
    return {
      distance,
      duration: 0,
    };
  }
}

/**
 * 使用 Haversine 公式计算两点之间的直线距离（作为备用方案）
 * @param lat1 点1纬度
 * @param lon1 点1经度
 * @param lat2 点2纬度
 * @param lon2 点2经度
 * @returns 距离（单位：米）
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // 地球半径（米）

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * 角度转弧度
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 格式化距离显示
 * @param meters 距离（米）
 * @returns 格式化后的字符串
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 格式化时长显示
 * @param seconds 时长（秒）
 * @returns 格式化后的字符串
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)}min`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
}

/**
 * 批量计算多个点之间的驾车距离
 * @param points 坐标点数组
 * @returns 每段距离的数组
 */
export async function calculateRouteDistances(
  points: Coordinate[],
): Promise<RouteResult[]> {
  if (points.length < 2) {
    return [];
  }

  const results: RouteResult[] = [];

  for (let i = 1; i < points.length; i++) {
    const result = await calculateDrivingDistance(points[i - 1], points[i]);
    results.push(result);
  }

  return results;
}

/**
 * 计算多个点之间的总驾车距离
 * @param points 坐标点数组
 * @returns 总距离和总时长
 */
export async function calculateTotalDrivingDistance(
  points: Coordinate[],
): Promise<RouteResult> {
  const results = await calculateRouteDistances(points);

  return results.reduce(
    (acc, curr) => ({
      distance: acc.distance + curr.distance,
      duration: acc.duration + curr.duration,
    }),
    { distance: 0, duration: 0 },
  );
}
