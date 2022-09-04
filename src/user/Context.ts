import SocketIO from 'socket.io';
import { Query } from './Query';
import { resolvers } from './ApolloServer';
import { config } from '../../Config';
import { getDB } from '../Data';

export async function context (incoming:{
	io:SocketIO.Server
	socket:any,
	path:string,
}) {
	const auth = incoming?.socket?.handshake?.auth;
	let $auth$1:any;
	switch (incoming.path) {
	case `${config.io.path.user.subscriptions}`:
		$auth$1 = await Query.auth(undefined, auth, { getDB, Query }); break;
	case `${config.io.path.user.graphql}`:
		$auth$1 = await Query.auth(undefined, auth, { getDB, Query }); break;
	default: break;
	}
	return {
		getDB,
		resolvers,
		Query,
		user: { id: $auth$1?.data?.user?.id },
		device: { id: auth?.device?.id },
		io: incoming.io,
		socket: incoming.socket
	};
}
