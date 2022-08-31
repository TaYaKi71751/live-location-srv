import { ApolloServer, gql } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';
import {config} from '../../Config';
import {Query} from './Query';
import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import { default as typeDefs } from './schema'

let db:any = null;

export const resolvers = {
	Query: {
		updateLocation: Query.updateLocation
	},
};

export const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

export const apolloServer = new ApolloServer({
	schema,
	playground: config.apollo.playground,
	introspection: true,
	async context ({req,res}) {
		const getDB = async () => {
			if(!db) {
				db = await open({
					filename: config.db.path,
					mode: sqlite3.OPEN_READWRITE,
					driver: sqlite3.Database
				});
			}
			return db;
		};

		const {user,device} = await Query.auth(undefined,req.headers,{getDB});
		return {
			getDB,
			resolvers,
			user,
			device
		};
	}
});