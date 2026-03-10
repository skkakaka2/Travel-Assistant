# Travel-Assistant（旅行助手）

一个基于 Spring Boot 的旅行助手后端服务，提供用户管理、车辆管理、行程管理、活动管理、费用管理等功能。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.2.0 | 基础框架 |
| Spring Security | - | 安全框架 |
| MyBatis-Plus | 3.5.5 | ORM 框架 |
| MySQL | 8.x | 数据库 |
| JWT | 0.12.3 | 认证方案 |
| SpringDoc | 2.3.0 | API 文档 |

## 项目结构

```
src/main/java/com/travel/assistant/
├── TravelAssistantApplication.java    # 启动类
├── common/                            # 公共模块
│   ├── config/                        # 配置类
│   ├── exception/                     # 异常处理
│   ├── result/                        # 统一返回结果
│   ├── enums/                         # 枚举类
│   ├── utils/                         # 工具类
│   ├── service/                       # 公共服务
│   └── controller/                    # 公共控制器
├── modules/                           # 业务模块
│   ├── user/                          # 用户模块
│   ├── vehicle/                       # 车辆模块
│   ├── trip/                          # 行程模块
│   ├── activity/                      # 活动模块
│   ├── expense/                       # 费用模块
│   ├── message/                       # 站内信模块
│   └── map/                           # 地图服务
└── entity/                            # 实体基类
```

## 快速开始

### 1. 环境准备

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库初始化

```bash
# 创建数据库并执行初始化脚本
mysql -u root -p < src/main/resources/db/init.sql
```

### 3. 修改配置

编辑 `src/main/resources/application-dev.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/travel_assistant?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8&allowPublicKeyRetrieval=true
    username: your_username
    password: your_password

app:
  baidu-map:
    ak: your_baidu_map_ak  # 替换为您的百度地图 API Key
```

### 4. 启动项目

```bash
# 编译项目
mvn clean package -DskipTests

# 运行项目
java -jar target/travel-assistant-1.0.0.jar
```

### 5. 访问 API 文档

启动成功后访问：http://localhost:8080/swagger-ui.html

## 功能模块

### 用户管理
- 用户注册/登录（JWT 认证）
- 个人信息管理
- 家庭位置管理
- 车辆绑定

### 车辆管理
- 车辆信息维护（型号、百公里油耗）
- 车辆绑定/解绑

### 行程管理
- 行程创建与规划
- 集成百度地图 API 计算路线
- 行程状态管理（未开始/进行中/已完成/已取消）

### 活动管理
- 活动创建与管理
- 活动参与/退出
- 活动人数限制

### 费用管理
- 费用记录（油费、过路费、停车费、维修费等）
- 费用统计

### 站内信
- 消息通知
- 已读/未读状态管理

### 地图服务
- 地理编码（地址转坐标）
- 逆地理编码（坐标转地址）
- 路线规划

## API 接口

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 认证 | `/api/auth` | 登录、注册 |
| 用户 | `/api/user` | 用户信息、家庭位置、车辆绑定 |
| 车辆 | `/api/vehicles` | 车辆管理 |
| 行程 | `/api/trips` | 行程管理 |
| 活动 | `/api/activities` | 活动管理 |
| 费用 | `/api/expenses` | 费用管理 |
| 消息 | `/api/messages` | 站内信 |
| 地图 | `/api/map` | 地图服务 |
| 文件 | `/api/files` | 文件上传 |

## 认证说明

本项目使用 JWT 进行认证。

1. 登录成功后获取 Token
2. 后续请求在 Header 中携带：`Authorization: Bearer {token}`

## 百度地图配置

1. 前往 [百度地图开放平台](https://lbsyun.baidu.com/) 注册账号
2. 创建应用获取 AK
3. 在配置文件中设置 `app.baidu-map.ak`

## 开发说明

### 代码分层

```
Controller -> Service -> Mapper
    │           │         │
    │           │         └── 数据库操作
    │           └── 业务逻辑处理
    └── 接收请求，返回响应
```

### 统一返回格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 异常处理

使用 `BusinessException` 抛出业务异常，全局异常处理器会统一处理。

```java
throw new BusinessException(ErrorCode.USER_NOT_FOUND);
```

## License

MIT