import SocketIO from 'socket.io';
import { auth } from './Query/index';
import { resolvers } from './Resolver';
import { config } from '../../Config';
import { getDB } from '../Data';

type ID = `${number}`|number;

type DeviceAuthInput = {
	id:ID;
	public:string;
};

export async function context (incoming:{
	io:SocketIO.Server
	socket:any,
	path:string,
}) {
		const io = incoming.io;
		const socket = incoming.socket;
		let authInput:any = socket.handshake.auth;
		authInput = {
			device:{
				id:authInput?.device?.id,
				public:authInput?.device?.public
			}
		}

		let $auth$1:any = undefined;
		let rows:any = undefined;
		let errors:any = undefined;
		let user:any = undefined;
		let device:any = undefined;
		if (authInput) {
			$auth$1 = await auth(undefined, authInput, { getDB });
			if(
				(rows = $auth$1?.data?.rows)?.length != 1 ||
				(errors=$auth$1?.errors)?.length
			){ return {errors}; }
			device = rows[0]?.device;
			user = rows[0]?.user;
			rows = $auth$1?.data?.rows;
			errors = $auth$1?.errors;
		}
		switch (incoming.path) {
		case `${config.io.path.device.graphql}`:
			if (
				rows?.length &&
				typeof (user = rows[0]?.user)?.id == 'undefined' &&
				typeof (device = rows[0]?.device)?.id == 'undefined'
			) { socket.disconnect(true); break; }
			if(rows?.length){
			user = rows[0]?.user;
			device = rows[0]?.device;
			}

			break;
		default: break;
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
