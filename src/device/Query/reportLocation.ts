import { insertLocation, selectLocations } from '../../location/Query/index';
import { AuthorizationRequiredError, InvalidInputError } from '../../util/Error';
import { isNotValid as isNotValidNumber } from '../../util/Number';

import { publish } from '../../user/Subscriptions';
import { config } from '../../../Config';

type ID = `${number}`|number;
type Float = `${number}`|number;

type LocationInput = {
	latitude:Float;
	longitude:Float;
	accuracy:Float;
	altitude?:Float|null;
	altitudeAccuracy?:Float|null;
	heading?:Float|null;
	speed?:Float|null;
};
type Location = LocationInput & {id:ID, created_at:ID}

export async function reportLocation (
	_parent,
	input:{location:LocationInput},
	{ getDB, user, device, io }
):Promise<Location> {
	switch (true) {
	case isNotValidNumber(user?.id):
	case isNotValidNumber(device?.id):
		throw AuthorizationRequiredError();
	case isNotValidNumber(input?.location?.latitude):
	case isNotValidNumber(input?.location?.longitude):
	case isNotValidNumber(input?.location?.accuracy):
		throw InvalidInputError();
	default: break;
	}
	let location:any = input?.location;
	const checkOutput = (output?:{data, errors}) => {
		switch (true) {
		case output?.data?.rows?.length !== 1:
		case !output?.data?.rows?.length:
		case !!output?.errors?.length:
			throw output?.errors;
		default: break;
		}
		return output?.data?.rows;
	};
	const assignRows = (rows:Array<{location}>) => {
		location = Object.assign({}, location, rows[0]?.location);
	};

	await insertLocation(_parent, {
		device: { id: device?.id },
		location
	}, { getDB })
		.then(checkOutput)
		.then(assignRows);

	await selectLocations(_parent, { device: { id: device?.id }, location }, { getDB })
		.then(checkOutput)
		.then(assignRows);

	await publish(
		io,
		`${config?.io?.path?.user?.subscriptions}`,
		`${device?.id}`,
		'reportLocation', {
			user: { id: user?.id },
			device: { id: device?.id },
			location
		}
	);
	return location;
}
