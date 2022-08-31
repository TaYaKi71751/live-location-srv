import NodeRSA from 'node-rsa';
const js = JSON.stringify;

export type UserRegisterInput = {
	email:string,
	password:string
};

export type UserAuthInput = {
	email:string,
	password:string
};

export const Query = {
	async register (_parent,input,{getDB}) {
		if(!input.email || !input.password) { return; }
		const db = await getDB();
		let created_at:any = null;
		const isExistsEmail = `SELECT USER_ID FROM user WHERE USER_EMAIL = ${js(input.email)}`;
		try {
			const emailExistsUserIDs = await db.all(isExistsEmail);
			const emailExists = emailExistsUserIDs.length;
			if(emailExists){ return; }
		} catch (e:any) {}
		const add_user = () => `INSERT INTO user ( USER_ID, USER_EMAIL, CREATED_AT ) 
		VALUES ( (SELECT IFNULL(MAX(USER_ID),-1) FROM user) + 1, ${js(input.email)}, ${js(created_at = Date.now())} )`;
		const select_user = () => `SELECT USER_ID FROM user WHERE USER_EMAIL = ${js(input.email)} AND CREATED_AT = ${js(created_at)}`;
		await db.run(add_user());
		const selected_users = await db.all(select_user());
		const selected_user_ids = selected_users.map(({USER_ID})=>USER_ID);
		const selected_user_id = selected_user_ids[0];
		const add_user_auth = () => `INSERT INTO user_auth ( USER_ID, USER_PASSWORD, CREATED_AT ) 
		VALUES ( ${selected_user_id}, ${js(input.password)}, ${js(created_at = Date.now())} )`;
		await db.run(add_user_auth());
		return {user:{id:selected_user_id}};
	},
	async auth (_parent,input:any | UserAuthInput,{getDB}) {
		if(!input.email || !input.password) { return; }
		const db = await getDB();
		const getEmailUsers = `SELECT USER_ID FROM user WHERE USER_DEACTIVATED = 0 AND USER_EMAIL = ${js(input.email)}`;
		const emailUsers = await db.all(getEmailUsers);
		if(emailUsers.length != 1) { return; }
		const emailUser = emailUsers[0];
		const getPasswordUsers = `SELECT USER_ID FROM user_auth WHERE USER_AUTH_DEACTIVATED = 0 AND USER_ID = ${emailUser.USER_ID} AND USER_PASSWORD = ${js(input.password)}`
		const targetUsers = await db.all(getPasswordUsers);
		if(targetUsers.length != 1) { return; }
		const targetUserIDs = targetUsers.map(({USER_ID})=>(USER_ID))
		const targetUserID = targetUserIDs[0];
		return {user:{id:targetUserID}};
	},
	async addDevice (_parent,input,{getDB,user}) {
		if(!user || user.id === undefined) { return; }
		const db = await getDB();
		let created_at:any = null;
		let key = NodeRSA({b:512});
		key = {
			private: key.exportKey('pkcs1'),
			public: key.exportKey('pkcs1-public')
		};
		const addDevice = () => `INSERT INTO device (USER_ID,DEVICE_ID,CREATED_AT) VALUES (${user.id},(SELECT IFNULL(MAX(DEVICE_ID),-1) FROM device) + 1,${js(created_at = Date.now())})`;
		await db.run(addDevice());
		const selectAddedDevice = () => `SELECT DEVICE_ID FROM device WHERE DEVICE_DEACTIVATED = 0 AND USER_ID = ${user.id} AND CREATED_AT = ${js(created_at)}`;
		const selectedDevices = await db.all(selectAddedDevice());
		const selectedDeviceIDs = selectedDevices.map(({DEVICE_ID})=>DEVICE_ID);
		const selectedDeviceID = selectedDeviceIDs[0];
		const addDeviceAuth = () => `INSERT INTO device_auth (DEVICE_ID,CREATED_AT,DEVICE_SECRET,DEVICE_PUBLIC) VALUES (${selectedDeviceID},${js(created_at = Date.now())},${js(key.private)},${js(key.public)})`;
		await db.run(addDeviceAuth());
		const device = {id:selectedDeviceID,secret:key.public};
		return device;
	},
	async deactivateDevice (_parent,input,{getDB,user}) {
		if(!user || user.id === undefined) { return; }
		if(!input.device.id) { return; }
		const db = await getDB();
		const deactivateDevice = `UPDATE device SET DEVICE_DEACTIVATED = 1 WHERE USER_ID = ${user.id} AND DEVICE_ID = ${js(input.device.id)} AND DEVICE_DEACTIVATED = 0`;
		const deactivateDeviceAuth = `UPDATE device_auth SET DEVICE_AUTH_DEACTIVATED = 1 WHERE DEVICE_ID = ${js(input.device.id)} AND DEVICE_AUTH_DEACTIVATED = 0`;
		await db.run(deactivateDevice);
		await db.run(deactivateDeviceAuth);
		const getDeactivatedDevice = `SELECT * FROM device WHERE DEVICE_DEACTIVATED = 1 AND USER_ID = ${user.id} AND DEVICE_ID = ${js(input.device.id)}`;
		const deactivatedDevices = await db.all(getDeactivatedDevice);
		const deactivatedDevice = deactivatedDevices[0];
		return deactivatedDevice;
	}
};
