import http from 'http';
import SocketIO from 'socket.io';
import {config} from './Config';
import {getDB} from './src/Data';
import { Query as userQuery} from './src/user/Query';
import { Query as deviceQuery} from './src/device/Query';
import { ForbiddenError, ValidationError } from 'apollo-server-micro';
import {apolloServer as userApolloServer} from './src/user/ApolloServer';
import {apolloServer as deviceApolloServer} from './src/device/ApolloServer';

const httpServer = http.createServer();
const io = new SocketIO.Server(httpServer);
const auth = async (Query,socket) => {
	const {data,errors} = await Query.auth(undefined,socket.handshake.auth,{getDB});
	if(errors){
		const e = new ForbiddenError(`Authentication Forbidden`);
		socket.emit('error',e);
		socket.disconnect(e);
	}
	if(typeof (data?.user?.id) == 'undefined'){
		const e = new ValidationError(`Authentication Error`);
		socket.emit('error',e);
		socket.disconnect(e);
	};
	return {data,errors};
};

io.of(`${config.io.path.user.subscriptions}`).on("connection",async (socket)=>{
	const $auth$1 = await auth(userQuery,socket);
	if($auth$1?.errors || typeof ($auth$1?.data?.user?.id) == 'undefined') { return; }
	const $getDevices$1 = await userQuery.getDevices(undefined,{user:{id:$auth$1?.data?.user?.id},device:{deactivated:false}},{getDB});
	if(!$getDevices$1?.errors || $getDevices$1?.data?.devices?.filter((_d)=>(
		(typeof (socket?.handshake?.auth?.device?.id) == 'string' ||
		typeof (socket?.handshake?.auth?.device?.id) == 'number') && 
		`${_d.id}` === `${socket?.handshake?.auth?.device?.id}`
	))?.length) {  } else {
		const e = new ValidationError(`Authentication Error`);
		socket.emit('error',e);
		socket.disconnect(Boolean(e));
		return;
	}
	console.log('[server][socket.io][user][subscriptions][connection] connected !');
});

io.of(`${config.io.path.user.graphql}`).on("connection",async (socket)=>{
	console.log('[server][socket.io][user][graphql][connection] connected !');
	socket.on("query",async ({query}:{query:string})=>{
		const res = await userApolloServer.executeOperation({query},{io,socket,path:config.io.path.user.graphql});
		socket.emit('response',res?.data);
	})
});

io.of(`${config.io.path.device.graphql}`).on("connection",async (socket)=>{
	await auth(deviceQuery,socket);
	console.log('[server][socket.io][device][graphql][connection] connected !');
	socket.on("query",async ({query}:{query:string})=>{
		await auth(deviceQuery,socket);
		const res = await deviceApolloServer.executeOperation({query},{io,socket,path:config.io.path.device.graphql});
		socket.emit('response',res?.data);
	});
});

httpServer.listen(config.io.port,()=>{
 console.log(`[socket.io] GraphQL Listening ws://${config.io.hostname}:${config.io.port}${config.io.path.user.graphql} !`);
 console.log(`[socket.io] GraphQL Listening ws://${config.io.hostname}:${config.io.port}${config.io.path.device.graphql} !`);
 console.log(`[socket.io] WebSocket Listening ws://${config.io.hostname}:${config.io.port}${config.io.path.user.subscriptions} !`);
});
