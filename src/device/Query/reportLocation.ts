import { insertLocation, selectLocations } from '../../location/Query/index';
import { selectDevices } from '../../device/Query/index';
import { auth as userAuth } from '../../user/Query/index';
import { ValidationError } from 'apollo-server-micro';
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
):Promise<{
	device:{id:ID}, location:Location,
}> {
	let location:any = input?.location;
	let rows:any = null;
	let errors:any = null;

	const $insertLocation$1 = await insertLocation(_parent, {
		device: { id: device?.id },
		location
	}, { getDB });
	if (
		(rows = $insertLocation$1?.data?.rows)?.length != 1 ||
		(errors = $insertLocation$1?.errors)?.length
	) { return; }
	location = Object.assign(location, rows[0]?.location);

	const $selectLocations$1 = await selectLocations(_parent, { device: { id: device?.id }, location }, { getDB });
	if (
		(rows = $selectLocations$1?.data?.rows)?.length != 1 ||
		(errors = $selectLocations$1?.errors)?.length
	) { return; }
	location = Object.assign(location, rows[0]?.location);
	await publish(
		io,
		`${config?.io?.path?.user?.subscriptions}`,
		'reportLocation', {
			user: { id: user?.id },
			device: { id: device?.id },
			location: rows[0].location
		}, async (socket) => {
			let rows:any = null;
			let errors:any = null;
			const auth = socket?.handshake?.auth;
			const _:any = {};

			const $auth$1 = await userAuth(_parent, auth, { getDB });
			if (
				(rows = $auth$1?.data?.rows)?.length != 1 ||
				(errors = $auth$1?.errors)?.length
			) { return false; }
			_.user = rows[0]?.user;

			const $selectDevices$1 = await selectDevices(_parent, {
				user: { id: _?.user?.id },
				device: (typeof auth?.device?.id != 'undefined' ? { id: auth?.device?.id } : undefined)
			}, { getDB });
			if (
				!(rows = $selectDevices$1?.data?.rows)?.length ||
				(errors = $selectDevices$1?.errors)?.length
			) { return false; }
			if (rows?.filter((row) => (
				typeof row?.user?.id != 'undefined' &&
				typeof row?.device?.id != 'undefined' &&
				`${row?.user?.id}` === `${_?.user?.id}` &&
				(typeof auth?.device?.id == 'undefined' ||
				`${row?.device?.id}` === `${auth?.device?.id}`)
			))?.length) { return true; }
			return false;
		}
	);
	return location;
}
