import http from 'http';
import { default as typeDefs } from './schema'
import { get, post, router } from 'microrouter';
import { ApolloServer, gql } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';
import {PubSub, withFilter} from 'graphql-subscriptions';

import sqlite3 from 'sqlite3';
import {open} from 'sqlite';

import {config} from './Config';

const js = JSON.stringify;
const oe = Object.entries;
const fe = Object.fromEntries;

const pubsub = new PubSub();

const resolvers = {
	Query: {
		async register (_parent,{auth},{getDB}) {
			if(!auth.email || !auth.password){ return; }
			db = await getDB();
			const result = await db.all(
				`SELECT * FROM user
					WHERE 
						USER_EMAIL = ${js(auth.email)} 
					AND 
						USER_DEACTIVATED = 0`
			);
			if(!result.length) {
				await db.run(
					`INSERT INTO user
						(
							USER_ID,
							USER_EMAIL,
							USER_PASSWORD,
							CREATED_AT
						) 
						VALUES (
							(SELECT IFNULL(MAX(USER_ID),-1) FROM user) + 1,
							${js(auth.email)},
							${js(auth.password)},
							${Date.now()}
						)`
				);
				const _auth = await this.auth(_parent,{auth},{getDB});
				return _auth;
			}
		},
		async auth (_parent,{auth},{getDB}) {
			if(!auth.email || !auth.password){ return; }
			db = await getDB();
			let _auth = await db.all(
				`SELECT * FROM user 
						WHERE 
							USER_EMAIL = ${js(auth.email)} 
						AND
							USER_PASSWORD = ${js(auth.password)} 
						AND 
							USER_DEACTIVATED = 0`
			);
			if(!_auth.length) { return; }
			_auth = fe(
				oe(_auth[0])
					.map(([k,v]:[k:string,v:any])=>([k.replace('USER_','').toLowerCase(),v]))
			);
			return _auth;
		},
		async listDevice (_parent,{auth},{getDB}){
			const _auth = await this.auth(_parent,{auth},{getDB});
			db = await getDB();
			let devices = await db.all(
				`SELECT * FROM device 
						WHERE 
							USER_ID = ${js(_auth.id)}
						AND 
							DEVICE_DEACTIVATED = 0`
			);
			if(!devices.length){ return devices; }
				devices = devices.sort((a,b)=>(a.CREATED_AT - b.CREATED_AT));
				devices = devices.map((d:any)=>(
					fe(
						oe(d)
							.map(([k,v]:[k:string,v:any])=>([k.replace('DEVICE_','').toLowerCase(),v]))
					)
			));
			return devices;
		},
		async addDevice (_parent,{auth},{getDB}){
			const _auth = await this.auth(_parent,{auth},{getDB});
			await db.run(
				`INSERT INTO device 
					(
						USER_ID,
						DEVICE_ID,
						CREATED_AT
					) VALUES (
						${js(_auth.id)},
						(SELECT IFNULL(MAX(DEVICE_ID),-1) FROM device) + 1,
						${Date.now()}
					)`
			);
			const devices = await this.listDevice(_parent,{auth},{getDB});
			return devices;
		},
		async deleteDevice (_parent,{auth,device},{getDB}){
			const _auth = await this.auth(_parent,{auth},{getDB});
			let devices = await this.listDevice(_parent,{auth},{getDB});
			if(!devices.filter((d)=>(d.id == device.id)).length) { return; }
			await db.run(
				`UPDATE device SET DEVICE_DEACTIVATED = 1
						WHERE 
							USER_ID = ${_auth.id}
						AND 
							DEVICE_ID = ${js(device.id)}
						AND 
							DEVICE_DEACTIVATED = 0`
			);
			devices = await this.listDevice(_parent,{auth},{getDB});
			return devices;
		},
		async updateLocation (_parent,{auth,device,location},{getDB}){
			const _auth = await this.auth(_parent,{auth},{getDB});
			let devices = await this.listDevice(_parent,{auth},{getDB});
			let _device = devices.filter((d)=>(d.id == device.id));
			if(!_device.length) { return; }
			_device = _device[0];
			await db.run(
				`INSERT INTO location 
					(
						USER_ID,
						DEVICE_ID,
						LOCATION_ID,
						CREATED_AT,
						LOCATION_LATITUDE,
						LOCATION_LONGITUDE
					) VALUES (
						${_auth.id},
						${device.id},
						(SELECT IFNULL(MAX(LOCATION_ID),-1) FROM location) + 1,
						${js(Date.now())},
						${location.latitude},
						${location.longitude}
					)`
			);
			let _location = await db.all(
				`SELECT * FROM location 
						WHERE 
							USER_ID = ${_auth.id} 
						AND 
							DEVICE_ID = ${js(device.id)}
						AND 
							LOCATION_ID = (SELECT MAX(LOCATION_ID) FROM location)`
			);
			_location = _location[0];
			_location = fe(
				oe(_location)
					.map(([k,v]:[k:string,v:any])=>([k.replace('LOCATION_','').toLowerCase(),v]))
			);
			const _args = {
					device: _device,
					user: _auth,
					location: _location
			};
			pubsub.publish('LOCATION_UPDATED',{
				locationUpdated: _args
			})
			return _args;
		},
	},
	Subscription: {
		locationUpdated: {
			async subscribe(payload,args,info){
				const _auth = await info.resolvers.Query.auth(payload,args,info);
				return withFilter(
					() => pubsub.asyncIterator(['LOCATION_UPDATED']),
					(payload,args,info) => {
						return (
							payload.locationUpdated.device.id == args.device.id &&
							payload.locationUpdated.user.id == _auth.id
						);
					}
				)(payload,args,info);
			},
		},
	}
};

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

let db:any = null;

const server = new ApolloServer({
	schema,
	playground: config.apollo.playground,
	introspection: true,
	context () {
		const getDB = async () => {
			if(!db) {
				db = await open({
					filename: config.db.path,
					mode: sqlite3.OPEN_READWRITE,
					driver: sqlite3.Database
				});
			}
			return db;
		}
		return {
			getDB,
			resolvers
		}
	}
});

const handler = server.createHandler({ path: '/graphql' });

const httpServer = http.createServer((req,res)=>(handler(req,res)));
server.installSubscriptionHandlers(httpServer);
export default httpServer.listen(config.http.port);