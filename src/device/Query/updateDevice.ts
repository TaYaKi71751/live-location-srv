import { Update, Set, Where } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;

type User = {
	id?:ID;
};

type Device = {
	id?:ID;
	created_at?:ID;
	deactivated?:boolean;
};

export async function updateDevice (
	_parent,
	input:{
		set:{user?:User, device?:Device},
		where:{user?:User, device?:Device},
	},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user?:User, device?:Device}>},
	errors?:Array<Error>
}> {
	const to = 'device';
	let set:any = input?.set;
	set = new Set({
		USER_ID: set?.user?.id,
		DEVICE_ID: set?.device?.id,
		DEVICE_DEACTIVATED: set?.device?.deactivated,
		CREATED_AT: typeof set?.device?.created_at != 'undefined' ? js(set?.device?.created_at) : undefined
	});
	let where:any = input?.where;
	where = new Where({
		USER_ID: where?.user?.id,
		DEVICE_ID: where?.device?.id,
		DEVICE_DEACTIVATED: where?.device?.deactivated,
		CREATED_AT: typeof where?.device?.created_at != 'undefined' ? js(where?.device?.created_at) : undefined
	});
	const updateDevice = () => (`${new Update(to, { set, where })}`);

	const db = await getDB();

	try {
		await db.run(updateDevice());
		return { data: { rows: [Object.assign({}, input?.where, input?.set)] } };
	} catch (e) { return { errors: [e] }; }
}
