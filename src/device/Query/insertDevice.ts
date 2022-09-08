import { Select, Values, Insert } from '../../util/sqlite3';

const js = JSON.stringify;
type ID = `${number}`|number;

type User = {
	id:ID;
};

type Device = {
	created_at:string;
}

export async function insertDevice (
	_parent,
	input:{user:User},
	{ getDB }
):Promise<{
	data?:{rows?:Array<{user:User, device:Device}>}
	errors?:Array<Error>
}> {
	const user:any = input?.user;
	const device:any = {};
	const into = 'device';

	const db = await getDB();

	const values = () => new Values({
		USER_ID: user?.id,
		DEVICE_ID: `(${new Select('IFNULL(MAX(DEVICE_ID),-1)', { from: into })}) + 1`,
		CREATED_AT: js(device.created_at = Date.now())
	});
	const insertDevice = () => (`${new Insert(into, values())}`);
	try {
		await db.run(insertDevice());
		return { data: { rows: [{ user, device }] } };
	} catch (e) { return { errors: [e] }; }
}
