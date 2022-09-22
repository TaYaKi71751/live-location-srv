import { gql } from 'apollo-server-micro';

const id = (required?:boolean) => (`\n\tid: ID${required ? '!' : ''}\n`);
const deactivated = (required?:boolean) => (`\n\tdeactivated: Boolean${required ? '!' : ''}\n`);
const created_at = (required?:boolean) => (`\n\tcreated_at: ID${required ? '!' : ''}\n`);
const _public = (required?:boolean) => (`\n\tpublic: String${required ? '!' : ''}\n`);
const email = (required?:boolean) => (`\n\temail: String${required ? '!' : ''}\n`);
const password = (required?:boolean) => (`\n\tpassword: String${required ? '!' : ''}\n`);
const type:any = {};
type.UserAuth = `${id()}${deactivated()}${created_at()}${password()}`;
type.User = `${id()}${deactivated()}${created_at()}${email()}`;
type.UserWithAuth = `${type.User}
	auth: UserAuth
`;
type.Device = `${id()}${deactivated()}${created_at()}`;
type.DeviceAuth = `${id()}${deactivated()}${created_at()}${_public()}`;
type.DeviceWithAuth = `${type.Device}
	auth: DeviceAuth
`;
const input:any = {};
input.DeviceInput = `${id(true)}`;
input.UserAuthInput = `${email(true)}${password(true)}`;

export const schema = gql`
input DeviceInput {${input.DeviceInput}}
input UserAuthInput {${input.UserAuthInput}}
type UserAuth {${type.UserAuth}}
type User {${type.User}}
type UserWithAuth {${type.UserWithAuth}}
type DeviceAuth {${type.DeviceAuth}}
type Device {${type.Device}}
type DeviceWithAuth {${type.DeviceWithAuth}}

type RegisterResponse {
	user: UserWithAuth
}
type AddDeviceResponse {
	device: DeviceWithAuth
}
type DeactivateDeviceResponse {
	device: DeviceWithAuth
}

type Query {
	register(user:UserAuthInput): RegisterResponse
	addDevice: AddDeviceResponse
	deactivateDevice(device:DeviceInput): DeactivateDeviceResponse
	listDevice: [Device]
}

`;

export default schema;
