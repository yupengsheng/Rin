CREATE INDEX IF NOT EXISTS `idx_feeds_alias` ON `feeds` (`alias`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_feeds_public_sort` ON `feeds` (`draft`, `listed`, `top`, `created_at`, `updated_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_moments_created_at` ON `moments` (`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_comments_feed_parent` ON `comments` (`feed_id`, `parent_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_friends_accepted_sort` ON `friends` (`accepted`, `sort_order`, `created_at`);
--> statement-breakpoint
CREATE VIRTUAL TABLE IF NOT EXISTS `feeds_search` USING fts5(
  `title`,
  `summary`,
  `content`,
  `alias`,
  content='feeds',
  content_rowid='id',
  tokenize='unicode61'
);
--> statement-breakpoint
INSERT INTO `feeds_search` (`rowid`, `title`, `summary`, `content`, `alias`)
SELECT `id`, COALESCE(`title`, ''), COALESCE(`summary`, ''), `content`, COALESCE(`alias`, '')
FROM `feeds`;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `feeds_search_ai` AFTER INSERT ON `feeds` BEGIN
  INSERT INTO `feeds_search` (`rowid`, `title`, `summary`, `content`, `alias`)
  VALUES (new.`id`, COALESCE(new.`title`, ''), COALESCE(new.`summary`, ''), new.`content`, COALESCE(new.`alias`, ''));
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `feeds_search_ad` AFTER DELETE ON `feeds` BEGIN
  INSERT INTO `feeds_search` (`feeds_search`, `rowid`, `title`, `summary`, `content`, `alias`)
  VALUES ('delete', old.`id`, COALESCE(old.`title`, ''), COALESCE(old.`summary`, ''), old.`content`, COALESCE(old.`alias`, ''));
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS `feeds_search_au` AFTER UPDATE ON `feeds` BEGIN
  INSERT INTO `feeds_search` (`feeds_search`, `rowid`, `title`, `summary`, `content`, `alias`)
  VALUES ('delete', old.`id`, COALESCE(old.`title`, ''), COALESCE(old.`summary`, ''), old.`content`, COALESCE(old.`alias`, ''));
  INSERT INTO `feeds_search` (`rowid`, `title`, `summary`, `content`, `alias`)
  VALUES (new.`id`, COALESCE(new.`title`, ''), COALESCE(new.`summary`, ''), new.`content`, COALESCE(new.`alias`, ''));
END;
