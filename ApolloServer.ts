import { ApolloServer, gql } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';

import SocketIO from 'socket.io';
import {Query as userQuery} from './src/user/Query';
import {Query as deviceQuery} from './src/device/Query';
import { getDB } from './src/Data';

import {config} from './Config';
import {default as typeDefs} from './schema';

const oe = Object.entries;
const fe = Object.fromEntries;
const js = JSON.stringify;

export const resolvers = {
	Query:{
		addDevice: userQuery.addDevice,
		deactivateDevice: userQuery.deactivateDevice,
		updateLocation: deviceQuery.updateLocation
	}
};

export async function context (incoming:{
	io:SocketIO.Server
	socket:any,
	path:string,
}) {
	const _vars:any = await ((
		(path)=>{
			if((path && path?.startsWith('/user'))) { return userQuery; }
			if((path && path?.startsWith('/device'))) { return deviceQuery; }
		})(incoming.path))?.auth(undefined,incoming.socket.handshake.auth,{getDB});
	return {
		getDB,
		resolvers,
		user: _vars?.user || _vars?.data?.user,
		device: _vars?.device || _vars?.data?.device,
		io:incoming.io,
		socket:incoming.socket
	};
}

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

export const apolloServer = new ApolloServer({
	schema,
	playground: config.apollo.playground,
	introspection: true,
	context
});
