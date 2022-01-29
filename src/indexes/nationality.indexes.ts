export const NationalityIndexesUp = [
	`CREATE INDEX nationality_name IF NOT EXISTS FOR (n:Nationality) ON (n.name)`,
];

export const NationalityIndexesDown = [
	`DROP INDEX nationality_name IF EXISTS`,
];
