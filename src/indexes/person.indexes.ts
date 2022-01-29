export const PersonIndexesUp = [
	`CREATE INDEX person_fileNumber IF NOT EXISTS FOR (n:Person) ON (n.fileNumber)`,
	`CREATE INDEX person_arabicName IF NOT EXISTS FOR (n:Person) ON (n.arabicName)`,
	'CREATE INDEX person_englishName IF NOT EXISTS FOR (n:Person) ON (n.englishName)',
	'CREATE INDEX person_motherName IF NOT EXISTS FOR (n:Person) ON (n.motherName)',
	'CREATE INDEX person_nickname IF NOT EXISTS FOR (n:Person) ON (n.nickname)',
	'CREATE INDEX person_address IF NOT EXISTS FOR (n:Person) ON (n.address)',
	'CREATE INDEX person_notes IF NOT EXISTS FOR (n:Person) ON (n.notes)',
];

export const PersonIndexesDown = [
	`DROP INDEX person_fileNumber IF EXISTS`,
	`DROP INDEX person_arabicName IF EXISTS`,
	`DROP INDEX person_englishName IF EXISTS`,
	`DROP INDEX person_motherName IF EXISTST`,
	`DROP INDEX person_nickname IF EXISTS`,
	`DROP INDEX person_address IF EXISTS`,
	`DROP INDEX person_notes IF EXISTS`,
];
