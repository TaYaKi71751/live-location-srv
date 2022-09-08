import { Select, Insert, Values } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;

type User = {
	id?:ID;
	created_at?:ID;
	email?:string;
	deactivated?:boolean;
};
type UserInput = Omit<Omit<User, 'id'>, ' created_at'>;

export async function insertUser (
	_parent,
	input:{user:UserInput},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user:User}>},
	errors?:Array<Error>
}> {
	const db = await getDB();

	const user = input?.user;
	const into = 'user';

	const values = () => (new Values({
		USER_ID: `(${new Select('IFNULL(MAX(USER_ID),-1)', { from: into })}) + 1`,
		USER_EMAIL: user?.email ? js(user?.email) : undefined,
		CREATED_AT: js(user.created_at = Date.now()),
		USER_DEACTIVATED: user?.deactivated
	}));
	const insertUser = () => (`${new Insert(into, values())}`);
	try {
		await db.run(insertUser());
		return { data: { rows: [{ user }] } };
	} catch (e) { return { errors: [e] }; }
}
