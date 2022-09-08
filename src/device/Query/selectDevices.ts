import { Select, Where } from '../../util/sqlite3';

type ID = `${number}`|number;

type User = {
	id?:ID;
};
type Device = {
	id?:ID;
	deactivated?:boolean;
	created_at?:ID;
}

export async function selectDevices (
	_parent,
	input:{user?:User, device?:Device},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user:User, device:Device}>},
	errors?:Array<Error>
}> {
	const what = '*';
	const from = 'device';
	const user = input?.user;
	const device = input?.device;
	const where:any = new Where({
		USER_ID: user?.id,
		DEVICE_ID: device?.id,
		DEVICE_DEACTIVATED: device?.deactivated,
		CREATED_AT: device?.created_at
	});

	const db = await getDB();
	const selectDevices = () => (`${new Select(what, { from, where })}`);

	try {
		let rows:any = await db.all(selectDevices());
		rows = rows.map((row) => {
			const r:any = {};
			r.user = { id: row.USER_ID };
			r.device = {
				id: row.DEVICE_ID,
				deactivated: row.DEVICE_DEACTIVATED,
				created_at: row.CREATED_AT
			};
			return r;
		});
		return { data: { rows } };
	} catch (e) { return { errors: [e] }; }
}
