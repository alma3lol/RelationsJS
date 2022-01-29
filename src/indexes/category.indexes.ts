export const CategoryIndexesUp = [
	`CREATE INDEX category_name IF NOT EXISTS FOR (n:Category) ON (n.name)`,
];

export const CategoryIndexesDown = [
	`DROP INDEX category_name IF EXISTS`,
];
