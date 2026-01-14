import { ref, type Ref } from "vue";

// 声明百度地图全局变量类型
declare global {
  interface Window {
    BMapGL: any;
    initBaiduMap: () => void;
  }
}

// 百度地图 API Key（从环境变量获取）
const BAIDU_MAP_AK = import.meta.env.VITE_BAIDU_MAP_AK || "";

/**
 * 动态加载百度地图脚本
 */
export function loadBaiduMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.BMapGL) {
      resolve();
      return;
    }

    // 设置回调函数
    window.initBaiduMap = () => {
      resolve();
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${BAIDU_MAP_AK}&callback=initBaiduMap`;
    script.onerror = () => reject(new Error("Failed to load Baidu Map API"));
    document.head.appendChild(script);
  });
}

/**
 * 百度地图 Composable
 * 提供地图初始化和基础功能
 */
export function useBaiduMap(mapContainer: Ref<HTMLDivElement | null>) {
  const loading = ref(true);
  let map: any = null;

  /**
   * 初始化地图
   * @param options 地图初始化选项
   */
  async function initMap(options?: {
    center?: { lng: number; lat: number };
    zoom?: number;
    enableScrollWheelZoom?: boolean;
    controls?: boolean;
  }) {
    if (!mapContainer.value) return null;

    try {
      await loadBaiduMapScript();
      const BMapGL = window.BMapGL;

      // 默认中心点（北京）
      const defaultCenter = new BMapGL.Point(116.404, 39.915);
      const defaultZoom = options?.zoom || 12;

      // 创建地图实例
      map = new BMapGL.Map(mapContainer.value);

      // 设置中心点和缩放级别
      if (options?.center) {
        const center = new BMapGL.Point(options.center.lng, options.center.lat);
        map.centerAndZoom(center, defaultZoom);
      } else {
        map.centerAndZoom(defaultCenter, defaultZoom);
      }

      // 启用滚轮缩放
      if (options?.enableScrollWheelZoom !== false) {
        map.enableScrollWheelZoom(true);
      }

      // 添加控件
      if (options?.controls !== false) {
        map.addControl(new BMapGL.ZoomControl());
        map.addControl(new BMapGL.ScaleControl());
      }

      loading.value = false;
      return map;
    } catch (error) {
      console.error("Failed to initialize Baidu Map:", error);
      loading.value = false;
      return null;
    }
  }

  /**
   * 获取地图实例
   */
  function getMap() {
    return map;
  }

  /**
   * 销毁地图
   */
  function destroyMap() {
    if (map) {
      map.destroy?.();
      map = null;
    }
  }

  /**
   * 设置地图中心点和缩放级别
   */
  function setCenterAndZoom(lng: number, lat: number, zoom?: number) {
    if (!map || !window.BMapGL) return;
    const BMapGL = window.BMapGL;
    const point = new BMapGL.Point(lng, lat);
    map.centerAndZoom(point, zoom || map.getZoom());
  }

  /**
   * 设置地图视野，包含所有指定的点
   */
  function setViewport(points: any[], options?: { margins?: number[]; enableAnimation?: boolean; zoomFactor?: number; delay?: number }) {
    if (!map || !window.BMapGL || points.length === 0) return;
    
    const viewportOptions: any = {
      enableAnimation: options?.enableAnimation !== false,
      margins: options?.margins || [50, 50, 50, 50],
    };
    
    if (options?.zoomFactor !== undefined) {
      viewportOptions.zoomFactor = options.zoomFactor;
    }
    
    if (options?.delay !== undefined) {
      viewportOptions.delay = options.delay;
    }
    
    // 直接调用 map.setViewport，第一个参数是点数组，第二个参数是选项对象
    map.setViewport(points, viewportOptions);
  }

  return {
    loading,
    initMap,
    getMap,
    destroyMap,
    setCenterAndZoom,
    setViewport,
  };
}

