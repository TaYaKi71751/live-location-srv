import { ForbiddenError, ValidationError } from 'apollo-server-micro';
import NodeRSA from 'node-rsa';
const js = JSON.stringify;
const oe = Object.entries;
const fe = Object.fromEntries;

export type UserRegisterInput = {
	email:string,
	password:string
};

export type UserAuthInput = {
	email:string,
	password:string
};

const Where = function(){};
Where.prototype.toString = function(): string {
	const _ = Object.entries(this)
	.filter(([k,v])=>(typeof k != 'undefined' && typeof v != 'undefined'));
	if(!_.length) { return ''; }
	const __ = _.map(
		([k,v])=>([js(k),typeof v == 'boolean' ? Number(v) : v].join(' = '))
	).join(' AND ');
	return __ ? `WHERE ${__}` : '';
};

const Values = function(){};
Values.prototype.toString = function(): string {
	const _ = Object.entries(this)
		.filter(([k,v])=>(typeof k != 'undefined' && typeof v != 'undefined'));
	if(!_.length) { return ''; }
	const _keys = _.map(([k,v])=>(k));
	const _values = _.map(([k,v])=>(v));
	const __ = `( ${_keys.join(',')} ) VALUES ( ${_values.join(',')} )`;
	return __ || '';
}

export const Query = {
	async getUsers (_parent: any,input:{email?:string,created_at?:number|string,deactivated?:boolean},{getDB}: any) {
		const where:{[x:string]:any} = new Where();
		if(!input?.email) { return; } else { where['USER_EMAIL'] = js(input.email); }
		if(typeof input?.deactivated == 'undefined') {  } else { where['USER_DEACTIVATED'] = Boolean(input.deactivated); }

		const db = await getDB();

		try {
			const getUserID = `SELECT * FROM user ${where}`;
			const userList = await db.all(getUserID);
			const users = userList.map(
				(u: { [s: string]: unknown; } | ArrayLike<unknown>)=>fe(oe(u).map(([k,v])=>([k.replace('USER_','').toLowerCase(),v])))
			);
			return { data:{ users } }
		} catch(e){ return { errors:[e] }; }
	},
	async getUserAuth (_parent: any,input:{id?:number|string,password?:string,deactivated?:boolean},{getDB}: any){
		const where:{[x:string]:any} = new Where();
		if(typeof (input?.id) == 'undefined') { return; } else { where['USER_ID'] = input.id; }
		if(!input?.password) { return; } else { where['USER_PASSWORD'] = input.password; }
		if(typeof input?.deactivated == 'undefined') {  } else { where['USER_AUTH_DEACTIVATED'] = Boolean(input.deactivated); }

		const db = await getDB();

		try {
			const getUserID = `SELECT * FROM user_auth ${where}`;
			const userList:any[] = await db.all(getUserID);
			const auths = userList.map((a)=>(
				fe(oe(a).map(([k,v])=>[k.replace('USER_','').replace('AUTH_','').toLowerCase(),v]))
			));
			return { data:{ user:{auths} } }
		} catch(e){ return { errors:[e] }; }
	},
	async getDevices (_parent: any,input:{user:{id:number|string},device:{deactivated?:boolean}},{getDB}: any) {
		const where:{[x:string]:any} = new Where();
		if(typeof (input?.user?.id) == 'undefined') { return; } else { where['USER_ID'] = input?.user?.id; }
		if(typeof (input?.device?.deactivated) == 'undefined') {  } else { where['DEVICE_DEACTIVATED'] = Boolean(input?.device?.deactivated); }

		const db = await getDB();

		try {
			const getDevices = `SELECT * FROM device ${where}`;
			const deviceList = await db.all(getDevices);
			const devices = deviceList.map(
				(d)=>fe(oe(d).map(([k,v])=>([k.replace('DEVICE_','').toLowerCase(),v])))
			);
			return { data:{ devices } }
		} catch(e){ return { errors:[e] }; }
		
	},
	async addUser (_parent: any,input:{email:string},{getDB}: any) {
		const $getUsers$1 = await this.getUsers(_parent,{email:input.email,deactivated:false},{getDB});
		if($getUsers$1.errors) { return {errors:[...($getUsers$1.errors||[]),new ValidationError(`Error occurred with addUser`)]}; }
		if(typeof ($getUsers$1?.data?.users?.length) == 'undefined') { return {errors:[new ValidationError(`Error occurred with addUser`)]}; }
		if($getUsers$1?.data?.users?.length){return {errors:[new ForbiddenError(`Account Already Exists`)]}}
		const db = await getDB();

		let created_at:any = null;
		const NEW_USER_ID = '(SELECT IFNULL(MAX(USER_ID),-1) FROM user) + 1';
		const add_user_values = () => {
			const _ = new Values();
			_['USER_ID'] = NEW_USER_ID;
			_['USER_EMAIL'] = js(input.email);
			_['CREATED_AT'] = js(created_at = Date.now());
			return _;
		};
		const add_user = () => `INSERT INTO user ${add_user_values()}`;
		try{
			await db.run(add_user());
			return { data:{ user:{ created_at } } };
		} catch(e){ return {errors:[e]}; }
	},
	async addUserAuth (_parent: any,input:{id:number|string,password:string},{getDB}: any) {
		const db = await getDB();
		let created_at:any = null;
		const add_user_auth_values = () => {
			const _ = new Values();
			_['USER_ID'] = js(input.id);
			_['USER_PASSWORD'] = js(input.password);
			_['CREATED_AT'] = js(created_at = Date.now());
			return _;
		};
		const add_user_auth = () => `INSERT INTO user_auth ${add_user_auth_values()}`;	
		await db.run(add_user_auth());
		return { data:{ user:{ auth:{ created_at } } }};
	},
	async register (_parent: any,input:{email:string,password:string},{getDB,Query}) {
		if(!input.email || !input.password) { return; }
		const $getUsers$1 = await Query.getUsers(_parent,{email:input.email,deactivated:false},{getDB});
		if(
			typeof ($getUsers$1?.data?.users?.length) != 'undefined' &&
			$getUsers$1?.data?.users?.length
		) { return { errors: [...($getUsers$1?.errors||[]),new ForbiddenError(`Account already exists`)] }; }
		const $addUser$1 = await Query.addUser(_parent,{email:input.email},{getDB});
		if(typeof ($addUser$1?.data?.user?.created_at) == 'undefined') { return {errors:[...($addUser$1?.errors||[]),new ValidationError(`Error occured with $addUser$1`)]}; }
		const $getUsers$2 = await Query.getUsers(_parent,{deactivated:false,created_at:$addUser$1?.data?.user?.created_at,email:input.email},{getDB});
		if(typeof ($getUsers$2?.data?.users?.length) == 'undefined') { return {errors:[...($getUsers$2?.errors||[]),new ValidationError(`Error occured with $getUsers$2`)]}; }
		if($getUsers$2.data.users.length != 1){ return {errors:[new ValidationError(`Error occured with $getUsers$2`)]}; }
		const $addUserAuth$1 = await Query.addUserAuth(_parent,{id:$getUsers$2?.data?.users[0]?.id,password:input.password},{getDB});
		if(typeof ($addUserAuth$1?.data?.user?.auth?.created_at) == 'undefined') { return {errors:[...($addUserAuth$1?.errors||[]),new ValidationError(`Error occured with $addUserAuth$1`)]}; }
		const rtn = {user:{created_at:$addUser$1?.data?.user?.created_at,id:$getUsers$2?.data?.users[0].id},auth:{created_at:$addUserAuth$1?.data?.user?.auth?.created_at}};
		return rtn;
	},
	async auth (_parent: any,input:any | UserAuthInput,{getDB,Query}) {
		if(!input.email || !input.password) { return; }
		const $getUsers$1 = await Query.getUsers(_parent,{deactivated:false,email:input.email},{getDB});
		if(typeof ($getUsers$1?.data?.users?.length) == 'undefined') { return { errors: [...($getUsers$1?.errors||[]),new ForbiddenError(`Account doesn't exists`)] }; }
		if($getUsers$1?.data?.users?.length != 1){ return { errors: [...($getUsers$1?.errors||[]),new ValidationError(`Error occured with $getUsers$1`)] }; }
		const $getUserAuth$1 = await Query.getUserAuth(_parent,{deactivated:false,id:$getUsers$1?.data?.users[0]?.id,password:input.password},{getDB});
		if(typeof ($getUserAuth$1?.data?.user?.auths?.length) == 'undefined'){ return { errors:[...($getUserAuth$1?.errors||[]),new ValidationError(`Error occured with $getUserAuth$1`)] }; }
		if($getUserAuth$1?.data?.user?.auths?.length != 1){ return {errors:[...($getUserAuth$1?.errors||[]),new ValidationError(`Error occured with $getUserAuth$1`)]}}
		return {data:{user:{id:$getUserAuth$1?.data?.user?.auths[0]?.id}}};
	},
	async addDevice (_parent: any,input: any,{getDB,user,path}: any) {
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
	async deactivateDevice (_parent: any,input: { device: { id: any; }; },{getDB,user}: any) {
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
