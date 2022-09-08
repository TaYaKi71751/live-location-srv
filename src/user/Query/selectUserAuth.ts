import { Select, Where } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;

type UserAuth = {
	id?:ID;
	created_at?:ID;
	password?:string;
	deactivated?:boolean;
}

type User = {
	id?:ID;
	auth?:UserAuth;
}

export async function selectUserAuth (
	_parent,
	input:{user?:User},
	{ getDB }
):Promise<{
	data?:{rows?:Array<{user?:User}>},
	errors?:Array<Error>
}> {
	const db = await getDB();

	const user = input?.user;
	const auth = user?.auth;

	const what = '*';
	const from = 'user_auth';
	const where = () => (new Where({
		USER_ID: typeof user?.id != 'undefined' ? user?.id : undefined,
		USER_AUTH_ID: typeof auth?.id != 'undefined' ? auth?.id : undefined,
		USER_AUTH_PASSWORD: auth?.password ? js(auth?.password) : undefined,
		USER_AUTH_DEACTIVATED: typeof auth?.deactivated != 'undefined' ? auth?.deactivated : undefined,
		CREATED_AT: typeof auth?.created_at != 'undefined' ? js(auth?.created_at) : undefined
	}));
	const selectUserAuth = () => (`${new Select(what, { from, where: where() })}`);

	try {
		let rows = await db.all(selectUserAuth());
		rows = rows.map((row) => {
			const r:any = {};
			r.user = { id: row.USER_ID };
			r.user.auth = {
				id: row.USER_AUTH_ID,
				created_at: row.CREATED_AT,
				password: row.USER_AUTH_PASSWORD,
				deactivated: row.USER_AUTH_DEACTIVATED
			};
			return r;
		});
		return { data: { rows } };
	} catch (e) { console.error(e); return { errors: [e] }; }
}
