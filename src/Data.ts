import { config } from '../Config';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
let db:any = null;

export const getDB = async () => {
	if (!db) {
		db = await open({
			filename: config.db.path,
			mode: sqlite3.OPEN_READWRITE,
			driver: sqlite3.Database
		});
	}
	return db;
};
