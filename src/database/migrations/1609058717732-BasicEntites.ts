import {MigrationInterface, QueryRunner} from "typeorm";

export class BasicEntites1609058717732 implements MigrationInterface {
    name = 'BasicEntites1609058717732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `clients` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `client_id` varchar(255) NULL, `secret_key` varchar(255) NULL, `created_at` int NULL, `updated_at` int NULL, `deleted_at` datetime(6) NULL, INDEX `idx_secretKey` (`secret_key`), INDEX `idx_clientId` (`client_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `media` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `name` varchar(255) NULL, `path` json NULL, `uri` longtext NULL, `created_by` varchar(255) NULL, `size` int NULL, `file_type` varchar(255) NULL, `type` tinyint NOT NULL, `created_at` int NOT NULL, `updated_at` int NULL, `deleted_at` datetime(6) NULL, INDEX `idx_createdBy` (`created_by`), INDEX `idx_type` (`type`), INDEX `idx_fileType` (`file_type`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `users` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `full_name` varchar(100) NULL, `username` varchar(190) NULL, `role` int NOT NULL COMMENT 'ADMIN = 1, LAWYER = 2 , CUSTOMER = 3' DEFAULT 1, `password` varchar(100) NULL, `created_at` int NULL, `updated_at` int NULL, `deleted_at` datetime(6) NULL, INDEX `idx_role` (`role`), INDEX `idx_username` (`username`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_tokens` (`id` int UNSIGNED NOT NULL AUTO_INCREMENT, `user_id` int UNSIGNED NOT NULL, `type` tinyint NULL COMMENT '1 - refresh token / 2- forgot password token', `token_id` varchar(128) NULL COMMENT 'uuid v4', `expires_at` int NULL, `created_at` int NULL, `deleted_at` int NULL, INDEX `idx_parentId` (`user_id`), INDEX `idx_token_id` (`token_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `idx_token_id` ON `user_tokens`");
        await queryRunner.query("DROP INDEX `idx_parentId` ON `user_tokens`");
        await queryRunner.query("DROP TABLE `user_tokens`");
        await queryRunner.query("DROP INDEX `idx_username` ON `users`");
        await queryRunner.query("DROP INDEX `idx_role` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
        await queryRunner.query("DROP INDEX `idx_fileType` ON `media`");
        await queryRunner.query("DROP INDEX `idx_type` ON `media`");
        await queryRunner.query("DROP INDEX `idx_createdBy` ON `media`");
        await queryRunner.query("DROP TABLE `media`");
        await queryRunner.query("DROP INDEX `idx_clientId` ON `clients`");
        await queryRunner.query("DROP INDEX `idx_secretKey` ON `clients`");
        await queryRunner.query("DROP TABLE `clients`");
    }

}
