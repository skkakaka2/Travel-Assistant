import { MigrationInterface, QueryRunner } from "typeorm";

export class Modifytime1767159150459 implements MigrationInterface {
    name = 'Modifytime1767159150459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_773b65da92373d248afb814a361\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`dayPlanIdId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`startTime\` varchar(5) NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`endTime\` varchar(5) NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_e35f9e54fcbf1f7819c7a34ce38\` FOREIGN KEY (\`dayPlanIdId\`) REFERENCES \`day_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_e35f9e54fcbf1f7819c7a34ce38\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`endTime\` datetime(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`startTime\` datetime(3) NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`dayPlanIdId\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_773b65da92373d248afb814a361\` FOREIGN KEY (\`dayPlanId\`) REFERENCES \`day_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
