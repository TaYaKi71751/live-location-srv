import { Select, Insert, Values } from '../../util/sqlite3';
import NodeRSA from 'node-rsa';

const js = JSON.stringify;

type ID = `${number}`|number;

type DeviceAuth={
	id:ID;
	created_at:ID;
	secret:string;
	public:string;
};

type Device = {
	id:ID;
	auth:DeviceAuth;
};

export async function insertDeviceAuth (
	_parent,
	input:{device:Omit<Device, 'auth'>},
	{ getDB }
):Promise<{
	data?:{rows?:Array<{device:Device}>},
	errors?:Array<Error>
}> {
	const device:any = input?.device;
	const auth:any = {};
	const db = await getDB();
	const into = 'device_auth';
	const key = new NodeRSA({ b: 512 });
	const values = () => new Values({
		DEVICE_ID: device.id,
		DEVICE_AUTH_ID: `(${new Select('IFNULL(MAX(DEVICE_AUTH_ID),-1)', { from: into })}) + 1`,
		DEVICE_AUTH_SECRET: js(auth.secret = key.exportKey('pkcs1')),
		DEVICE_AUTH_PUBLIC: js(auth.public = key.exportKey('pkcs1-public')),
		CREATED_AT: js(auth.created_at = Date.now())
	});
	const insertDeviceAuth = () => (`${new Insert(into, values())}`);
	try {
		await db.run(insertDeviceAuth());
		return { data: { rows: [{ device: { id: device.id, auth } }] } };
	} catch (e) { return { errors: [e] }; }
}
