CREATE TABLE `referal` (
	`user_id` text(36) PRIMARY KEY NOT NULL,
	`referal_by` text(36),
	`referals` text NOT NULL
);
