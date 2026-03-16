# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Travel Assistant（旅行助手）是一个基于 Go 的 REST API 项目，用于旅行管理。使用 Gin 框架、GORM、MySQL 和 JWT 认证构建。

## 常用命令

### 构建和运行

```bash
# 生成 Swagger 文档
task swag

# 运行应用（包含 swag 生成）
task run

# 构建应用
# 输出：Windows 下为 bin/app.exe，Linux/Mac 下为 bin/app
task build

# 清理构建产物和文档
task clean
```

### Go 命令

```bash
# 直接运行（不生成 swagger）
go run main.go

# 构建二进制文件
go build -o travel-assistant main.go

# 运行测试
go test ./...

# 运行特定测试
go test ./src/modules/user/...

# 安装依赖
go mod tidy
```

### 主要依赖

关键依赖（详见 go.mod）：
- `github.com/gin-gonic/gin` - Web 框架
- `gorm.io/gorm` + `gorm.io/driver/mysql` - ORM
- `github.com/golang-jwt/jwt/v5` - JWT 认证
- `github.com/swaggo/swag` + `github.com/swaggo/gin-swagger` - API 文档
- `go.uber.org/zap` + `gopkg.in/natefinch/lumberjack.v2` - 日志
- `github.com/spf13/viper` - 配置管理
- `golang.org/x/crypto/bcrypt` - 密码哈希

## 架构说明

### 项目结构

```
├── main.go                 # 入口：初始化配置、数据库、日志、路由
├── config.yaml            # 应用配置
├── Taskfile.yml           # Task 运行器配置
├── src/
│   ├── router/
│   │   └── router.go      # 路由设置、中间件绑定、API 分组
│   ├── common/            # 共享基础设施代码
│   │   ├── config/        # 配置、数据库连接、自动迁移、安全工具
│   │   ├── logger/        # Zap 日志 + lumberjack 轮转
│   │   ├── middleware/    # JWT 认证中间件
│   │   └── response/      # 标准化 API 响应辅助函数
│   ├── modules/           # 领域模块（auth、user、trip）
│   │   ├── auth/service/  # 认证服务（当前较简单）
│   │   ├── user/          # 用户模块
│   │   │   ├── entity/user.entity.go    # 用户模型（GORM）
│   │   │   └── service/user.service.go  # 注册/登录处理器
│   │   └── trip/          # 行程模块
│   │       ├── entity/trip.entity.go    # 行程模型（GORM）
│   │       └── service/trip.service.go  # CRUD 处理器
│   └── utils/             # 空目录（工具类占位）
├── docs/                  # Swagger 自动生成文档
└── logs/                  # 应用日志（app.log）
```

### 模块模式

每个领域模块遵循以下结构：
- `entity/` - GORM 模型，带 JSON 和数据库映射的 struct tag
- `service/` - HTTP 处理器（类似控制器），带 Swagger 注解

### 配置系统

配置优先级（从高到低）：
1. 环境变量（前缀：`APP_`，如 `APP_MYSQL_DSN`）
2. `.env.development` 或 `.env.production`（基于 `GO_ENV`）
3. `config.yaml`

关键配置项：
- `server.port` - HTTP 服务端口
- `jwt.secret` - JWT 签名密钥
- `mysql.dsn` - MySQL 连接字符串

### 认证流程

1. 登录/注册：返回 JWT token，存储在 cookie（`travel_assistant_token`）中
2. 受保护路由：使用 `middleware.JwtMiddleware()`，该中间件：
   - 从 cookie 读取 token
   - 验证 JWT 签名
   - 将 `userId` 和 `userName` 设置到 Gin 上下文
3. Token 有效期：24 小时

### 安全工具（`src/common/config/security.go`）

认证工具类使用单例模式：
- `SecurityUtils.EncodePassword(password)` - bcrypt 哈希
- `SecurityUtils.ComparePassword(hashed, plain)` - bcrypt 比对
- `SecurityUtils.GenerateToken(userID, userName)` - 创建 JWT
- `SecurityUtils.VerifyToken(token)` - 验证 JWT
- `SecurityUtils.GetTokenClaims(token)` - 提取声明

### 数据库

- GORM + MySQL 驱动
- 开发模式下自动迁移（`db.go` 中的 `AutoMigrate()`）
- 全局 DB 实例：`config.DB`
- 通过 `sqlDB.Ping()` 验证连接

### 响应格式

标准 API 响应（`src/common/response/response.go`）：
- 成功：`{"code": 0, "message": "...", "data": {...}}`
- 错误：`{"code": HTTP状态码, "message": "..."}`
- 分页：`{"code": 0, "message": "...", "data": {"list": [...], "total": N, "page": N, "pageSize": N}}`

### 日志

Zap 日志配置：
- 控制台输出（debug 级别，人类可读）
- 文件输出（info 级别，JSON 格式，lumberjack 轮转）
- 日志路径：`logs/app.log`

## 开发注意事项

### 环境设置

1. 设置 `GO_ENV=development` 进入开发模式（自动迁移、debug 日志）
2. 在 `.env.development` 或通过 `APP_MYSQL_DSN` 配置 MySQL DSN
3. 确保 `config.yaml` 存在且结构正确

### Swagger 文档

- 注解写在 service 文件中（如 `user.service.go`）
- 运行 `task swag` 重新生成 `docs/swagger.json` 和 `docs/swagger.yaml`
- 访问地址：`/swagger/index.html`

### 添加新模块

1. 创建 `src/modules/<name>/entity/<name>.entity.go` - 定义 GORM 模型，实现 `TableName()` 方法
2. 创建 `src/modules/<name>/service/<name>.service.go` - 定义处理器，编写请求/响应结构体
3. 在 `src/router/router.go` 中添加路由，绑定适当中间件
4. 在 `src/common/config/automigrate.go` 中注册实体以启用自动迁移

### 代码风格

- 单例工具类使用结构体方法（参考 `security.go`）
- 处理器函数接收 `*gin.Context`，使用 `c.ShouldBindJSON()` 或 `c.ShouldBindQuery()`
- 通过 `c.GetUint("userId")` 获取已认证用户
