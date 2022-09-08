import { Update, Set, Where } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;

type UserAuth = {
	id?:ID;
	created_at?:ID;
	password?:string;
	deactivated?:boolean;
};
type User = {
	id?:ID;
	auth?:UserAuth;
};

export async function updateUserAuth (
	_parent,
	input:{
		set:{user?:User},
		where:{user?:User},
	},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user?:User}>}
	errors?:Array<Error>
}> {
	const to = 'device';
	let set:any = input?.set;
	set = new Set({
		USER_ID: set?.user?.id,
		USER_AUTH_ID: set?.user?.auth?.id,
		USER_AUTH_PASSWORD: set?.user?.auth?.password ? js(set?.user?.auth?.password) : undefined,
		USER_AUTH_DEACTIVATED: set?.user?.auth?.deactivated,
		CREATED_AT: typeof set?.user?.auth?.created_at != 'undefined' ? js(set?.user?.auth?.created_at) : undefined
	});
	let where:any = input?.where;
	where = new Where({
		USER_ID: where?.user?.id,
		USER_AUTH_ID: where?.user?.auth?.id,
		USER_AUTH_PASSWORD: where?.user?.auth?.password ? js(where?.user?.auth?.password) : undefined,
		USER_AUTH_DEACTIVATED: where?.user?.auth?.deactivated,
		CREATED_AT: typeof where?.user?.auth?.created_at != 'undefined' ? js(where?.user?.auth?.created_at) : undefined
	});
	const updateDevices = () => (`${new Update(to, { set, where })}`);

	const db = await getDB();

	try {
		await db.run(updateDevices());
		return { data: { rows: [Object.assign({}, input?.where, input?.set)] } };
	} catch (e) { return { errors: [e] }; }
}
