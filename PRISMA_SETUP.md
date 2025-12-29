# Prisma + MySQL 配置说明

## 📦 已安装的依赖

- `@prisma/client` - Prisma 客户端
- `prisma` - Prisma CLI 工具

## 🗄️ 数据库配置

### 1. 环境变量配置

请手动创建 `.env` 文件（参考 `.env.example`）：

```env
# MySQL 数据库连接
DATABASE_URL="mysql://用户名:密码@127.0.0.1:3306/数据库名"

# 示例
DATABASE_URL="mysql://root:password@127.0.0.1:3306/travel_assistant"

# JWT Secret
JWT_SECRET="your-secret-key-change-this-in-production"

# Server Port
PORT=3000
```

### 2. 数据库配置文件

- `prisma.config.ts` - Prisma 配置文件（自动生成）
- `prisma/schema.prisma` - 数据库模型定义

## 🚀 使用步骤

### 1. 创建数据库

首先在 MySQL 中创建数据库：

```sql
CREATE DATABASE travel_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 3. 创建数据库表（首次运行）

```bash
# 方式 1: 使用 migrate（推荐用于生产环境）
pnpm prisma:migrate

# 方式 2: 直接推送 schema（适合开发环境快速迭代）
pnpm prisma:push
```

### 4. 填充测试数据（可选）

```bash
pnpm prisma:seed
```

## 📝 可用的 Prisma 命令

| 命令 | 说明 |
|------|------|
| `pnpm prisma:generate` | 生成 Prisma Client |
| `pnpm prisma:migrate` | 创建并应用数据库迁移 |
| `pnpm prisma:push` | 直接推送 schema 到数据库（不创建迁移文件） |
| `pnpm prisma:pull` | 从现有数据库拉取 schema |
| `pnpm prisma:studio` | 打开 Prisma Studio 可视化管理界面 |
| `pnpm prisma:seed` | 运行种子数据脚本 |

## 💡 在代码中使用 Prisma

### 1. PrismaService 已全局可用

由于 `PrismaModule` 使用了 `@Global()` 装饰器，你可以在任何 Service 中直接注入：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
```

### 2. 示例模型

当前 `schema.prisma` 中定义了一个示例 User 模型：

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  password  String
  name      String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## 🔧 修改数据模型

1. 编辑 `prisma/schema.prisma` 添加或修改模型
2. 运行 `pnpm prisma:generate` 生成新的 Client
3. 运行 `pnpm prisma:migrate` 创建迁移并应用到数据库

## 🎨 Prisma Studio

运行可视化数据库管理界面：

```bash
pnpm prisma:studio
```

访问 `http://localhost:5555` 即可查看和编辑数据。

## ⚠️ 注意事项

1. **不要提交 `.env` 文件到 Git**（已在 `.gitignore` 中配置）
2. **生产环境请修改 `JWT_SECRET`** 为强密码
3. **Prisma Client 生成路径**：`generated/prisma`（已在 `.gitignore` 中）
4. **数据库连接**：确保 MySQL 服务已启动并可访问

## 📚 更多资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

