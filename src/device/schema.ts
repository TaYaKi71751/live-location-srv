import { gql } from 'apollo-server-micro';

export const schema = gql`
input LocationInput {
	latitude: Float!
	longitude: Float!
	accuracy: Float!
	altitude: Float
	altitudeAccuracy: Float
	heading: Float
	speed: Float
}

type User {
	id: ID
}
type Device {
	id: ID
	secret: String
}
type Location {
	id: ID
	latitude: Float
	longitude: Float
	accuracy: Float
	altitude: Float
	altitudeAccuracy: Float
	heading: Float
	speed: Float
	created_at: ID
}

type LocationAlert {
	user: User
	device: Device
	location: Location
}


type Query {
	reportLocation(location:LocationInput): Location
}

`;

export default schema;
