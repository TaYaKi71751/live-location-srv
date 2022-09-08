import { Update, Set, Where } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;

type User = {
	id?:ID;
	created_at?:ID;
	email?:string;
	deactivated?:boolean;
};

export async function updateUser (
	_parent,
	input:{
		set:{user?:User},
		where:{user?:User},
	},
	{ getDB }
):Promise<{
	errors?:Array<Error>
}> {
	const to = 'device';
	let set:any = input?.set;
	set = new Set({
		USER_ID: set?.user?.id,
		USER_EMAIL: set?.user?.email ? js(set?.user?.email) : undefined,
		USER_DEACTIVATED: set?.user?.deactivated,
		CREATED_AT: typeof set?.user?.created_at != 'undefined' ? js(set?.user?.created_at) : undefined
	});
	let where:any = input?.where;
	where = new Where({
		USER_ID: where?.user?.id,
		DEVICE_ID: where?.device?.id,
		DEVICE_DEACTIVATED: where?.device?.id,
		CREATED_AT: typeof where?.user?.created_at != 'undefined' ? js(where?.user?.created_at) : undefined
	});
	const updateDevices = () => (`${new Update(to, { set, where })}`);

	const db = await getDB();

	try {
		await db.run(updateDevices());
	} catch (e) { return { errors: [e] }; }
}
