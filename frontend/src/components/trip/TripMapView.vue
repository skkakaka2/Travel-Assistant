<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import { NModal, NCard, NSpin, NIcon, NTag, NSpace, NButton, NImage } from "naive-ui";
import { CloseOutline } from "@vicons/ionicons5";
import type { Trip, DayPlan, DayPlanItem } from "@/types/api";
import { PlanItemType } from "@/types/api";
import { formatDate, getDayOfWeek } from "@/utils/date";
import {
  formatDistance,
  formatDuration,
  formatCurrency,
  getItemTypeIcon,
  getItemTypeLabel,
  getItemTypeColor,
} from "@/utils/format";
import { useBaiduMap } from "@/composables/useBaiduMap";
import { userApi } from "@/api";
import type { User } from "@/types/api";

// 声明百度地图全局变量类型
declare global {
  interface Window {
    BMapGL: any;
    initBaiduMap: () => void;
  }
}

const props = defineProps<{
  show: boolean;
  trip: Trip | null;
  dayPlans: DayPlan[];
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
const user = ref<User | null>(null);

// 使用百度地图 composable
const { loading, initMap: initBaiduMap, getMap, destroyMap, setViewport } = useBaiduMap(mapContainer);

let map: any = null;
let markers: any[] = [];
let polylines: any[] = [];
let infoWindows: any[] = [];
let homeMarker: any = null;
let currentInfoWindow: any = null; // 当前打开的信息窗口

// 获取所有有坐标的项目
const allItems = computed(() => {
  const items: Array<{ item: DayPlanItem; dayPlan: DayPlan }> = [];
  props.dayPlans.forEach((dayPlan) => {
    if (dayPlan.dayPlanItems) {
      dayPlan.dayPlanItems.forEach((item) => {
        if (item.latitude && item.longitude) {
          items.push({ item, dayPlan });
        }
      });
    }
  });
  // 按日期和开始时间排序
  return items.sort((a, b) => {
    if (a.dayPlan.date !== b.dayPlan.date) {
      return a.dayPlan.date.localeCompare(b.dayPlan.date);
    }
    if (a.item.startTime && b.item.startTime) {
      return a.item.startTime.localeCompare(b.item.startTime);
    }
    return a.item.order - b.item.order;
  });
});

// 获取项目类型对应的颜色
function getTypeColor(type: PlanItemType): string {
  const colorMap: Record<PlanItemType, string> = {
    [PlanItemType.HOTEL]: "#1890ff",
    [PlanItemType.ATTRACTION]: "#52c41a",
    [PlanItemType.RESTAURANT]: "#faad14",
    [PlanItemType.TRANSPORT]: "#722ed1",
    [PlanItemType.ACTIVITY]: "#eb2f96",
    [PlanItemType.OTHER]: "#8c8c8c",
  };
  return colorMap[type] || "#8c8c8c";
}

// 加载用户信息
async function loadUser() {
  try {
    const response = await userApi.getCurrentUser();
    user.value = response.data.data;
  } catch (error) {
    console.error("Failed to load user info:", error);
  }
}

// 初始化地图
async function initMap() {
  if (!mapContainer.value || !props.trip) return;

  try {
    // 加载用户信息（获取家位置）
    await loadUser();

    // 使用 composable 初始化地图
    map = await initBaiduMap({
      enableScrollWheelZoom: true,
      controls: true,
    });

    if (!map) {
      console.error("Failed to initialize map");
      return;
    }

    const BMapGL = window.BMapGL;

    // 计算地图中心点和缩放级别（包括家位置）
    const points: any[] = [];

    // 如果有家位置，添加到点列表中
    if (user.value?.homeLatitude && user.value?.homeLongitude) {
      points.push(new BMapGL.Point(Number(user.value.homeLongitude), Number(user.value.homeLatitude)));
    }

    allItems.value.forEach(({ item }) => {
      if (item.latitude && item.longitude) {
        points.push(new BMapGL.Point(Number(item.longitude), Number(item.latitude)));
      }
    });

    if (points.length > 0) {
      // 使用 composable 的方法设置视野
      setViewport(points, {
        enableAnimation: true,
        margins: [50, 50, 50, 50],
      });
    }

    // 添加家位置标记
    addHomeMarker();

    // 添加标记和路线
    await addMarkersAndRoutes();
  } catch (error) {
    console.error("Failed to initialize Baidu Map:", error);
  }
}

// 添加家位置标记
function addHomeMarker() {
  if (!map || !window.BMapGL || !user.value?.homeLatitude || !user.value?.homeLongitude) return;

  const BMapGL = window.BMapGL;

  // 移除旧的家标记
  if (homeMarker) {
    map.removeOverlay(homeMarker);
  }

  const homePoint = new BMapGL.Point(Number(user.value.homeLongitude), Number(user.value.homeLatitude));

  // 创建家位置图标（使用房子图标）
  const homeIcon = new BMapGL.Icon(createHomeMarkerIcon(), new BMapGL.Size(32, 32), {
    anchor: new BMapGL.Size(16, 32),
  });

  // 创建家位置标记
  homeMarker = new BMapGL.Marker(homePoint, { icon: homeIcon });
  map.addOverlay(homeMarker);

  // 创建家位置信息窗口
  const homeInfoWindow = new BMapGL.InfoWindow(
    `<div style="padding: 8px; min-width: 200px;">
      <div style="font-weight: bold; margin-bottom: 4px; color: #1890ff;">
        🏠 家
      </div>
      ${user.value.homeAddress ? `<div style="font-size: 12px; color: #666;">📍 ${user.value.homeAddress}</div>` : ""}
    </div>`,
    {
      width: 250,
      height: 100,
    }
  );

  // 点击家标记显示信息窗口
  homeMarker.addEventListener("click", () => {
    map.openInfoWindow(homeInfoWindow, homePoint);
  });
}

// 创建家位置标记图标（SVG）
function createHomeMarkerIcon(): string {
  const svg = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#1890ff" stroke="white" stroke-width="2"/>
      <path d="M16 10 L20 14 L20 24 L12 24 L12 14 Z" fill="white" stroke="white" stroke-width="1"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// 使用百度地图路线规划API获取实际路线
async function getDrivingRoute(start: any, end: any): Promise<any[] | null> {
  if (!window.BMapGL) return null;

  const BMapGL = window.BMapGL;

  return new Promise((resolve) => {
    const driving = new BMapGL.DrivingRoute(map, {
      renderOptions: {
        map: map,
        autoViewport: false, // 不自动调整视野
        hideMarkers: true, // 隐藏默认标记
      },
      onSearchComplete: (results: any) => {
        if (driving.getStatus() === 0) {
          const plan = results.getPlan(0);
          if (plan) {
            const route = plan.getRoute(0);
            if (route) {
              const path = route.getPath();
              resolve(path);
              return;
            }
          }
        }
        resolve(null);
      },
    });

    driving.search(start, end);
  });
}

// 添加标记和路线
async function addMarkersAndRoutes() {
  // 确保获取地图实例
  if (!map) {
    map = getMap();
  }
  if (!map || !window.BMapGL) return;

  const BMapGL = window.BMapGL;

  // 清除旧的标记和路线（但保留家位置标记）
  markers.forEach((marker) => map.removeOverlay(marker));
  polylines.forEach((polyline) => map.removeOverlay(polyline));
  markers = [];
  polylines = [];
  infoWindows = [];

  // 重新添加家位置标记（如果存在）
  if (user.value?.homeLatitude && user.value?.homeLongitude) {
    addHomeMarker();
  }

  // 按日期分组
  const itemsByDay = new Map<number, Array<{ item: DayPlanItem; dayPlan: DayPlan }>>();
  allItems.value.forEach((data) => {
    const dayNumber = data.dayPlan.dayNumber;
    if (!itemsByDay.has(dayNumber)) {
      itemsByDay.set(dayNumber, []);
    }
    itemsByDay.get(dayNumber)!.push(data);
  });

  // 为每一天使用不同的颜色
  const dayColors = [
    "#1890ff", // 蓝色
    "#52c41a", // 绿色
    "#faad14", // 橙色
    "#eb2f96", // 粉色
    "#722ed1", // 紫色
    "#13c2c2", // 青色
    "#f5222d", // 红色
  ];

  // 获取所有日期编号并排序
  const sortedDayNumbers = Array.from(itemsByDay.keys()).sort((a, b) => a - b);

  // 获取第一个活动项目（用于从家位置绘制路线）
  const firstItem = allItems.value.length > 0 ? allItems.value[0] : null;

  // 如果用户有家位置且存在第一个活动项目，绘制从家到第一个活动的路线
  if (user.value?.homeLatitude && user.value?.homeLongitude && firstItem) {
    const BMapGL = window.BMapGL;
    const homePoint = new BMapGL.Point(Number(user.value.homeLongitude), Number(user.value.homeLatitude));
    const firstPoint = new BMapGL.Point(Number(firstItem.item.longitude), Number(firstItem.item.latitude));

    try {
      const routePath = await getDrivingRoute(homePoint, firstPoint);
      if (routePath && routePath.length > 0) {
        // 使用实际路线路径点绘制（使用特殊的颜色表示从家出发）
        const polyline = new BMapGL.Polyline(routePath, {
          strokeColor: "#ff4d4f", // 红色表示从家出发
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeStyle: "solid",
        });
        map.addOverlay(polyline);
        polylines.push(polyline);
      } else {
        // 如果路线规划失败，使用直线连接
        const polyline = new BMapGL.Polyline([homePoint, firstPoint], {
          strokeColor: "#ff4d4f",
          strokeWeight: 3,
          strokeOpacity: 0.6,
          strokeStyle: "dashed",
        });
        map.addOverlay(polyline);
        polylines.push(polyline);
      }
    } catch (error) {
      console.error("Failed to get route from home to first item:", error);
      // 失败时使用直线连接
      const polyline = new BMapGL.Polyline([homePoint, firstPoint], {
        strokeColor: "#ff4d4f",
        strokeWeight: 3,
        strokeOpacity: 0.6,
        strokeStyle: "dashed",
      });
      map.addOverlay(polyline);
      polylines.push(polyline);
    }

    // 添加小延迟，避免API调用过快
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // 添加标记和路线
  for (let dayIndex = 0; dayIndex < sortedDayNumbers.length; dayIndex++) {
    const dayNumber = sortedDayNumbers[dayIndex];
    const items = itemsByDay.get(dayNumber)!;
    const dayColor = dayColors[(dayNumber - 1) % dayColors.length];
    const dayPoints: any[] = [];

    // 先添加所有标记
    items.forEach(({ item, dayPlan }, index) => {
      const point = new BMapGL.Point(Number(item.longitude), Number(item.latitude));
      dayPoints.push(point);

      // 创建自定义图标
      const icon = new BMapGL.Icon(
        createMarkerIcon(dayColor, index + 1, getTypeColor(item.type)),
        new BMapGL.Size(32, 32),
        { anchor: new BMapGL.Size(16, 32) }
      );

      // 创建标记
      const marker = new BMapGL.Marker(point, { icon, zIndex: 1000 });
      map.addOverlay(marker);
      markers.push(marker);

      // 添加点击事件，显示详细信息窗口
      marker.addEventListener("click", () => {
        showItemInfoWindow(marker, item, dayPlan);
      });
    });

    // 绘制实际驾车路线
    if (dayPoints.length > 1) {
      // 同一天有多个点，连接同一天的所有点
      for (let i = 0; i < dayPoints.length - 1; i++) {
        const start = dayPoints[i];
        const end = dayPoints[i + 1];

        try {
          const routePath = await getDrivingRoute(start, end);
          if (routePath && routePath.length > 0) {
            // 使用实际路线路径点绘制
            const polyline = new BMapGL.Polyline(routePath, {
              strokeColor: dayColor,
              strokeWeight: 4,
              strokeOpacity: 0.8,
              strokeStyle: "solid",
            });
            map.addOverlay(polyline);
            polylines.push(polyline);
          } else {
            // 如果路线规划失败，使用直线连接
            const polyline = new BMapGL.Polyline([start, end], {
              strokeColor: dayColor,
              strokeWeight: 3,
              strokeOpacity: 0.6,
              strokeStyle: "dashed", // 虚线表示非实际路线
            });
            map.addOverlay(polyline);
            polylines.push(polyline);
          }
        } catch (error) {
          console.error(`Failed to get route from point ${i} to ${i + 1}:`, error);
          // 失败时使用直线连接
          const polyline = new BMapGL.Polyline([start, end], {
            strokeColor: dayColor,
            strokeWeight: 3,
            strokeOpacity: 0.6,
            strokeStyle: "dashed",
          });
          map.addOverlay(polyline);
          polylines.push(polyline);
        }

        // 添加小延迟，避免API调用过快
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } else if (dayPoints.length === 1 && dayIndex > 0) {
      // 如果当前天只有一个点，且不是第一天，需要从前一天的最后一个点连接到当前点
      const prevDayNumber = sortedDayNumbers[dayIndex - 1];
      const prevDayItems = itemsByDay.get(prevDayNumber);

      if (prevDayItems && prevDayItems.length > 0) {
        // 获取前一天的最后一个item
        const lastPrevItem = prevDayItems[prevDayItems.length - 1];
        const prevPoint = new BMapGL.Point(Number(lastPrevItem.item.longitude), Number(lastPrevItem.item.latitude));
        const currentPoint = dayPoints[0];

        try {
          const routePath = await getDrivingRoute(prevPoint, currentPoint);
          if (routePath && routePath.length > 0) {
            // 使用实际路线路径点绘制
            const polyline = new BMapGL.Polyline(routePath, {
              strokeColor: dayColor,
              strokeWeight: 4,
              strokeOpacity: 0.8,
              strokeStyle: "solid",
            });
            map.addOverlay(polyline);
            polylines.push(polyline);
          } else {
            // 如果路线规划失败，使用直线连接
            const polyline = new BMapGL.Polyline([prevPoint, currentPoint], {
              strokeColor: dayColor,
              strokeWeight: 3,
              strokeOpacity: 0.6,
              strokeStyle: "dashed",
            });
            map.addOverlay(polyline);
            polylines.push(polyline);
          }
        } catch (error) {
          console.error(`Failed to get route from previous day to current day:`, error);
          // 失败时使用直线连接
          const polyline = new BMapGL.Polyline([prevPoint, currentPoint], {
            strokeColor: dayColor,
            strokeWeight: 3,
            strokeOpacity: 0.6,
            strokeStyle: "dashed",
          });
          map.addOverlay(polyline);
          polylines.push(polyline);
        }

        // 添加小延迟，避免API调用过快
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
}

// 创建标记图标（SVG）
function createMarkerIcon(dayColor: string, number: number, typeColor: string): string {
  const svg = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${dayColor}" stroke="white" stroke-width="2"/>
      <text x="16" y="20" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${number}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// 显示项目详细信息窗口
function showItemInfoWindow(marker: any, item: DayPlanItem, dayPlan: DayPlan) {
  if (!map || !window.BMapGL) return;

  const BMapGL = window.BMapGL;

  // 关闭之前的信息窗口
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }

  // 获取图片URL
  const getImageUrl = (filename: string): string => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    return `${baseUrl}/uploads/${filename}`;
  };

  // 构建详细信息HTML
  let imagesHTML = "";
  if (item.imgList && item.imgList.length > 0) {
    const imageUrls = item.imgList.map((img) => getImageUrl(img));
    imagesHTML = `
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">图片：</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${imageUrls
            .map(
              (url) => `
            <img 
              src="${url}" 
              alt="Photo" 
              style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; cursor: pointer;"
              onclick="window.open('${url}', '_blank')"
            />
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  const timeRange =
    item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.startTime || item.endTime || "-";

  const content = `
    <div style="padding: 16px; min-width: 300px; max-width: 400px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;">
      <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
        <span style="font-size: 2rem; flex-shrink: 0; color: ${getTypeColor(item.type)};">
          ${getItemTypeIcon(item.type)}
        </span>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; font-weight: 600; color: #333;">
            ${item.name}
          </h3>
          <div style="display: inline-block; padding: 2px 8px; background: ${getTypeColor(item.type)}20; color: ${getTypeColor(item.type)}; border-radius: 4px; font-size: 12px; font-weight: 500;">
            ${getItemTypeLabel(item.type)}
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem;">
        ${
          item.address
            ? `
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <span style="font-size: 16px;">📍</span>
            <span>${item.address}</span>
          </div>
        `
            : ""
        }

        ${
          timeRange !== "-"
            ? `
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <span style="font-size: 16px;">🕐</span>
            <span>${timeRange}</span>
          </div>
        `
            : ""
        }

        ${
          item.distance && item.distance > 0
            ? `
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <span style="font-size: 16px;">🚗</span>
            <span>${formatDistance(item.distance)}</span>
          </div>
        `
            : ""
        }

        ${
          item.duration && item.duration > 0
            ? `
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <span style="font-size: 16px;">⏱️</span>
            <span>${formatDuration(item.duration)}</span>
          </div>
        `
            : ""
        }

        ${
          item.cost
            ? `
          <div style="display: flex; align-items: center; gap: 8px; color: #666;">
            <span style="font-size: 16px;">💰</span>
            <span>${formatCurrency(item.cost)}</span>
          </div>
        `
            : ""
        }

        <div style="font-size: 12px; color: #999; margin-top: 4px;">
          ${dayPlan.date} 第${dayPlan.dayNumber}天
        </div>

        ${
          item.notes
            ? `
          <div style="margin-top: 8px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.5;">${item.notes}</p>
          </div>
        `
            : ""
        }

        ${imagesHTML}
      </div>
    </div>
  `;

  // 创建信息窗口
  const infoWindow = new BMapGL.InfoWindow(content, {
    width: 400,
    maxHeight: 600,
    enableMessage: false,
    offset: new BMapGL.Size(0, -10),
  });

  // 打开信息窗口（使用 map.openInfoWindow 方法）
  const point = marker.getPosition();
  map.openInfoWindow(infoWindow, point);
  currentInfoWindow = infoWindow;
}

// 清除地图上的所有标记和路线
function clearMap() {
  markers.forEach((marker) => map.removeOverlay(marker));
  polylines.forEach((polyline) => map.removeOverlay(polyline));
  if (homeMarker) {
    map.removeOverlay(homeMarker);
    homeMarker = null;
  }
  if (currentInfoWindow && map) {
    map.closeInfoWindow();
    currentInfoWindow = null;
  }
  markers = [];
  polylines = [];
  infoWindows = [];
}

// 监听显示状态
watch(
  () => props.show,
  (show) => {
    if (show) {
      setTimeout(() => {
        initMap();
      }, 100);
    } else {
      clearMap();
      if (map) {
        map = null;
      }
    }
  }
);

// 监听数据变化
watch(
  () => allItems.value,
  () => {
    if (props.show) {
      // 确保获取地图实例
      if (!map) {
        map = getMap();
      }
      if (map) {
        addMarkersAndRoutes();
      }
    }
  },
  { deep: true }
);

onUnmounted(() => {
  clearMap();
  destroyMap();
  map = null;
});

function handleClose() {
  emit("update:show", false);
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    style="width: 90vw; max-width: 1400px; height: 90vh"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
  >
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
        <span style="font-size: 1.25rem; font-weight: 600">{{ trip?.name || "行程地图" }}</span>
        <NButton quaternary circle @click="handleClose">
          <template #icon>
            <NIcon><CloseOutline /></NIcon>
          </template>
        </NButton>
      </div>
    </template>

    <div class="map-view-container">
      <NSpin :show="loading" description="加载地图中...">
        <div ref="mapContainer" class="map-container"></div>
      </NSpin>
    </div>
  </NModal>
</template>

<style scoped>
.map-view-container {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border-radius: 8px;
  overflow: hidden;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-header {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.item-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.item-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 0.9rem;
}

.detail-item.notes {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.item-images {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
