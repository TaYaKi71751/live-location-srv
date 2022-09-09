import { gql } from 'apollo-server-micro';

export const schema = gql`
input DeviceInput {
	id: ID!
}
input UserAuthInput {
	email:String!
	password:String!
}
type UserAuth {
	id: ID
	created_at: ID
	password: String
}
type User {
	id: ID
	email: String
	created_at: ID
	auth: UserAuth
}

type DeviceAuth {
	id: ID
	created_at: ID
	public: String
}
type Device {
	id: ID
	created_at: ID
	auth: DeviceAuth
}

type RegisterResponse {
	user: User
}
type AddDeviceResponse {
	device: Device
}
type DeactivateDeviceResponse {
	device: Device
}

type Query {
	register(user:UserAuthInput): RegisterResponse
	addDevice: AddDeviceResponse
	deactivateDevice(device:DeviceInput): DeactivateDeviceResponse
}

`;

export default schema;
