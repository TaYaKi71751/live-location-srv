import { selectDevices, selectDeviceAuth } from './index';
import { InvalidInputError } from '../../util/Error';
export type ID = `${number}`|number;
type DeviceAuthInput = {
	id:ID;
	public:string;
};
type User = {
	id?:ID;
}
type DeviceAuth = {
	id?:ID;
	created_at?:ID;
	secret?:string;
	public?:string;
};
type Device = Omit<Omit<DeviceAuth, 'secret'>, 'public'>;

const oa = Object.assign;

export async function auth (
	_parent,
	input:{device:DeviceAuthInput},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user?:User, device?:Device}>}
}> {
	let device:any = null;
	let user:any = null;

	switch (true) {
	case typeof input?.device?.id == 'undefined':
	case !input?.device?.public?.length:
		throw InvalidInputError();
	default: break;
	}

	const checkOutput = (output) => {
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
		device = oa({}, device, rows[0]?.device);
		user = oa({}, user, rows[0]?.user);
	};

	await selectDeviceAuth(_parent, {
		device: {
			id: input?.device?.id,
			auth: { public: input?.device?.public, deactivated: false }
		}
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	await selectDevices(_parent, {
		device: {
			id: device?.id,
			deactivated: false
		}
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	return { data: { rows: [{ user, device }] } };
}
