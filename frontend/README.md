# 旅行助手前端项目

基于 Vue 3 + TypeScript + Vite 的旅行助手前端应用。

## 技术栈

- Vue 3 (组合式 API)
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
- Axios
- ECharts
- 百度地图

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

### 类型检查

```bash
npm run typecheck
```

## 项目结构

```
src/
├── api/              # API 请求封装
├── assets/           # 静态资源
│   └── styles/       # 样式文件
├── components/       # 公共组件
│   ├── common/       # 通用组件
│   └── business/     # 业务组件
├── composables/      # 组合式函数
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── views/            # 页面视图
    ├── auth/         # 认证页面
    ├── dashboard/    # 首页仪表盘
    ├── user/         # 用户模块
    ├── vehicle/      # 车辆模块
    ├── trip/         # 行程模块
    ├── activity/     # 活动模块
    ├── expense/      # 费用模块
    └── message/      # 站内信模块
```

## 功能模块

### 用户模块
- 登录/注册
- 个人信息管理
- 家庭位置管理
- 车辆绑定

### 车辆模块
- 车辆列表
- 新建/编辑车辆

### 行程模块
- 行程列表
- 行程详情
- 新建/编辑行程
- 开始/结束/取消行程

### 活动模块
- 活动列表
- 活动详情
- 创建活动
- 参加/退出活动

### 费用模块
- 费用列表
- 新建/编辑费用
- 费用统计

### 站内信
- 消息列表
- 消息详情
- 已读/未读管理

## 主题

项目支持亮色/暗色模式切换，主题色为橙色系(#FF6B35)。

## 配置

### 环境变量

编辑 `.env.development` 或 `.env.production`:

```
VITE_API_BASE_URL=/api
VITE_BAIDU_MAP_AK=your_baidu_map_ak
```

### 后端API

后端服务地址配置在 `vite.config.ts` 的 proxy 中:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```