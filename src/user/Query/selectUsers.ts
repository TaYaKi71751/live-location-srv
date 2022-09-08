import { Select, Where } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;

type User = {
	id?:ID;
	created_at?:ID;
	email?:string;
	deactivated?:boolean;
}

export async function selectUsers (
	_parent,
	input:{user?:User},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user?:User}>},
	errors?:Array<Error>
}> {
	const id = input?.user?.id;
	const email = input?.user?.email;
	const deactivated = input?.user?.deactivated;
	const created_at = input?.user?.created_at;

	const what = '*';
	const from = 'user';
	const where = new Where({
		USER_EMAIL: email ? js(email) : undefined,
		USER_ID: typeof id != 'undefined' ? id : undefined,
		CREATED_AT: typeof created_at != 'undefined' ? js(created_at) : undefined,
		USER_DEACTIVATED: typeof deactivated != 'undefined' ? deactivated : undefined
	});

	const db = await getDB();
	const selectUsers = () => `${new Select(what, { from, where })}`;

	try {
		let rows = await db.all(selectUsers());
		rows = rows.map((row) => {
			const r:any = {};
			r.user = {
				id: row.USER_ID,
				email: row.USER_EMAIL,
				created_at: row.CREATED_AT,
				deactivated: row.DEVICE_DEACTIVATED
			};
			return r;
		});
		return { data: { rows } };
	} catch (e) { return { errors: [e] }; }
}
