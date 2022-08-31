import { ApolloServer, gql } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';
import {config} from '../../Config';
import {Query} from './Query';
import {Subscription} from './Subscription';
import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import { default as typeDefs } from './schema';

let db:any = null;

export const resolvers = {
	Query: {
		addDevice: Query.addDevice,
		deactivateDevice: Query.deactivateDevice
	},
	Subscription
};

export const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

export const apolloServer = new ApolloServer({
	schema,
	playground: config.apollo.playground,
	introspection: true,
	async context ({req}) {
		const getDB = async () => {
			if(!db) {
				db = await open({
					filename: config.db.path,
					mode: sqlite3.OPEN_READWRITE,
					driver: sqlite3.Database
				});
			}
			return db;
		}
		const {user} = await Query.auth(undefined,req.headers,{getDB});
		return {
			getDB,
			resolvers,
			user
		};
	}
});
