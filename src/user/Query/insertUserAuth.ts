import { Select, Insert, Values } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;

type UserAuth = {
	id?:ID;
	password?:string;
	created_at?:ID;
	deactivated?:boolean;
};
type User = {
	id?:ID;
	auth?:UserAuth;
};
type UserAuthInput = Omit<Omit<UserAuth, 'id'>, 'created_at'>;
type UserInput = Omit<User, 'auth'> & {
	auth?:UserAuthInput;
};

export async function insertUserAuth (
	_parent,
	input:{user?:UserInput},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user:User}>},
	errors?:Array<Error>
}> {
	const user:User|UserAuthInput = input?.user;
	const auth = user?.auth;

	const into = 'user_auth';
	const values = () => (new Values({
		USER_ID: user?.id,
		USER_AUTH_ID: `(${new Select('IFNULL(MAX(USER_AUTH_ID),-1)', { from: into })}) + 1`,
		USER_AUTH_PASSWORD: auth?.password ? js(auth?.password) : undefined,
		CREATED_AT: js(auth.created_at = Date.now())
	}));
	const insertUserAuth = () => (`${new Insert(into, values())}`);

	const db = await getDB();

	try {
		await db.run(insertUserAuth());
		return { data: { rows: [{ user: { id: user?.id, auth } }] } };
	} catch (e) { return { errors: [e] }; }
}
