import { Update, Set, Where } from '../../util/sqlite3';

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

export async function updateDeviceAuth (
	_parent,
	input:{
		set:{device?:Device},
		where:{device?:Device},
	},
	{ getDB }
):Promise<{
	data?:{rows:Array<{device?:Device}>},
	errors?:Array<Error>
}> {
	const to = 'device_auth';
	let set:any = input?.set;
	set = new Set({
		DEVICE_ID: set?.device?.id,
		DEVICE_AUTH_ID: set?.device?.auth?.id,
		DEVICE_AUTH_SECRET: set?.device?.auth?.secret ? js(set?.device?.auth?.secret) : undefined,
		DEVICE_AUTH_PUBLIC: set?.device?.auth?.public ? js(set?.device?.auth?.public) : undefined,
		DEVICE_CREATED_AT: typeof set?.device?.auth?.created_at != 'undefined' ? js(set?.device?.auth?.created_at) : undefined,
		DEVICE_DEACTIVATED: set?.device?.auth?.deactivated
	});
	let where:any = input?.where;
	where = new Where({
		DEVICE_ID: where?.device?.id,
		DEVICE_AUTH_ID: where?.device?.auth?.id,
		DEVICE_AUTH_SECRET: where?.device?.auth?.secret ? js(where?.device?.auth?.secret) : undefined,
		DEVICE_AUTH_PUBLIC: where?.device?.auth?.public ? js(where?.device?.auth?.public) : undefined,
		DEVICE_CREATED_AT: typeof where?.device?.auth?.created_at != 'undefined' ? js(where?.device?.auth?.created_at) : undefined,
		DEVICE_DEACTIVATED: where?.device?.auth?.deactivated
	});
	const updateDeviceAuth = () => (`${new Update(to, { set, where })}`);

	const db = await getDB();

	try {
		await db.run(updateDeviceAuth());
		return { data: { rows: [Object.assign({}, input?.where, input?.set)] } };
	} catch (e) { return { errors: [e] }; }
}
