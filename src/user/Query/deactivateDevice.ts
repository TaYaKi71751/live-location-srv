import { updateDevice } from '../../device/Query/index';

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

export async function deactivateDevice (
	_parent,
	input:{device:{id:ID}},
	{ getDB, user }
):Promise<{
	errors?:Array<Error>,
	user?:User,
	device?:Device
}> {
	if (typeof user?.id == 'undefined') { return; }
	let rows:any = null;
	let errors:any = null;
	let device:any = null;

	const $updateDevice$1 = await updateDevice(_parent, {
		set: { device: { deactivated: true } },
		where: { device: { id: input?.device?.id, deactivated: false } }
	}, { getDB });
	if (
		(rows = $updateDevice$1?.data?.rows)?.length != 1 ||
		(errors = $updateDevice$1?.errors)?.length
	) { return { errors }; }
	device = rows[0]?.device;

	return { user: { id: user?.id }, device };
}
