import { selectUsers, insertUser, insertUserAuth } from './index';
import { ForbiddenError } from 'apollo-server-micro';

type ID = `${number}`|number;
type UserRegisterInput = {
	email:string;
	password:string;
};
type UserAuth = {
	id?:ID;
	created_at?:ID;
	password?:string;
	deactivated?:boolean;
}
type User = Omit<UserAuth, 'password'> & {
	email?:string;
	auth?:UserAuth;
};

export async function register (
	_parent,
	input:{user:UserRegisterInput},
	{ getDB }
):Promise<{
	user?:User,
	errors?:Array<Error>
}> {
	let rows:any = null;
	let errors:any = null;
	let user:any = input?.user;
	const email = user?.email;
	const password = user?.password;
	if (!email || !password) { return { errors: [new ForbiddenError('Request Forbidden')] }; }

	const $selectUsers$1 = await selectUsers(_parent, {
		user: { email, deactivated: false }
	}, { getDB });
	if (
		(typeof (rows = $selectUsers$1?.data?.rows)?.length != 'undefined' &&
		rows?.length != 0) ||
		(errors = $selectUsers$1?.errors)?.length
	) { return { errors }; }

	const $insertUser$1 = await insertUser(_parent, { user: { email } }, { getDB });
	if (
		(rows = $insertUser$1?.data?.rows)?.length != 1 ||
		(errors = $insertUser$1?.errors)?.length
	) { return { errors }; }
	user = rows[0]?.user;

	const $selectUsers$2 = await selectUsers(_parent, {
		user: {
			deactivated: false,
			created_at: rows[0]?.user?.created_at,
			email
		}
	}, { getDB });
	if (
		(rows = $selectUsers$2?.data?.rows)?.length != 1 ||
		(errors = $selectUsers$2?.errors)?.length
	) { return { errors }; }
	user = rows[0]?.user;

	const $insertUserAuth$1 = await insertUserAuth(_parent, {
		user: {
			id: rows[0]?.user?.id,
			auth: { password: input?.user?.password }
		}
	}, { getDB });
	if (
		(rows = $insertUserAuth$1?.data?.rows)?.length != 1 ||
		(errors = $insertUserAuth$1?.errors)?.length
	) { return { errors }; }
	user.auth = rows[0]?.user?.auth;

	// delete user.auth.password;
	return { user };
}
