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
		},async (socket,data)=>(
			typeof socket?.handshake?.auth?.device?.id != 'undefined' && 
			typeof device?.id != 'undefined' &&
			`${socket?.handshake?.auth?.device?.id}` === `${device?.id}`
		)
	);
	return location;
}
