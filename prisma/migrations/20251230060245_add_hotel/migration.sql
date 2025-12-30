-- CreateTable
CREATE TABLE `day_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tripId` INTEGER NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `dayNumber` INTEGER NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `day_plans_tripId_idx`(`tripId`),
    INDEX `day_plans_date_idx`(`date`),
    UNIQUE INDEX `day_plans_tripId_date_key`(`tripId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `day_plan_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dayPlanId` INTEGER NOT NULL,
    `type` ENUM('HOTEL', 'ATTRACTION', 'RESTAURANT', 'TRANSPORT', 'ACTIVITY', 'OTHER') NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(500) NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `cost` INTEGER NULL DEFAULT 0,
    `notes` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `day_plan_items_dayPlanId_idx`(`dayPlanId`),
    INDEX `day_plan_items_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `day_plans` ADD CONSTRAINT `day_plans_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `day_plan_items` ADD CONSTRAINT `day_plan_items_dayPlanId_fkey` FOREIGN KEY (`dayPlanId`) REFERENCES `day_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
