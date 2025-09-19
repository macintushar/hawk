-- Create notification_settings table for user-defined notification preferences
CREATE TABLE IF NOT EXISTS `notification_settings` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `slack_enabled` integer DEFAULT 0 NOT NULL,
  `slack_webhook_url` text,
  `slack_channel` text,
  `on_monitor_down` integer DEFAULT 1 NOT NULL,
  `on_monitor_up` integer DEFAULT 0 NOT NULL,
  `on_incident_created` integer DEFAULT 1 NOT NULL,
  `on_incident_resolved` integer DEFAULT 1 NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  CONSTRAINT `notification_settings_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Ensure one settings row per user
CREATE UNIQUE INDEX IF NOT EXISTS `notification_settings_user_unique` ON `notification_settings` (`user_id`);


