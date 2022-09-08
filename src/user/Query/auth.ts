import { selectUsers, selectUserAuth } from './index';

type ID = `${number}`|number;

type UserAuthInput = {
	email:string;
	password:string;
};
type UserAuth = {
	id?:ID;
	created_at?:ID;
	password?:string;
	deactivated?:boolean;
};
type User = Omit<UserAuth, 'password'> & {
	email?:string;
	auth?:UserAuth;
};

export async function auth (
	_parent,
	input:{user:UserAuthInput},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user?:User}>},
	errors?:Array<Error>
}> {
	let rows:any = null;
	let errors:any = null;
	let user:any = input?.user;

	const $selectUsers$1 = await selectUsers(_parent, {
		user: {
			email: input?.user?.email,
			deactivated: false
		}
	}, { getDB });
	if (
		(rows = $selectUsers$1?.data?.rows)?.length != 1 ||
		(errors = $selectUsers$1?.errors)?.length
	) { return { errors }; }
	user = rows[0]?.user;

	const $selectUserAuth$1 = await selectUserAuth(_parent, {
		user: {
			id: rows[0]?.user?.id,
			auth: {
				password: input?.user?.password,
				deactivated: false
			}
		}
	}, { getDB });
	if (
		(rows = $selectUserAuth$1?.data?.rows)?.length != 1 ||
		typeof (rows?.length) == 'undefined'
	) { return { errors }; }
	user.auth = rows[0]?.user?.auth;

	delete user.password;
	console.log({ user });
	return { data: { rows: [{ user }] } };
}
