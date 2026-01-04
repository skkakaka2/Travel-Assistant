import { MigrationInterface, QueryRunner } from "typeorm";

export class Addlatitude1767506330471 implements MigrationInterface {
    name = 'Addlatitude1767506330471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`latitude\` decimal(10,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`longitude\` decimal(11,8) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`latitude\``);
    }

}
