import { faker } from '@faker-js/faker';
import { config } from '../../../Config';
import { gql } from 'apollo-server-micro';
import { io } from 'socket.io-client';
import fs from 'fs';

const util = require('util');

const outFile = './auths.json';

const path = config.io.path.device.graphql;
const { hostname, port } = config.io;

const randomLocation = () => ({
	longitude: Number(faker.address.longitude()),
	latitude: Number(faker.address.latitude()),
	accuracy: Number(faker.random.numeric())
});
const location = () => util.inspect(randomLocation(), false, null, false);
const reportLocationQuery = (location) => (gql`query {
	reportLocation(location:${location}) {
		latitude,
		longitude,
		accuracy
	}
}`).loc.source.body;

const auths = () => {
	let _:any = null;
	_ = fs.readFileSync(outFile).toString() || '[]';
	_ = JSON.parse(_);
	_ = _.filter((auth) => (
		auth?.devices?.length &&
		auth?.devices?.filter((device) => (
			typeof device?.id != 'undefined' &&
			typeof device?.public != 'undefined'
		))?.length
	));
	return _;
};
const reportLocation = (socket) => {
	const events = ['connect', 'disconnect', 'response'];
	events?.forEach((event) => (
		socket.on(event, (data) => (
			console.log(`[socket.io][${path}][${event}]`, data)
		))
	));
	const locationInterval = setInterval(
		() => (socket.emit('query', { query: reportLocationQuery(location()) })),
		1000
	);
};
auths().forEach((auth) => {
	auth?.devices?.forEach((device) => {
		const socket = io(`ws://${hostname}:${port}${path}`, { auth: { device } });
		reportLocation(socket);
	});
});
