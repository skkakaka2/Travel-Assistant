import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHome1767516051458 implements MigrationInterface {
    name = 'AddHome1767516051458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`homeAddress\` varchar(191) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`homeLatitude\` decimal(10,8) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`homeLongitude\` decimal(11,8) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`homeLongitude\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`homeLatitude\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`homeAddress\``);
    }

}
