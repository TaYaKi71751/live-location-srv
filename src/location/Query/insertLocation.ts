import { Insert, Values, Select } from '../../util/sqlite3';

const js = JSON.stringify;

type ID = `${number}`|number;
type Float = `${number}`|number;

type DeviceInput = {id:ID};
type Device = DeviceInput;
type Location = {
	id:ID;
	created_at:ID;
	latitude:Float;
	longitude:Float;
	accuracy:Float;
	altitude?:Float|null;
	altitudeAccuracy?:Float|null;
	heading?:Float|null;
	speed?:Float|null;
};
type LocationInput = Omit<Omit<Location, 'id'>, 'created_at'>;

export async function insertLocation (
	_parent,
	input:{device:DeviceInput, location:LocationInput},
	{ getDB }
):Promise<{
	data?:{rows:Array<{device:Device, location:Omit<Location, 'id'>}>},
	errors?:Array<Error>
}> {
	const device:any = input?.device;
	const location:any = input?.location;
	const into = 'location';
	const values = () => (new Values({
		DEVICE_ID: device?.id,
		LOCATION_ID: `(${new Select('IFNULL(MAX(LOCATION_ID),-1)', { from: into })}) + 1`,
		CREATED_AT: js(location.created_at = Date.now()),
		LOCATION_LATITUDE: location?.latitude,
		LOCATION_LONGITUDE: location?.longitude,
		LOCATION_ACCURACY: location?.accuracy,
		LOCATION_ALTITUDE: location?.altitude,
		LOCATION_ALTITUDE_ACCURACY: location?.altitudeAccuracy,
		LOCATION_HEADING: location?.heading,
		LOCATION_SPEED: location?.speed
	}));

	const insertLocation = () => (`${new Insert(into, values())}`);

	const db = await getDB();

	try {
		await db.run(insertLocation());
		return { data: { rows: [{ device, location }] } };
	} catch (e) { return { errors: [e] }; }
}
