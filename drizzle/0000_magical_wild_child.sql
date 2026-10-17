CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`recipe_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `samples` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`owner` text NOT NULL,
	`created_at` integer NOT NULL
);
