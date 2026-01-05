import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRelation1767612719862 implements MigrationInterface {
    name = 'AddUserRelation1767612719862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 检查 day_plan_items 表是否已有 userId 列
        const dayPlanItemsTable = await queryRunner.getTable('day_plan_items');
        const hasDayPlanItemsUserId = dayPlanItemsTable?.findColumnByName('userId');
        
        if (!hasDayPlanItemsUserId) {
            await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`userId\` int NULL`);
        }

        // 检查 day_plans 表是否已有 userId 列
        const dayPlansTable = await queryRunner.getTable('day_plans');
        const hasDayPlansUserId = dayPlansTable?.findColumnByName('userId');
        
        if (!hasDayPlansUserId) {
            await queryRunner.query(`ALTER TABLE \`day_plans\` ADD \`userId\` int NOT NULL`);
        }

        // 检查并添加外键约束（如果不存在）
        const dayPlanItemsForeignKeys = dayPlanItemsTable?.foreignKeys || [];
        const hasDayPlanItemsFK = dayPlanItemsForeignKeys.some(
            fk => fk.columnNames.includes('userId')
        );
        
        if (!hasDayPlanItemsFK) {
            await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_47ba7a1efef75696d09210958a6\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        }

        const dayPlansForeignKeys = dayPlansTable?.foreignKeys || [];
        const hasDayPlansFK = dayPlansForeignKeys.some(
            fk => fk.columnNames.includes('userId')
        );
        
        if (!hasDayPlansFK) {
            await queryRunner.query(`ALTER TABLE \`day_plans\` ADD CONSTRAINT \`FK_e2532f3856bb1bfcd5669514297\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plans\` DROP FOREIGN KEY \`FK_e2532f3856bb1bfcd5669514297\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_47ba7a1efef75696d09210958a6\``);
        await queryRunner.query(`ALTER TABLE \`day_plans\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`userId\``);
    }

}
