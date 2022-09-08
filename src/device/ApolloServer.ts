import { ApolloServer } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';

import { config } from '../../Config';
import typeDefs from './schema';

import { resolvers } from './Resolver';
import { context } from './Context';

export const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

export const apolloServer = new ApolloServer({
	schema,
	playground: config.apollo.playground,
	introspection: true,
	context
});
