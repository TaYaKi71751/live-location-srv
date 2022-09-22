import SocketIO from 'socket.io';
import { auth as userAuth } from './Query/index';
import { getDB } from '../Data';
import { AuthorizationRequiredError } from '../util/Error';
import { isNotValid as isNotValidNumber } from '../util/Number';

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
};
const oa = Object.assign;

export async function context (incoming:{
	io:SocketIO.Server
	socket:any,
	path:string,
}) {
	const io = incoming?.io;
	const socket = incoming?.socket;
	const authInput:undefined|null|AuthInput = socket?.handshake?.auth;

	let user:any = null;
	let device:any = null;
	const checkOutput = (output?:{data, errors}) => {
		switch (true) {
		case output?.data?.rows?.length != 1:
		case !output?.data?.rows?.length:
		case !!output?.errors?.length:
			throw output?.errors;
		default: break;
		}
		return output?.data?.rows;
	};
	const assignRows = (rows?:Array<{user}>) => {
		user = oa({}, user, rows[0]?.user);
		device = oa({}, authInput?.device, device);
	};
	if (authInput?.user) {
		try {
			await userAuth(undefined, { user: authInput?.user }, { getDB })
				.then(checkOutput)
				.then(assignRows)
				.then(() => {
					switch (true) {
					case isNotValidNumber(user?.id):
					case isNotValidNumber(device?.id):
						throw AuthorizationRequiredError();
					default: break;
					}
				});
		} catch (e) {
			return { getDB };
		}
	}

	return {
		getDB,
		user,
		device,
		io,
		socket
	};
}
