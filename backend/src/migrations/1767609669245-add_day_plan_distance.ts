import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDayPlanDistance1767609669245 implements MigrationInterface {
    name = 'AddDayPlanDistance1767609669245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plans\` ADD \`distance\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plans\` ADD \`duration\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plans\` DROP COLUMN \`duration\``);
        await queryRunner.query(`ALTER TABLE \`day_plans\` DROP COLUMN \`distance\``);
    }

}
