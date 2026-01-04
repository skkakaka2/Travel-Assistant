import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDistance1767515947273 implements MigrationInterface {
    name = 'AddDistance1767515947273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`distance\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`distance\``);
    }

}
