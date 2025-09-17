CREATE TABLE `sub_controls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`control_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`control_id`) REFERENCES `security_controls`(`id`) ON UPDATE no action ON DELETE no action
);
