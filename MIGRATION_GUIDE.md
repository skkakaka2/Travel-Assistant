# TypeORM 迁移使用指南

## 概述

TypeORM 迁移用于管理数据库 schema 的变更，确保数据库结构与代码同步。

## 配置说明

- **DataSource 配置**: `src/data-source.ts` - 用于 TypeORM CLI
- **迁移目录**: `src/migrations/` - 存储所有迁移文件
- **生产环境**: `synchronize: false` - 必须使用迁移管理 schema

## 常用命令

### 1. 生成迁移（自动检测实体变更）

```bash
# 生成迁移文件（TypeORM 会自动检测实体变更）
pnpm migration:generate src/migrations/MigrationName

# 示例：添加新字段后生成迁移
pnpm migration:generate src/migrations/AddUserAvatarField
```

### 2. 创建空迁移（手动编写 SQL）

```bash
# 创建空的迁移文件，手动编写 SQL
pnpm migration:create src/migrations/MigrationName

# 示例
pnpm migration:create src/migrations/AddIndexToUserEmail
```

### 3. 运行迁移

```bash
# 运行所有未执行的迁移
pnpm migration:run
```

### 4. 回滚迁移

```bash
# 回滚最后一次迁移
pnpm migration:revert
```

### 5. 查看迁移状态

```bash
# 查看哪些迁移已执行，哪些未执行
pnpm migration:show
```

## 迁移文件示例

### 自动生成的迁移

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAvatarField1234567890 implements MigrationInterface {
  name = 'AddUserAvatarField1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`avatar\` varchar(191) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`avatar\``);
  }
}
```

### 手动创建的迁移

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToUserEmail1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX \`IDX_user_email\` ON \`user\` (\`email\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_user_email\` ON \`user\``);
  }
}
```

## 工作流程

### 开发新功能时

1. **修改实体** - 在 `src/**/entities/*.entity.ts` 中修改实体定义
2. **生成迁移** - 运行 `pnpm migration:generate src/migrations/YourMigrationName`
3. **检查迁移** - 查看生成的迁移文件，确保 SQL 正确
4. **运行迁移** - 在开发环境运行 `pnpm migration:run` 测试
5. **提交代码** - 将迁移文件提交到版本控制

### 部署到生产环境

1. **拉取代码** - 包含最新的迁移文件
2. **运行迁移** - 执行 `pnpm migration:run` 应用所有新迁移
3. **启动应用** - 迁移完成后启动应用

## 最佳实践

1. **每次变更都创建迁移** - 不要直接修改数据库
2. **迁移文件要可逆** - `down` 方法要能回滚 `up` 的变更
3. **迁移文件要幂等** - 多次运行不会出错
4. **测试迁移** - 在开发环境先测试迁移和回滚
5. **备份生产数据** - 运行迁移前备份数据库

## 注意事项

- ⚠️ **不要在生产环境使用 `synchronize: true`**
- ✅ **迁移文件要提交到版本控制**
- ✅ **迁移文件名要有意义，描述变更内容**
- ✅ **迁移前先备份数据库**

## 常见问题

### Q: 迁移失败怎么办？

A: 检查错误信息，修复问题后可以：
- 如果迁移已部分执行，手动修复数据库
- 或者回滚迁移：`pnpm migration:revert`
- 修复后重新运行：`pnpm migration:run`

### Q: 如何修改已提交的迁移？

A: 不建议修改已提交的迁移。应该：
- 创建新的迁移来修复问题
- 或者回滚后重新生成

### Q: 迁移文件冲突怎么办？

A: 如果多人同时创建迁移：
- 合并时保留所有迁移文件
- 按时间戳顺序执行
- 如果有冲突，手动解决 SQL 冲突

