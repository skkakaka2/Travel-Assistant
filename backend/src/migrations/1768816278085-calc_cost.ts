import { MigrationInterface, QueryRunner } from "typeorm";

export class CalcCost1768816278085 implements MigrationInterface {
    name = 'CalcCost1768816278085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`roadCost\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`day_plans\` ADD \`isHoliday\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`trips\` ADD \`roadCost\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`trips\` ADD \`totalCost\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`fuelConsumption\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`perKilometerCost\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` CHANGE \`cost\` \`cost\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` CHANGE \`cost\` \`cost\` int NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`perKilometerCost\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`fuelConsumption\``);
        await queryRunner.query(`ALTER TABLE \`trips\` DROP COLUMN \`totalCost\``);
        await queryRunner.query(`ALTER TABLE \`trips\` DROP COLUMN \`roadCost\``);
        await queryRunner.query(`ALTER TABLE \`day_plans\` DROP COLUMN \`isHoliday\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`roadCost\``);
    }

}
