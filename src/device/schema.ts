import { gql } from 'apollo-server-micro';

const id = (required?:boolean) => (`\n\tid: ID${required ? '!' : ''}\n`);
const created_at = (required?:boolean) => (`\n\tcreated_at: ID${required ? '!' : ''}\n`);
const latitude = (required?:boolean) => (`\n\tlatitude: Float${required ? '!' : ''}\n`);
const longitude = (required?:boolean) => (`\n\tlongitude: Float${required ? '!' : ''}\n`);
const accuracy = (required?:boolean) => (`\n\taccuracy: Float${required ? '!' : ''}\n`);
const altitude = (required?:boolean) => (`\n\taltitude: Float${required ? '!' : ''}\n`);
const altitudeAccuracy = (required?:boolean) => (`\n\taltitudeAccuracy: Float${required ? '!' : ''}\n`);
const heading = (required?:boolean) => (`\n\theading: Float${required ? '!' : ''}\n`);
const speed = (required?:boolean) => (`\n\tspeed: Float${required ? '!' : ''}\n`);

const type:any = {};
type.Location = `${id()}${created_at()}${latitude()}${longitude()}${accuracy()}${altitude}${altitudeAccuracy()}${heading()}${speed()}`;
type.User = `${id()}`;
type.Device = `${id()}`;
const input:any = {};
input.LocationInput = `${latitude(true)}${longitude(true)}${accuracy(true)}${altitude()}${altitudeAccuracy()}${heading()}${speed()}`;
export const schema = gql`
input LocationInput {${input.LocationInput}}

type User {${type.User}}
type Device {${type.Device}}
type Location {${type.Location}}

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
