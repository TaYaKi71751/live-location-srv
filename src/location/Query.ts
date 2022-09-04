import { Select, Where, Values, Insert } from '../util/sqlite3';
const js = JSON.stringify;
type ID = `${number}`|number;
type Float = `${number}`|number;
export type LocationUpdateInput = {
	latitude: Float;
	longitude: Float;
	accuracy: Float;
	altitude?: Float|null;
	altitude_accuracy?: Float|null;
	speed?:Float|null;
	heading?:Float|null;
};
export type Location = {
	id: ID;
	created_at: ID;
}&LocationUpdateInput;

export const Query = {
	async getLocations (_parent, input:{device:{id:ID}, location?:{id?:ID, created_at:ID}}, { getDB }):Promise<{data?:{locations:Array<Location>}, errors?:Array<Error>}> {
		const { device, location } = input;
		const db = await getDB();
		const what = '*';
		const from = 'location';
		const where = new Where({ DEVICE_ID: device?.id, LOCATION_ID: location?.id, CREATED_AT: location?.created_at });
		const getLocations = `${new Select(what, { from })} ${where}`;
		try {
			let locations = await db.all(getLocations);
			locations = locations.map(
				(location) => (
					Object.fromEntries(
						Object.entries(location)
							.filter(
								([k, v]) => (k.startsWith('LOCATION_') || k.startsWith('CREATED_AT'))
							)
							.map(
								([k, v]) => ([k.replace('LOCATION_', '').toLowerCase(), v])
							)
					)
				)
			);
			return { data: { locations } };
		} catch (e) { return { errors: [e] }; }
	},
	async addLocation (_parent, input:{device:{id:ID}, location:LocationUpdateInput}, { getDB }):Promise<{data?:{location:Omit<Location, 'id'>}, errors?:Array<Error>}> {
		const db = await getDB();
		let created_at:any = null;
		const { device, location } = input;
		const into = 'location';
		const values = () => {
			const _ = new Values(location);
			_.keyPrefix = 'LOCATION_';
			_.keyToUpperCase = true;
			_.apply();
			_.keyPrefix = '';
			Object.assign(_, {
				DEVICE_ID: device?.id,
				CREATED_AT: js(created_at = Date.now()),
				LOCATION_ID: `(${new Select('IFNULL(MAX(LOCATION_ID),-1)', { from: 'location' })}) + 1`
			});
			return _;
		};
		try {
			const addLocation = () => `${new Insert(into, values())}`;
			await db.run(addLocation());
			return { data: { location: Object.assign({ created_at }, location) } };
		} catch (e) { return { errors: [e] }; }
	}
};
