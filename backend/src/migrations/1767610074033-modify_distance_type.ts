import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDistanceType1767610074033 implements MigrationInterface {
    name = 'ModifyDistanceType1767610074033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 先将所有 NULL 值更新为 0，然后再修改字段约束
        // day_plan_items 表
        await queryRunner.query(`UPDATE \`day_plan_items\` SET \`duration\` = 0 WHERE \`duration\` IS NULL`);
        await queryRunner.query(`UPDATE \`day_plan_items\` SET \`distance\` = 0 WHERE \`distance\` IS NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` CHANGE \`duration\` \`duration\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` CHANGE \`distance\` \`distance\` int NOT NULL DEFAULT '0'`);
        
        // day_plans 表
        await queryRunner.query(`UPDATE \`day_plans\` SET \`distance\` = 0 WHERE \`distance\` IS NULL`);
        await queryRunner.query(`UPDATE \`day_plans\` SET \`duration\` = 0 WHERE \`duration\` IS NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plans\` CHANGE \`distance\` \`distance\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`day_plans\` CHANGE \`duration\` \`duration\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plans\` CHANGE \`duration\` \`duration\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plans\` CHANGE \`distance\` \`distance\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` CHANGE \`distance\` \`distance\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` CHANGE \`duration\` \`duration\` int NULL`);
    }

}
