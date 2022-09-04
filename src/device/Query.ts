import NodeRSA from 'node-rsa';
import { Query as locationQuery } from '../location/Query';
import { Select, Values, Where, Insert } from '../util/sqlite3';
import { ValidationError } from 'apollo-server-micro';
import { publish } from '../user/Subscription';
import { config } from '../../Config';

const js = JSON.stringify;

type ID = `${number}`|number;

export const Query = {
	async getUsers (_parent, input:{device:{id:number|string}}, { getDB }) {
		const db = await getDB();
		const what = 'USER_ID';
		const from = 'device';
		const where = new Where({ DEVICE_ID: input?.device?.id, DEVICE_DEACTIVATED: false });
		const getUsers = () => `${new Select(what, { from, where })}`;
		try {
			let users = await db.all(getUsers());
			users = users.map(({ USER_ID }) => ({ id: USER_ID }));
			return { data: { users } };
		} catch (e) { return { errors: [e, new ValidationError('Error occurred with getUsers')] }; }
	},
	async getDeviceAuth (_parent, input:{device:{id:number|string, secret:string}}, { getDB }) {
		let key:any = null;
		let pubKey:any = null;
		try {
			key = NodeRSA(`${input?.device?.secret}`);
			pubKey = key.exportKey('pkcs1-public');
		} catch (e) { return { errors: [e, new ValidationError('Error occurred with getDeviceAuth')] }; }
		const db = await getDB();

		const what = 'DEVICE_ID';
		const from = 'device_auth';
		const where = new Where({ DEVICE_AUTH_DEACTIVATED: false, DEVICE_ID: input?.device?.id, DEVICE_PUBLIC: js(pubKey) });
		const getDeviceAuth = new Select(what, { from, where });

		try {
			let devices = await db.all(`${getDeviceAuth}`);
			devices = devices.map(({ DEVICE_ID }) => ({ id: DEVICE_ID }));
			return { data: { devices } };
		} catch (e) { return { errors: [e, new ValidationError('Error occurred with getDeviceAuth')] }; }
	},
	async auth (_parent, input:{device:{id:ID, secret:string}}, { getDB }) {
		const $getDeviceAuth$1 = await this.getDeviceAuth(_parent, { device: { id: input?.device?.id, secret: input?.device?.secret } }, { getDB });
		if (
			$getDeviceAuth$1?.data?.devices?.length != 1 ||
			$getDeviceAuth$1?.errors?.length
		) { return { errors: [...($getDeviceAuth$1?.errors || []), new ValidationError('Error occurred while auth')] }; }
		const $getUsers$1 = await this.getUsers(_parent, { device: { id: $getDeviceAuth$1?.data?.devices[0]?.id } }, { getDB });
		if (
			$getUsers$1?.data?.users?.length != 1 ||
			$getUsers$1?.errors?.length
		) { return { errors: [...($getUsers$1?.errors || []), new ValidationError('Error occurred while auth')] }; }
		return { data: { user: { id: $getUsers$1?.data?.users[0]?.id }, device: { id: $getDeviceAuth$1?.data?.devices[0]?.id } } };
	},
	async updateLocation (_parent, input:{location: any}, { getDB, user, device, io }) {
		if (typeof (device?.id) == 'undefined') { return { errors: [new ValidationError('Error occurred while updateLocation')] }; }
		let created_at:any = null;
		const $addLocation$1 = await locationQuery.addLocation(_parent, { device: { id: device?.id }, location: input?.location }, { getDB });
		if (
			$addLocation$1?.errors?.length
		) { return { errors: [...($addLocation$1?.errors || [])] }; }
		const location = $addLocation$1?.data?.location;
		created_at = location?.created_at;
		const $getLocations$1 = await locationQuery.getLocations(_parent, { device: { id: device?.id }, location: { created_at } }, { getDB });
		if (
			$getLocations$1?.errors?.length ||
			$getLocations$1?.data?.locations?.length != 1
		) { return { errors: [...($getLocations$1?.errors || []), new ValidationError('Error occurred while updateLocation')] }; }
		await publish(io, 'location', {
			user: { id: user?.id },
			device: { id: device?.id },
			location: $getLocations$1?.data?.locations[0]
		});
		return $getLocations$1?.data?.locations[0];
	}
};
