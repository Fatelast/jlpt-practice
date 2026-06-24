-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `openid` VARCHAR(100) NOT NULL,
    `unionid` VARCHAR(100) NULL,
    `nickname` VARCHAR(100) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `current_level` VARCHAR(10) NOT NULL DEFAULT 'N5',
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_openid_key`(`openid`),
    INDEX `users_current_level_idx`(`current_level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(30) NOT NULL DEFAULT 'editor',
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `admins_username_key`(`username`),
    INDEX `admins_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `level` VARCHAR(10) NOT NULL,
    `category` VARCHAR(30) NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `stem` TEXT NOT NULL,
    `passage` TEXT NULL,
    `translation` TEXT NULL,
    `explanation` TEXT NOT NULL,
    `answer` VARCHAR(20) NOT NULL,
    `difficulty` TINYINT NOT NULL DEFAULT 1,
    `audio_url` VARCHAR(500) NULL,
    `audio_text` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `source_type` VARCHAR(30) NOT NULL,
    `source_remark` VARCHAR(500) NULL,
    `copyright_status` VARCHAR(30) NOT NULL DEFAULT 'clear',
    `status` VARCHAR(30) NOT NULL DEFAULT 'draft',
    `reject_reason` VARCHAR(500) NULL,
    `created_by` BIGINT NULL,
    `reviewed_by` BIGINT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `published_at` DATETIME(3) NULL,
    `total_attempts` INTEGER NOT NULL DEFAULT 0,
    `correct_attempts` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `questions_level_category_idx`(`level`, `category`),
    INDEX `questions_type_idx`(`type`),
    INDEX `questions_status_idx`(`status`),
    INDEX `questions_difficulty_idx`(`difficulty`),
    INDEX `questions_source_type_idx`(`source_type`),
    INDEX `questions_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_options` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `question_id` BIGINT NOT NULL,
    `option_key` VARCHAR(10) NOT NULL,
    `option_text` TEXT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `question_options_question_id_idx`(`question_id`),
    UNIQUE INDEX `question_options_question_id_option_key_key`(`question_id`, `option_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(30) NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    INDEX `tags_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_tags` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `question_id` BIGINT NOT NULL,
    `tag_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `question_tags_tag_id_idx`(`tag_id`),
    UNIQUE INDEX `question_tags_question_id_tag_id_key`(`question_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `practice_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `level` VARCHAR(10) NOT NULL,
    `category` VARCHAR(30) NOT NULL,
    `mode` VARCHAR(30) NOT NULL,
    `total_count` INTEGER NOT NULL DEFAULT 0,
    `correct_count` INTEGER NOT NULL DEFAULT 0,
    `wrong_count` INTEGER NOT NULL DEFAULT 0,
    `accuracy` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `duration_seconds` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finished_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `practice_records_user_id_idx`(`user_id`),
    INDEX `practice_records_level_category_idx`(`level`, `category`),
    INDEX `practice_records_mode_idx`(`mode`),
    INDEX `practice_records_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `practice_record_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `question_id` BIGINT NOT NULL,
    `selected_answer` VARCHAR(20) NOT NULL,
    `correct_answer` VARCHAR(20) NOT NULL,
    `is_correct` BOOLEAN NOT NULL,
    `duration_seconds` INTEGER NOT NULL DEFAULT 0,
    `answered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `answer_records_practice_record_id_idx`(`practice_record_id`),
    INDEX `answer_records_user_id_idx`(`user_id`),
    INDEX `answer_records_question_id_idx`(`question_id`),
    INDEX `answer_records_answered_at_idx`(`answered_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wrong_questions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `question_id` BIGINT NOT NULL,
    `wrong_count` INTEGER NOT NULL DEFAULT 1,
    `last_wrong_answer` VARCHAR(20) NULL,
    `mastered` BOOLEAN NOT NULL DEFAULT false,
    `first_wrong_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_wrong_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mastered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `wrong_questions_user_id_idx`(`user_id`),
    INDEX `wrong_questions_question_id_idx`(`question_id`),
    INDEX `wrong_questions_mastered_idx`(`mastered`),
    INDEX `wrong_questions_last_wrong_at_idx`(`last_wrong_at`),
    UNIQUE INDEX `wrong_questions_user_id_question_id_key`(`user_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite_questions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `question_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favorite_questions_user_id_idx`(`user_id`),
    INDEX `favorite_questions_question_id_idx`(`question_id`),
    UNIQUE INDEX `favorite_questions_user_id_question_id_key`(`user_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `question_id` BIGINT NULL,
    `type` VARCHAR(50) NOT NULL,
    `content` TEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
    `handler_id` BIGINT NULL,
    `handler_remark` VARCHAR(500) NULL,
    `handled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `feedback_user_id_idx`(`user_id`),
    INDEX `feedback_question_id_idx`(`question_id`),
    INDEX `feedback_status_idx`(`status`),
    INDEX `feedback_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_daily_stats` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `stat_date` DATE NOT NULL,
    `answered_count` INTEGER NOT NULL DEFAULT 0,
    `correct_count` INTEGER NOT NULL DEFAULT 0,
    `wrong_count` INTEGER NOT NULL DEFAULT 0,
    `duration_seconds` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_daily_stats_stat_date_idx`(`stat_date`),
    UNIQUE INDEX `user_daily_stats_user_id_stat_date_key`(`user_id`, `stat_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question_options` ADD CONSTRAINT `question_options_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_tags` ADD CONSTRAINT `question_tags_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_tags` ADD CONSTRAINT `question_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `practice_records` ADD CONSTRAINT `practice_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_records` ADD CONSTRAINT `answer_records_practice_record_id_fkey` FOREIGN KEY (`practice_record_id`) REFERENCES `practice_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_records` ADD CONSTRAINT `answer_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_records` ADD CONSTRAINT `answer_records_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wrong_questions` ADD CONSTRAINT `wrong_questions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wrong_questions` ADD CONSTRAINT `wrong_questions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite_questions` ADD CONSTRAINT `favorite_questions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite_questions` ADD CONSTRAINT `favorite_questions_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_daily_stats` ADD CONSTRAINT `user_daily_stats_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
