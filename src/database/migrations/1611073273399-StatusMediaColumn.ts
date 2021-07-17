import {MigrationInterface, QueryRunner} from "typeorm";

export class StatusMediaColumn1611073273399 implements MigrationInterface {
    name = 'StatusMediaColumn1611073273399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `media` ADD `status` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `clients` CHANGE `id` `id` int UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `media` CHANGE `id` `id` int UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `users` CHANGE `id` `id` int UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `user_tokens` CHANGE `id` `id` int UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `user_tokens` CHANGE `user_id` `user_id` int UNSIGNED NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_tokens` CHANGE `user_id` `user_id` int(10) UNSIGNED NOT NULL");
        await queryRunner.query("ALTER TABLE `user_tokens` CHANGE `id` `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `users` CHANGE `id` `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `media` CHANGE `id` `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `clients` CHANGE `id` `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `media` DROP COLUMN `status`");
    }

}
