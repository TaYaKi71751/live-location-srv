import { selectDevices } from '../../device/Query/selectDevices';
import { AuthorizationRequiredError } from '../../util/Error';
import { isNotValid as isNotValidNumber } from '../../util/Number';

type ID = `${number}`|number;

type Device = {
	id: ID;
	created_at: ID;
	deactivated: boolean;
};

export async function listDevice (
	_parent,
	input:undefined|null|{device?:{deactivated?:boolean}},
	{ getDB, user }
):Promise<Array<Device>> {
	switch (true) {
	case isNotValidNumber(user?.id):
		throw AuthorizationRequiredError();
	}
	const devices = [];

	const checkOutput = (output) => {
		switch (true) {
		case !output?.data?.rows?.length:
		case !!output?.errors?.length:
			throw output?.errors;
		default: break;
		}
		return output?.data?.rows;
	};
	const collectRows = (rows?:Array<{device}>) => {
		devices.push(...(
			rows?.length
				? rows?.map((row) => (row?.device))
				: []
		));
	};

	await selectDevices(_parent, { user, device: { deactivated: input?.device?.deactivated } }, { getDB })
		.then(checkOutput)
		.then(collectRows);

	return devices;
}
