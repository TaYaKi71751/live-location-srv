import { selectUsers, selectUserAuth } from './index';
import { InvalidInputError } from '../../util/Error';

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

const oa = Object.assign;

export async function auth (
	_parent,
	input:{user:UserAuthInput},
	{ getDB }
):Promise<{
	data?:{rows:Array<{user?:User}>}
}> {
	switch (true) {
	case !input?.user?.email?.length:
	case !input?.user?.password?.length:
		throw InvalidInputError();
	default: break;
	}

	let user:any = null;

	const checkOutput = (output) => {
		switch (true) {
		case output?.data?.rows?.length !== 1:
		case !output?.data?.rows?.length:
		case !!output?.errors?.length:
			throw output?.errors;
		default: break;
		}
		return output?.data?.rows;
	};

	const assignRows = (rows?:Array<{user}>) => {
		const _ = oa({}, user?.auth, rows[0]?.user?.auth);
		user = oa({}, user, rows[0]?.user);
		user.auth = oa({}, _);
	};

	await selectUsers(_parent, {
		user: {
			email: input?.user?.email,
			deactivated: false
		}
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	await selectUserAuth(_parent, {
		user: {
			id: user?.id,
			auth: {
				password: input?.user?.password,
				deactivated: false
			}
		}
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	return { data: { rows: [{ user }] } };
}
