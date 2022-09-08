import { config } from '../../../Config';
import { io } from 'socket.io-client';
import fs from 'fs';

const outFile = './auths.json';
const path = config.io.path.user.subscriptions;
const { hostname, port } = config.io;

const auths = () => {
	let _:any = null;
	try { _ = fs.readFileSync(outFile).toString() || '[]'; } catch (e) { _ = '[]'; };
	_ = JSON.parse(_);
	_ = _?.filter((auth) => (
		typeof auth?.user?.email != 'undefined' &&
		typeof auth?.user?.password != 'undefined' &&
		auth?.devices?.length &&
		auth?.devices?.filter((device) => (
			typeof device?.id != 'undefined' &&
			typeof device?.public != 'undefined'
		))
	));
	return _;
};

const watchLocationUpdate = (socket) => {
	const events = ['connect', 'disconnect', 'reportLocation'];
	events?.forEach((event) => (
		socket.on(event, (data) => (
			console.log(`[socket.io][${path}][${event}]`, data)
		))
	));
};

auths()?.forEach((auth) => {
	auth?.devices?.forEach((device) => {
		const socket = io(`ws://${hostname}:${port}${path}`, { auth: { user: auth?.user, device: { id: device?.id } } });
		watchLocationUpdate(socket);
	});
});
