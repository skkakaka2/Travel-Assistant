import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRelation1767613208432 implements MigrationInterface {
    name = 'AddUserRelation1767613208432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 检查外键约束是否已存在
        const dayPlansTable = await queryRunner.getTable('day_plans');
        const dayPlansForeignKeys = dayPlansTable?.foreignKeys || [];
        const hasDayPlansFK = dayPlansForeignKeys.some(
            fk => fk.name === 'FK_e2532f3856bb1bfcd5669514297' || 
                  (fk.columnNames.includes('userId') && fk.referencedTableName === 'user')
        );
        
        if (!hasDayPlansFK) {
            await queryRunner.query(`ALTER TABLE \`day_plans\` ADD CONSTRAINT \`FK_e2532f3856bb1bfcd5669514297\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plans\` DROP FOREIGN KEY \`FK_e2532f3856bb1bfcd5669514297\``);
    }

}
