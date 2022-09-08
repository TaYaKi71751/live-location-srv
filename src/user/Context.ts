import SocketIO from 'socket.io';
import { auth as userAuth } from './Query/index';
import { config } from '../../Config';
import { getDB } from '../Data';

type ID = `${number}`|number;
type UserAuthInput = {
	email:string;
	password:string;
};
type DeviceAuthInput = {
	id?:ID;
};
type AuthInput = {
	user?:UserAuthInput;
	device?:DeviceAuthInput;
}

export async function context (incoming:{
	io:SocketIO.Server
	socket:any,
	path:string,
}) {
	const io = incoming?.io;
	const socket = incoming?.socket;
	const authInput:any = socket?.handshake?.auth;

	let rows:any = null;
	let errors:any = null;

	let user:any = null;
	let device:any = null;
	let $auth$1:any = null;
	if (authInput?.user) {
		$auth$1 = await userAuth(undefined, { user: authInput?.user }, { getDB });
		rows = $auth$1?.data?.rows;
		errors = $auth$1?.errors;
	}
	switch (incoming.path) {
	case `${config.io.path.user.subscriptions}`:
		if (
			!rows?.length ||
			errors?.length
		) { } else {
			socket.disconnect(true);
			return { getDB };
		} break;
	case `${config.io.path.user.graphql}`:break;
	default: break;
	}

	if (rows?.length) {
		user = rows[0]?.user;
		device = { id: authInput?.device?.id };
	}
	return {
		getDB,
		user,
		device,
		io,
		socket
	};
}
