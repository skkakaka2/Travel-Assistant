import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationName1767097664754 implements MigrationInterface {
    name = 'MigrationName1767097664754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`day_plan_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dayPlanId\` int NOT NULL, \`type\` enum ('HOTEL', 'ATTRACTION', 'RESTAURANT', 'TRANSPORT', 'ACTIVITY', 'OTHER') NOT NULL, \`name\` varchar(255) NOT NULL, \`address\` varchar(500) NULL, \`startTime\` datetime(3) NULL, \`endTime\` datetime(3) NULL, \`duration\` int NULL, \`cost\` int NULL DEFAULT '0', \`notes\` text NULL, \`order\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), INDEX \`day_plan_items_type_idx\` (\`type\`), INDEX \`day_plan_items_dayPlanId_idx\` (\`dayPlanId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`day_plans\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tripId\` int NOT NULL, \`date\` varchar(191) NOT NULL, \`dayNumber\` int NOT NULL, \`notes\` text NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), INDEX \`day_plans_date_idx\` (\`date\`), INDEX \`day_plans_tripId_idx\` (\`tripId\`), UNIQUE INDEX \`day_plans_tripId_date_key\` (\`tripId\`, \`date\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`trips\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`userCount\` int NOT NULL DEFAULT '0', \`budget\` int NOT NULL DEFAULT '0', \`startDate\` varchar(191) NOT NULL, \`endDate\` varchar(191) NOT NULL, \`description\` text NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), \`userId\` int NOT NULL, INDEX \`trips_startDate_idx\` (\`startDate\`), INDEX \`trips_userId_idx\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(191) NOT NULL, \`username\` varchar(191) NOT NULL, \`password\` varchar(191) NOT NULL, \`name\` varchar(191) NULL, \`avatar\` varchar(191) NULL, \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3), UNIQUE INDEX \`User_username_key\` (\`username\`), UNIQUE INDEX \`User_email_key\` (\`email\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` ADD CONSTRAINT \`FK_773b65da92373d248afb814a361\` FOREIGN KEY (\`dayPlanId\`) REFERENCES \`day_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`day_plans\` ADD CONSTRAINT \`FK_1ad22e29caa6624a5790cc6e09f\` FOREIGN KEY (\`tripId\`) REFERENCES \`trips\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trips\` ADD CONSTRAINT \`FK_db768456df45322f8a749534322\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`trips\` DROP FOREIGN KEY \`FK_db768456df45322f8a749534322\``);
        await queryRunner.query(`ALTER TABLE \`day_plans\` DROP FOREIGN KEY \`FK_1ad22e29caa6624a5790cc6e09f\``);
        await queryRunner.query(`ALTER TABLE \`day_plan_items\` DROP FOREIGN KEY \`FK_773b65da92373d248afb814a361\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`User_email_key\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`User_username_key\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`trips_userId_idx\` ON \`trips\``);
        await queryRunner.query(`DROP INDEX \`trips_startDate_idx\` ON \`trips\``);
        await queryRunner.query(`DROP TABLE \`trips\``);
        await queryRunner.query(`DROP INDEX \`day_plans_tripId_date_key\` ON \`day_plans\``);
        await queryRunner.query(`DROP INDEX \`day_plans_tripId_idx\` ON \`day_plans\``);
        await queryRunner.query(`DROP INDEX \`day_plans_date_idx\` ON \`day_plans\``);
        await queryRunner.query(`DROP TABLE \`day_plans\``);
        await queryRunner.query(`DROP INDEX \`day_plan_items_dayPlanId_idx\` ON \`day_plan_items\``);
        await queryRunner.query(`DROP INDEX \`day_plan_items_type_idx\` ON \`day_plan_items\``);
        await queryRunner.query(`DROP TABLE \`day_plan_items\``);
    }

}
