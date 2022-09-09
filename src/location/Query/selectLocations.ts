import { Select, Where } from '../../util/sqlite3';
type ID = `${number}`|number;
type Float = `${number}`|number;

type DeviceInput = {id:ID};
type Device = DeviceInput;
type Location = {
	id?:ID;
	created_at?:ID;
	latitude?:Float;
	longitude?:Float;
	accuracy?:Float;
	altitude?:Float|null;
	altitudeAccuracy?:Float|null;
	heading?:Float|null;
	speed?:Float|null;
};
export async function selectLocations (
	_parent,
	input:{device:Device, location:Location},
	{ getDB }
):Promise<{
	data?:{rows:Array<{device?:Device, location?:Location}>},
	errors?:Array<Error>
}> {
	const what = '*';
	const from = 'location';
	const location = input?.location;
	const device = input?.device;
	const where = new Where({
		DEVICE_ID: device?.id,
		LOCATION_ID: location?.id,
		CREATED_AT: location?.created_at,
		LOCATION_LATITUDE: location?.latitude,
		LOCATION_LONGITUDE: location?.longitude,
		LOCATION_ACCURACY: location?.accuracy,
		LOCATION_ALTITUDE: location?.altitude,
		LOCATION_ALTITUDE_ACCURACY: location?.altitudeAccuracy,
		LOCATION_HEADING: location?.heading,
		LOCATION_SPEED: location?.speed
	});
	const selectLocations = () => (`${new Select(what, { from, where })}`);

	const db = await getDB();

	try {
		let rows = await db.all(selectLocations());
		rows = rows.map((row) => {
			const r:any = {};
			r.device = { id: row?.DEVICE_ID };
			r.location = {
				id: row?.LOCATION_ID,
				created_at: row?.CREATED_AT,
				latitude: row?.LOCATION_LATITUDE,
				longitude: row?.LOCATION_LONGITUDE,
				accuracy: row?.LOCATION_ACCURACY,
				altitude: row?.LOCATION_ALTITUDE,
				altitudeAccuracy: row?.LOCATION_ALTITUDE_ACCURACY,
				heading: row?.LOCATION_HEADING,
				speed: row?.LOCATION_SPEED
			};
			return r;
		});
		return { data: { rows } };
	} catch (e) { return { errors: [e] }; }
}
