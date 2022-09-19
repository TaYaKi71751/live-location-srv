import http from 'http';
import SocketIO from 'socket.io';
import { config } from './Config';
import { getDB } from './src/Data';
import { auth as userAuth } from './src/user/Query/index';
import { auth as deviceAuth, selectDevices } from './src/device/Query/index';
import { apolloServer as userApolloServer } from './src/user/ApolloServer';
import { apolloServer as deviceApolloServer } from './src/device/ApolloServer';

const path = config.io.path;
const hostname = config.io.hostname;
const port = config.io.port;

const auth = async (fn, input, socket) => {
	const $auth$1 = await fn(undefined, input, { getDB });
	const errors = $auth$1?.errors;
	const rows = $auth$1?.data?.rows;
	if (
		rows?.length != 1 ||
		errors?.length
	) { socket.disconnect(true); };
	return { rows, errors };
};
const httpServer = http.createServer();
const io = new SocketIO.Server(httpServer, {
	cors: {
		origin: '*' // TODO EDIT THIS
	}
});
const paths = [
	`${path.user.subscriptions}`,
	`${path.user.graphql}`,
	`${path.device.graphql}`
];

paths.forEach((path) => {
	const connectionEvents = ['connection', 'disconnection'];
	connectionEvents.forEach((connectionEvent) => {
		io.of(path).on(connectionEvent, (socket) => {
			console.log(`[${path}]`, `[${connectionEvent}]`, socket.id);
		});
	});
});

io.of(`${path.user.subscriptions}`).on('connection', async (socket) => {
	const _ = socket.handshake.auth;
	const $auth$1 = await auth(userAuth, {
		user: {
			email: _?.user?.email,
			password: _?.user?.password
		}
	}, socket);
	let rows:any = null;
	let errors:any = null;
	if (
		(rows = $auth$1?.rows)?.length != 1 ||
		(errors = $auth$1?.errors)?.length
	) { socket.disconnect(errors); return; }
	const user = rows[0]?.user;

	const $selectDevices$1 = await selectDevices(undefined, {
		user: { id: user?.id },
		device: { id: socket?.handshake?.auth?.device?.id, deactivated: false }
	}, { getDB });
	if (
		(rows = $selectDevices$1?.data?.rows)?.length !== 1 ||
		(errors = $selectDevices$1?.errors)?.length
	) { socket.disconnect(errors); return; }
	if (rows?.filter((row) => (
		typeof user?.id != 'undefined' &&
		`${row?.user?.id}` === `${user?.id}`
	))?.length) { socket.join(`${rows[0]?.device?.id}`); } else {
		socket.disconnect();
	}
});

io.of(`${path.user.graphql}`).on('connection', async (socket) => {
	socket.on('query', async ({ query }) => {
		const res = await userApolloServer.executeOperation({ query }, { io, socket, path: path.user.graphql });
		socket.emit('response', res);
	});
});

io.of(`${path.device.graphql}`).on('connection', async (socket) => {
	await auth(deviceAuth, {
		device: {
			id: socket?.handshake?.auth?.device?.id,
			public: socket?.handshake?.auth?.device?.public
		}
	}, socket);
	socket.on('query', async ({ query }:{query:string}) => {
		await auth(deviceAuth, {
			device: {
				id: socket?.handshake?.auth?.device?.id,
				public: socket?.handshake?.auth?.device?.public
			}
		}, socket);
		const res = await deviceApolloServer.executeOperation({ query }, { io, socket, path: path.device.graphql });
		socket.emit('response', res);
	});
});

httpServer.listen(port, () => {
	paths.forEach((path) => {
		console.log('Listening', 'on', `ws://${hostname}:${port}${path}`);
	});
});
