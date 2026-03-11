# 旅行助手前端

基于 Vue 3 + TypeScript + Vite + Element Plus 构建的旅行助手前端应用。

## 技术栈

- Vue 3.4+
- TypeScript 5.x
- Vite 5.x
- Element Plus 2.x
- Pinia 2.x
- Vue Router 4.x
- Axios
- SCSS

## 功能模块

- 用户认证（登录/注册）
- 个人中心（用户信息、头像管理）
- 家庭位置管理
- 车辆绑定管理
- 行程管理（创建/开始/结束/取消）
- 费用记录与统计
- 活动中心（创建/参与/退出）
- 消息通知

## 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 项目结构

```
src/
├── api/                 # API 接口封装
├── assets/              # 静态资源
├── components/          # 公共组件
├── layouts/             # 布局组件
├── router/              # 路由配置
├── stores/              # Pinia 状态管理
├── styles/              # 全局样式
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
└── views/               # 页面组件
```

## API 配置

后端 API 地址默认为 `http://localhost:8080`，可在 `vite.config.ts` 中修改代理配置。

## 响应式设计

项目支持移动端响应式适配，在 768px 以下屏幕宽度时自动切换为移动端布局。