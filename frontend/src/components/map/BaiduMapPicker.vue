<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from "vue";
import { NInput, NButton, NSpace, NSpin, NIcon } from "naive-ui";
import { SearchOutline, LocationOutline } from "@vicons/ionicons5";

// 声明百度地图全局变量类型
declare global {
  interface Window {
    BMapGL: any;
    initBaiduMap: () => void;
  }
}

const props = defineProps<{
  latitude?: string;
  longitude?: string;
  address?: string;
}>();

const emit = defineEmits<{
  (e: "update:latitude", value: number | undefined): void;
  (e: "update:longitude", value: number | undefined): void;
  (e: "update:address", value: string): void;
  (e: "locationSelected", data: { latitude: number; longitude: number; address: string }): void;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
const searchInput = ref("");
const loading = ref(true);
const selectedAddress = ref(props.address || "");
const selectedLat = ref<string | undefined>(props.latitude);
const selectedLng = ref<string | undefined>(props.longitude);

let map: any = null;
let marker: any = null;
let geocoder: any = null;
let localSearch: any = null;

// 百度地图 API Key（从环境变量获取）
const BAIDU_MAP_AK = import.meta.env.VITE_BAIDU_MAP_AK || "";

// 动态加载百度地图脚本
function loadBaiduMapScript(): Promise<void> {
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

// 初始化地图
async function initMap() {
  if (!mapContainer.value) return;

  try {
    await loadBaiduMapScript();

    const BMapGL = window.BMapGL;

    // 默认中心点（北京）
    const defaultCenter = new BMapGL.Point(116.404, 39.915);

    // 创建地图实例
    map = new BMapGL.Map(mapContainer.value);

    // 如果有初始经纬度，使用它作为中心点
    if (props.latitude && props.longitude) {
      const center = new BMapGL.Point(props.longitude, props.latitude);
      map.centerAndZoom(center, 15);
      addMarker(center);
    } else {
      map.centerAndZoom(defaultCenter, 12);
    }

    // 启用滚轮缩放
    map.enableScrollWheelZoom(true);

    // 添加缩放控件
    map.addControl(new BMapGL.ZoomControl());

    // 初始化地理编码器
    geocoder = new BMapGL.Geocoder();

    // 初始化本地搜索
    localSearch = new BMapGL.LocalSearch(map, {
      renderOptions: { map: map, autoViewport: true },
      onSearchComplete: (results: any) => {
        if (results && results.getCurrentNumPois() > 0) {
          const poi = results.getPoi(0);
          if (poi) {
            const point = poi.point;
            addMarker(point);
            reverseGeocode(point);
          }
        }
      },
    });

    // 点击地图事件
    map.addEventListener("click", (e: any) => {
      const point = e.latlng;
      addMarker(point);
      reverseGeocode(point);
    });

    loading.value = false;
  } catch (error) {
    console.error("Failed to initialize Baidu Map:", error);
    loading.value = false;
  }
}

// 添加标记点
function addMarker(point: any) {
  const BMapGL = window.BMapGL;

  // 移除旧标记
  if (marker) {
    map.removeOverlay(marker);
  }

  // 创建新标记
  marker = new BMapGL.Marker(point);
  map.addOverlay(marker);

  // 更新选中的经纬度
  selectedLat.value = point.lat;
  selectedLng.value = point.lng;

  emit("update:latitude", point.lat);
  emit("update:longitude", point.lng);
}

// 逆地理编码（坐标转地址）
function reverseGeocode(point: any) {
  if (!geocoder) return;

  geocoder.getLocation(point, (result: any) => {
    if (result) {
      const address = result.address || "";
      selectedAddress.value = address;
      emit("update:address", address);
      emit("locationSelected", {
        latitude: point.lat,
        longitude: point.lng,
        address: address,
      });
    }
  });
}

// 搜索地址
function handleSearch() {
  if (!searchInput.value.trim() || !localSearch) return;
  localSearch.search(searchInput.value.trim());
}

// 定位到当前位置
function locateCurrentPosition() {
  if (!window.BMapGL) return;

  const BMapGL = window.BMapGL;
  const geolocation = new BMapGL.Geolocation();

  geolocation.getCurrentPosition(
    (result: any) => {
      if (geolocation.getStatus() === 0) {
        const point = result.point;
        map.centerAndZoom(point, 15);
        addMarker(point);
        reverseGeocode(point);
      }
    },
    { enableHighAccuracy: true }
  );
}

// 监听 props 变化
watch(
  () => [props.latitude, props.longitude],
  ([lat, lng]) => {
    if (lat && lng && map && window.BMapGL) {
      const point = new window.BMapGL.Point(lng, lat);
      map.centerAndZoom(point, 15);
      addMarker(point);
    }
  }
);

watch(
  () => props.address,
  (newAddress) => {
    if (newAddress) {
      selectedAddress.value = newAddress;
    }
  }
);

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.destroy?.();
    map = null;
  }
});
</script>

<template>
  <div class="map-picker">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <NSpace>
        <NInput
          v-model:value="searchInput"
          placeholder="搜索位置..."
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <NIcon><SearchOutline /></NIcon>
          </template>
        </NInput>
        <NButton type="primary" @click="handleSearch">搜索</NButton>
        <NButton @click="locateCurrentPosition" title="当前位置">
          <template #icon>
            <NIcon><LocationOutline /></NIcon>
          </template>
        </NButton>
      </NSpace>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <NSpin :show="loading" description="加载地图中...">
        <div ref="mapContainer" class="map"></div>
      </NSpin>
    </div>

    <!-- 选中位置信息 -->
    <div v-if="selectedLat && selectedLng" class="selected-info">
      <div class="info-item">
        <span class="label">坐标：</span>
        <span class="value">{{ selectedLat }}, {{ selectedLng }}</span>
      </div>
      <div v-if="selectedAddress" class="info-item">
        <span class="label">地址：</span>
        <span class="value">{{ selectedAddress }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.search-bar {
  flex-shrink: 0;
}

.map-container {
  flex: 1;
  min-height: 430px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e0e0e0);
}

.map {
  width: 100%;
  height: 100%;
  min-height: 450px;
}

.selected-info {
  flex-shrink: 0;
  padding: 12px;
  background: var(--card-color, #f5f5f5);
  border-radius: 8px;
  font-size: 0.875rem;
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: var(--text-color-secondary, #666);
  flex-shrink: 0;
}

.value {
  color: var(--text-color, #333);
  word-break: break-all;
}
</style>
