# Migrations

This directory contains TypeORM migration files.

## Migration File Naming Convention

Migration files should follow this naming pattern:
```
{timestamp}-{MigrationName}.ts
```

Example:
```
1234567890123-AddUserAvatarField.ts
```

## Creating Migrations

### Auto-generate from entity changes:
```bash
pnpm migration:generate src/migrations/YourMigrationName
```

### Create empty migration (manual SQL):
```bash
pnpm migration:create src/migrations/YourMigrationName
```

## Running Migrations

```bash
# Run all pending migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert

# Show migration status
pnpm migration:show
```

