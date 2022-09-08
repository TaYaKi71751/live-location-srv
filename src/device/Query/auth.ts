import { selectDevices, selectDeviceAuth } from './index';
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

export async function auth (
	_parent,
	input:{device:DeviceAuthInput},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user?:User, device?:Device}>},
	errors?:Array<Error>
}> {
	let errors:any = {};
	let rows:any = {};
	let device:any = input?.device;
	let user:any = null;

	const $selectDeviceAuth$1 = await selectDeviceAuth(_parent, {
		device: {
			id: device?.id,
			auth: { public: device?.public, deactivated: false }
		}
	}, { getDB });
	if (
		(rows = $selectDeviceAuth$1?.data?.rows)?.length != 1 ||
		(errors = $selectDeviceAuth$1?.errors)?.length
	) { return { errors }; }
	device = Object.assign({}, rows[0]?.device);
	user = Object.assign({}, rows[0]?.user);

	const $selectDevices$1 = await selectDevices(_parent, {
		device: {
			id: rows[0]?.device?.id,
			deactivated: false
		}
	}, { getDB });
	if (
		(rows = $selectDevices$1?.data?.rows)?.length != 1 ||
			(errors = $selectDevices$1?.errors)?.length
	) { return { errors }; }
	device = Object.assign({}, device, rows?.[0]?.device);
	user = Object.assign({}, user, rows[0]?.user);
	return { data: { rows: [{ user, device }] } };
}
