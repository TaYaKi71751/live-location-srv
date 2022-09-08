import { selectDevices, selectDeviceAuth, insertDevice, insertDeviceAuth } from '../../device/Query/index';

type ID = `${number}`|number;
type DeviceAuth = {
	id?:ID;
	created_at?:ID;
	secret?:string;
	public?:string;
	deactivated?:boolean;
};
type Device = Omit<Omit<DeviceAuth, 'secret'>, 'public'>&{auth?:Omit<DeviceAuth, 'secret'>};

type User = Device&{email?:string}

export async function addDevice (
	_parent,
	input,
	{ getDB, user }
):Promise<any & {
	errors?:Array<Error>,
	user?:User,
	device?:Device
}> {
	if (!user?.id) { return; }
	let rows:any = null;
	let errors:any = null;
	let device:any = {};

	const $insertDevice$1 = await insertDevice(_parent, {
		user: {
			id: user?.id
		}
	}, { getDB });
	if (
		(rows = $insertDevice$1?.data?.rows)?.length != 1 ||
		(errors = $insertDevice$1?.errors)?.length
	) { return { errors }; }
	device = Object.assign(device, rows[0]?.device);

	const $selectDevice$1 = await selectDevices(_parent, {
		user: { id: user?.id },
		device
	}, { getDB });
	if (
		(rows = $selectDevice$1?.data?.rows)?.length != 1 ||
		(errors = $selectDevice$1?.errors)?.length
	) { return { errors }; }
	device = Object.assign(device, rows[0]?.device);

	const $insertDeviceAuth$1 = await insertDeviceAuth(_parent, {
		device: { id: device?.id }
	}, { getDB });
	if (
		(rows = $insertDeviceAuth$1?.data?.rows)?.length != 1 ||
		(errors = $insertDeviceAuth$1?.errors)?.length
	) { return { errors }; }
	device.auth = Object.assign({},device.auth, rows[0]?.device?.auth);

	const $selectDeviceAuth$1 = await selectDeviceAuth(_parent, {
		device
	}, { getDB });
	if (
		(rows = $selectDeviceAuth$1?.data?.rows)?.length != 1 ||
		(errors = $selectDeviceAuth$1?.errors)?.length
	) { return { errors }; }
	device.auth = Object.assign({},device.auth,rows[0]?.device?.auth);

	delete device?.auth?.secret;

	return { user: { id: user?.id }, device };
}
