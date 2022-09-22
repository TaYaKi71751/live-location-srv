import SocketIO from 'socket.io';
import { auth } from './Query/index';
import { resolvers } from './Resolver';
import { getDB } from '../Data';

type ID = `${number}`|number;

type DeviceAuthInput = {
	id:ID;
	public:string;
};
const oa = Object.assign;

export async function context (incoming:{
	io:SocketIO.Server
	socket:any,
	path:string,
}) {
	const io = incoming.io;
	const socket = incoming.socket;
	const authInput:{device:DeviceAuthInput} = socket.handshake.auth;

	let user:any;
	let device:any;
	const checkOutput = (output?:{data, errors}) => {
		switch (true) {
		case output?.data?.rows?.length != 1:
		case !output?.data?.rows?.length:
		case !!output?.errors?.length:
			socket.disconnect(true);
			throw output?.errors;
		default: break;
		}
		return output?.data?.rows;
	};
	const assignRows = (rows?:Array<{user, device}>) => {
		user = oa({}, user, rows[0]?.user);
		device = oa({}, device, rows[0]?.device);
	};
	if (authInput?.device) {
		try {
			await auth(undefined, authInput, { getDB })
				.then(checkOutput)
				.then(assignRows);
		} catch (e) {
			return { getDB };
		}
	}
	return {
		getDB,
		resolvers,
		user,
		device,
		io,
		socket
	};
}
