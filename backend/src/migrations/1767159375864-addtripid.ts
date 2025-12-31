import { MigrationInterface, QueryRunner } from "typeorm";

export class Addtripid1767159375864 implements MigrationInterface {
    name = 'Addtripid1767159375864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`tripId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD \`tripIdId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_d596f92b2b33d2a6ac4c264f63a\` FOREIGN KEY (\`tripIdId\`) REFERENCES \`trips\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_d596f92b2b33d2a6ac4c264f63a\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`tripIdId\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP COLUMN \`tripId\``);
    }

}
