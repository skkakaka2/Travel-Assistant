import { MigrationInterface, QueryRunner } from "typeorm";

export class Addimg1767702352467 implements MigrationInterface {
    name = 'Addimg1767702352467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`imgList\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`imgList\``);
    }

}
