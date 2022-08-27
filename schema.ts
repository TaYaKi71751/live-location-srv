import { gql } from 'apollo-server-micro'

export const schema = gql`
input LocationInput {
	latitude: Float!
	longitude: Float!
}

input DeviceInput {
	id: ID
}

input AuthInput {
	email: String!
	password: String!
}

type User {
	id: ID
	email: String
	created_at: ID
}

type Device {
	id: ID
	user: User
	location: Location
	created_at: ID
}
type Location {
	id: ID
	created_at:	ID
	latitude: Float
	longitude: Float
}

type DeviceSubscriptionAlert {
	user: User!
	device: Device!
	location: Location!
}

type Query {
	register(auth:AuthInput!):User!
	auth(auth:AuthInput!):User!

	listDevice(auth:AuthInput!): [Device]

	addDevice(auth:AuthInput!): [Device]
	deleteDevice(auth:AuthInput!,device:DeviceInput!): [Device]

	updateLocation(auth: AuthInput!,device: DeviceInput!, location: LocationInput!): DeviceSubscriptionAlert!
}

type Subscription {
	locationUpdated(auth:AuthInput!,device: DeviceInput!): DeviceSubscriptionAlert
}
`

export default schema
