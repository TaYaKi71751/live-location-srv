import NodeRSA from 'node-rsa';
import {getPubSub as getUserSubscriptionPubSub} from '../user/Subscription';
const js = JSON.stringify;
const oe = Object.entries;
const fe = Object.fromEntries;

export const Query = {
	async auth (_parent,input,{getDB}) {
		const db = await getDB();
		const key = NodeRSA(input.secret);
		const pubKey = key.exportKey('pkcs1-public');
		const selectDevice = () => `SELECT DEVICE_ID FROM device_auth WHERE DEVICE_AUTH_DEACTIVATED = 0 AND DEVICE_ID = ${js(input.id)} AND DEVICE_PUBLIC = ${js(pubKey)}`;
		const selectedDevices = await db.all(selectDevice());
		if(selectedDevices.length != 1) { return; }
		const selectedDeviceIDs = selectedDevices.map(({DEVICE_ID})=>DEVICE_ID);
		const selectedDeviceID = selectedDeviceIDs[0];
		const selectUser = () => `SELECT USER_ID FROM device WHERE DEVICE_DEACTIVATED = 0 AND DEVICE_ID= ${js(selectedDeviceID)}`;
		const selectedUsers = await db.all(selectUser());
		if(selectedUsers.length != 1) { return; }
		const selectedUserIDs = selectedUsers.map(({USER_ID})=>USER_ID);
		const selectedUserID = selectedUsers[0];
		return {
			device:{id:selectedDeviceID},
			user:{id:selectedUserID},
		}
	},
	async updateLocation (_parent,input,{getDB,user,device}) {
		const db = await getDB();
		let {location} = input;
		let created_at:any = null;
		location = fe(oe(location).map(([k,v])=>(['LOCATION_'+k.toUpperCase(),v])));
		const addLocation = () => `INSERT INTO location (DEVICE_ID,LOCATION_ID,CREATED_AT,${Object.keys(location)}) VALUES (${js(device.id)},(SELECT IFNULL(MAX(LOCATION_ID),-1) FROM location) + 1,${js(created_at = Date.now())},${Object.values(location)})`;
		const selectAddedLocation = () => `SELECT * FROM location WHERE DEVICE_ID = ${js(device.id)} AND CREATED_AT = ${js(created_at)}`;
		await db.run(addLocation());
		const addedLocations = await db.all(selectAddedLocation());
		if(addedLocations.length != 1) { return; }
		const addedLocation = addedLocations[0];
		const _location = fe(oe(addedLocation).map(([k,v])=>([k.replace('LOCATION_','').toLowerCase(),v])));
		getUserSubscriptionPubSub()
			.publish('LOCATION_UPDATED',{
				user:{id:user.id},
				device:{id:device.id},
				location: _location
			})
		return addedLocation;
	}
}
