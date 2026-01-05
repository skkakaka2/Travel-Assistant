import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRelation1767617174593 implements MigrationInterface {
    name = 'FixRelation1767617174593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_d596f92b2b33d2a6ac4c264f63a\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_e35f9e54fcbf1f7819c7a34ce38\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`dayPlanIdId\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`tripIdId\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_773b65da92373d248afb814a361\` FOREIGN KEY (\`dayPlanId\`) REFERENCES \`day_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_252116e9139a9503fe3db27e195\` FOREIGN KEY (\`tripId\`) REFERENCES \`trips\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_252116e9139a9503fe3db27e195\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_773b65da92373d248afb814a361\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`tripIdId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`dayPlanIdId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_e35f9e54fcbf1f7819c7a34ce38\` FOREIGN KEY (\`dayPlanIdId\`) REFERENCES \`day_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_d596f92b2b33d2a6ac4c264f63a\` FOREIGN KEY (\`tripIdId\`) REFERENCES \`trips\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
