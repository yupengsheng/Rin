PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `comments_new` (
  `id` integer PRIMARY KEY NOT NULL,
  `feed_id` integer NOT NULL,
  `user_id` integer,
  `parent_id` integer,
  `author_name` text NOT NULL,
  `author_email` text NOT NULL,
  `author_url` text,
  `content` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`parent_id`) REFERENCES `comments_new`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `comments_new` (
  `id`,
  `feed_id`,
  `user_id`,
  `parent_id`,
  `author_name`,
  `author_email`,
  `author_url`,
  `content`,
  `created_at`,
  `updated_at`
)
SELECT
  c.`id`,
  c.`feed_id`,
  c.`user_id`,
  NULL,
  COALESCE(u.`username`, 'Anonymous'),
  '',
  NULL,
  c.`content`,
  c.`created_at`,
  c.`updated_at`
FROM `comments` c
LEFT JOIN `users` u ON u.`id` = c.`user_id`;
--> statement-breakpoint
DROP TABLE `comments`;
--> statement-breakpoint
ALTER TABLE `comments_new` RENAME TO `comments`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
UPDATE `info` SET `value` = '10' WHERE `key` = 'migration_version';
