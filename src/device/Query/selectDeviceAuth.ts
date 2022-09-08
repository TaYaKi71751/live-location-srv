import { Select, Where } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;

type DeviceAuth = {
	id?:ID;
	created_at?:ID;
	secret?:string;
	public?:string;
	deactivated?:boolean;
};

type Device = {
	id?:ID;
	auth?:DeviceAuth;
};

export async function selectDeviceAuth (
	_parent,
	input:{device?:Device},
	{ getDB }
):Promise<{
	data?:{rows:Array<{device:Device}>},
	errors?:Array<Error>
}> {
	const what = '*';
	const from = 'device_auth';
	const device = input?.device;
	const auth = device?.auth;
	const where = new Where({
		DEVICE_ID: device?.id,
		DEVICE_AUTH_ID: auth?.id,
		CREATED_AT: auth?.created_at ? js(auth?.created_at) : undefined,
		DEVICE_AUTH_SECRET: auth?.secret ? js(auth?.secret) : undefined,
		DEVICE_AUTH_PUBLIC: auth?.public ? js(auth?.public) : undefined,
		DEVICE_AUTH_DEACTIVATED: auth?.deactivated
	});

	const db = await getDB();
	const selectDeviceAuth = () => (`${new Select(what, { from, where })}`);

	try {
		let rows:any = await db.all(selectDeviceAuth());
		rows = rows.map((row) => {
			const r:any = {device:{}};
			r.device.id = row.DEVICE_ID;
			r.device.auth = {
				id: row.DEVICE_AUTH_ID,
				secret: row.DEVICE_AUTH_SECRET,
				public: row.DEVICE_AUTH_PUBLIC,
				deactivated: row.DEVICE_AUTH_DEACTIVATED,
				created_at: row.CREATED_AT
			};
			return r;
		});
		return { data: { rows } };
	} catch (e) { return { errors: [e] }; }
}
