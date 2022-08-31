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

type Location {
	id: ID!
	latitude: Float!
	longitude: Float!
	accuracy: Float!
	altitude: Float
	altitudeAccuracy: Float
	heading: Float
	speed: Float
	created_at: ID!
}

type Query {
	updateLocation(location:LocationInput): Location!
}
`;

export default schema;
