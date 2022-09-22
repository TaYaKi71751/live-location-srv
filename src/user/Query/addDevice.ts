import { selectDevices, selectDeviceAuth, insertDevice, insertDeviceAuth } from '../../device/Query/index';
import { AuthorizationRequiredError } from '../../util/Error';
import { isNotValid as isNotValidNumber } from '../../util/Number';

type ID = `${number}`|number;
type DeviceAuth = {
	id?:ID;
	created_at?:ID;
	secret?:string;
	public?:string;
	deactivated?:boolean;
};
type Device = Omit<Omit<DeviceAuth, 'secret'>, 'public'>&{auth?:Omit<DeviceAuth, 'secret'>};

type User = Device&{email?:string};

const oa = Object.assign;

export async function addDevice (
	_parent,
	input,
	{ getDB, user }
):Promise<{
	user?:User,
	device?:Device
}> {
	switch (true) {
	case isNotValidNumber(user?.id):
		throw AuthorizationRequiredError();
	}
	let device:any = {};

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

	const assignRows = (rows?:Array<{device}>) => {
		const _ = Object.assign({}, device?.auth, rows[0]?.device?.auth);
		device = oa({}, device, rows[0]?.device);
		if (rows[0]?.device?.auth) {
			device.auth = _;
		}
	};

	await insertDevice(_parent, {
		user: {
			id: user?.id
		}
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	await selectDevices(_parent, {
		user: { id: user?.id },
		device
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	await insertDeviceAuth(_parent, {
		device: { id: device?.id }
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	await selectDeviceAuth(_parent, {
		device
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	return { user: { id: user?.id }, device };
}
