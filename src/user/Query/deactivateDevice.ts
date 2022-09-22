import { updateDevice } from '../../device/Query/index';
import { AuthorizationRequiredError, InvalidInputError } from '../../util/Error';
import { isNotValid as isNotValidNumber } from '../../util/Number';

type ID = `${number}`|number;
type DeviceAuth = {
	id?:ID;
	created_at?:ID;
	secret?:string;
	public?:string;
	deactivated?:boolean;
};
type Device = Omit<Omit<DeviceAuth, 'secret'>, 'public'>&{auth?:Omit<DeviceAuth, 'secret'>};
type User = Device&{email?:string}

const oa = Object.assign;

export async function deactivateDevice (
	_parent,
	input:{device:{id:ID}},
	{ getDB, user }
):Promise<{
	user?:User,
	device?:Device
}> {
	switch (true) {
	case isNotValidNumber(input?.device?.id):
		throw InvalidInputError();
	case isNotValidNumber(user?.id):
		throw AuthorizationRequiredError();
	}

	const checkOutput = (output) => {
		switch (true) {
		case !output?.data?.rows?.length:
		case output?.data?.rows?.length !== 1:
		case !!output?.errors?.length:
			throw output?.errors;
		default: break;
		}
		return output?.data?.rows;
	};

	const assignRows = (rows?:Array<{device}>) => {
		device = oa({}, device, rows[0]?.device);
	};

	let device:any = null;

	await updateDevice(_parent, {
		set: { device: { deactivated: true } },
		where: { device: { id: input?.device?.id, deactivated: false } }
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	return { user: { id: user?.id }, device };
}
