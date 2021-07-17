import {MigrationInterface, QueryRunner} from "typeorm";

export class FixMediaEntity1611328750741 implements MigrationInterface {
    name = 'FixMediaEntity1611328750741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `media` DROP COLUMN `uri`");
        await queryRunner.query("ALTER TABLE `media` ADD `thunb_id` int NULL");
        await queryRunner.query("ALTER TABLE `clients` CHANGE `id` `id` int UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `media` CHANGE `id` `id` int UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `media` DROP COLUMN `path`");
        await queryRunner.query("ALTER TABLE `media` ADD `path` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `media` CHANGE `duration` `duration` float NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `id` `id` int UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `user_tokens` CHANGE `id` `id` int UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `user_tokens` CHANGE `user_id` `user_id` int UNSIGNED NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_tokens` CHANGE `user_id` `user_id` int(10) UNSIGNED NOT NULL");
        await queryRunner.query("ALTER TABLE `user_tokens` CHANGE `id` `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `users` CHANGE `id` `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `media` CHANGE `duration` `duration` float(12) NULL");
        await queryRunner.query("ALTER TABLE `media` DROP COLUMN `path`");
        await queryRunner.query("ALTER TABLE `media` ADD `path` json NULL");
        await queryRunner.query("ALTER TABLE `media` CHANGE `id` `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `clients` CHANGE `id` `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `media` DROP COLUMN `thunb_id`");
        await queryRunner.query("ALTER TABLE `media` ADD `uri` longtext NULL");
    }

}
