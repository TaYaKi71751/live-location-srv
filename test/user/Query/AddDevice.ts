import { config } from '../../../Config';
import { gql } from 'apollo-server-micro';
import { io } from 'socket.io-client';
import fs from 'fs';

const outFile = './auths.json';

const path = config.io.path.user.graphql;
const { hostname, port } = config.io;
const js = JSON.stringify;

const auths = () => {
	let _:any = null;
	try { _ = fs.readFileSync(outFile).toString() || '[]'; } catch (e) { _ = '[]'; };
	_ = JSON.parse(_);
	_ = _.filter((auth) => (
		typeof auth?.user?.email != 'undefined' &&
		typeof auth?.user?.password != 'undefined'
	));
	return _;
};

const addDeviceQuery = () => `${(gql`query {
	addDevice {
		device {
			id,
			auth {
				id,
				public
			}
		}
	}
}`).loc.source.body}`;
const addDevice = (socket) => {
	const events = ['connect', 'disconnect', 'response'];
	events?.forEach((event) => (
		socket.on(event, (data) => (
			console.log(`[socket.io][${path}][${event}]`, data)
		))
	));
	socket.on('response', ({ data }) => {
		const { addDevice } = data;
		console.log(addDevice);
		const deviceAuth:any = {};
		deviceAuth.id = addDevice?.device?.id;
		deviceAuth.public = addDevice?.device?.auth?.public;
		if (!deviceAuth) { return; }
		const _ = auths()?.map((auth) => {
			if (
				auth?.user?.email != socket?.io?.opts?.auth?.user?.email ||
				auth?.user?.password != socket?.io?.opts?.auth?.user?.password
			) { return auth; }
			auth.devices = auth?.devices || [];
			auth.devices.push(deviceAuth);
			return auth;
		});
		console.log(deviceAuth);
		fs.writeFileSync(outFile, js(_));
	});
	const addDeviceInterval = setInterval(
		() => socket.emit('query', { query: `${addDeviceQuery()}` }),
		1000 + (Math.random() * 1000 % 777)
	);
};
auths()?.forEach((auth) => {
	const socket = io(`ws://${hostname}:${port}${path}`, { auth });
	addDevice(socket);
});
