CREATE TABLE `transactions` (
	`provider_payment_charge_id` text PRIMARY KEY NOT NULL,
	`telegram_payment_charge_id` text NOT NULL,
	`user_id` text(36) NOT NULL,
	`data` text NOT NULL,
	`create_at` integer DEFAULT (unixepoch()) NOT NULL
);
