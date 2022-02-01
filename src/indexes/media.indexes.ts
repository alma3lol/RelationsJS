export const MediaIndexesUp = [
	`CREATE INDEX media_name IF NOT EXISTS FOR (n.Media) ON (n.name)`,
	`CREATE INDEX media_path IF NOT EXISTS FOR (n.Media) ON (n.path)`,
	`CREATE INDEX media_type IF NOT EXISTS FOR (n.Media) ON (n.type)`,
];

export const MediaIndexesDown = [
	`DROP INDEX media_name IF EXISTS`,
	`DROP INDEX media_path IF EXISTS`,
	`DROP INDEX media_type IF EXISTS`,
];
