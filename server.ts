import http from 'http';
import SocketIO from 'socket.io';
import { config } from './Config';
import { getDB } from './src/Data';
import { auth as userAuth } from './src/user/Query';
import { selectDevices } from './src/device/Query';
import { apolloServer as userApolloServer } from './src/user/ApolloServer';
import { apolloServer as deviceApolloServer } from './src/device/ApolloServer';
import { isNotValid as isNotValidNumber } from './src/util/Number';

const path = config.io.path;
const hostname = config.io.hostname;
const port = config.io.port;

const httpServer = http.createServer();
const io = new SocketIO.Server(httpServer, {
	cors: {
		origin: '*' // TODO EDIT THIS
	}
});

const oa = Object.assign;

const paths = [
	`${path.user.subscriptions}`,
	`${path.user.graphql}`,
	`${path.device.graphql}`
];

paths.forEach((path) => {
	const connectionEvents = ['connection', 'disconnection'];
	connectionEvents.forEach((connectionEvent) => {
		io.of(path).on(connectionEvent, (socket) => {
			const clientIP = () => (socket.handshake.address);
			console.info(`[${Date.now()}]`, `[${clientIP()}]`, `[${socket.nsp.name}]`, `[${connectionEvent}]`, socket.id, socket.handshake.auth);
			socket.onAny((eventName, ...args) => {
				console.info(`[${Date.now()}]`, `[${clientIP()}]`, `[${socket.nsp.name}]`, `[${connectionEvent}]`, `[${eventName}]`, socket.id, socket.handshake.auth, ...args);
			});
		});
	});
});

const log = {
	error: (socket:SocketIO.Socket, e:Error) => (console.error(
		`[${Date.now()}]`, '[error]', `[${socket.handshake.address}]`, `[${socket.nsp.name}]`, socket.id, socket.handshake.auth, e
	))
};

io.of(`${path.user.subscriptions}`).on('connection', async (socket) => {
	let user:any;
	let device:any;
	const checkOutput = (output?:{data, errors}) => {
		switch (true) {
		case output?.data?.rows?.length !== 1:
		case !output?.data?.rows?.length:
		case !!output?.errors?.length:
			throw output?.errors;
		default: break;
		}
		return output?.data?.rows;
	};
	const assignRows = (rows?:Array<{user, device}>) => {
		user = oa({}, user, rows[0]?.user);
		device = oa({}, device, rows[0]?.device);
	};
	try {
		await userAuth(undefined, {
			user: socket?.handshake?.auth?.user
		}, { getDB })
			.then(checkOutput)
			.then(assignRows);

		await selectDevices(undefined, {
			user: { id: user?.id },
			device: { id: `${socket?.handshake?.auth?.device?.id}`, deactivated: false }
		}, { getDB })
			.then(checkOutput)
			.then(assignRows);
	} catch (e) {
		log.error(socket, e);
		socket.disconnect(true);
	}
	switch (true) {
	case isNotValidNumber(user?.id):
	case isNotValidNumber(device?.id):
		socket.disconnect(true); return;
	default: socket.join(`${device?.id}`);
	}
});

io.of(`${path.user.graphql}`).on('connection', async (socket) => {
	socket.on('query', async ({ query }:{query:string}) => {
		try {
			const res = await userApolloServer.executeOperation({ query }, { io, socket, path: socket.nsp.name });
			socket.emit('response', res);
		} catch (e) {
			log.error(socket, e);
		}
	});
});

io.of(`${path.device.graphql}`).on('connection', async (socket) => {
	socket.on('query', async ({ query }:{query:string}) => {
		try {
			const res = await deviceApolloServer.executeOperation({ query }, { io, socket, path: socket.nsp.name });
			socket.emit('response', res);
		} catch (e) {
			log.error(socket, e);
		}
	});
});

httpServer.listen(port, () => {
	paths.forEach((path) => {
		console.log('Listening', 'on', `ws://${hostname}:${port}${path}`);
	});
});
