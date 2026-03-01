CREATE TABLE `user_states` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`state_type` text NOT NULL,
	`payload` text,
	`exp` integer NOT NULL
);
