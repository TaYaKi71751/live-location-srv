import SocketIO from 'socket.io';
import { config } from '../../Config';
import { getDB } from '../Data';
import { Query as userQuery } from "./Query";

export async function publish(io:SocketIO.Server,triggerName:string,data:{
	user:{id:number|string},
	device:{id:number|string},
	location:{
		id: number|string,
		created_at: number|string,
		latitude: number|string,
		longitude: number|string,
		accuracy: number|string,
		altitude?: number|string|null,
		altitude_accuracy?: number|string|null,
		heading?: number|string|null,
		speed?: number|string|null,
	}
}){
	const socketEntries = io?.of(`${config.io.path.user.subscriptions}`)?.sockets?.entries();
 if(!(socketEntries)){ return; }
	let _socket:any = null;
	while(!(_socket = socketEntries.next()).done) {
		if(!_socket.done) {
			const [k,s] = _socket.value;
			const {email,password,device} = s.handshake.auth;
			const u = await userQuery.auth(undefined,{email,password},{getDB});
			const d = await userQuery.getDevices(undefined,{user:{id:u?.data?.user?.id},device:{deactivated:false}},{getDB});
			if(
				!(s.disconnected) &&
				s.connected && 
				typeof (u?.data?.user?.id) != 'undefined' &&
				typeof (d?.data?.devices) != 'undefined' &&
				typeof (device?.id) != 'undefined' &&
				typeof (data?.device?.id) != 'undefined' &&
				typeof (data?.user?.id) != 'undefined' &&
				d?.data?.devices?.filter((_d)=>(
					typeof (_d?.id) != 'undefined' &&
					typeof (data?.device?.id) != 'undefined' &&
					`${_d?.id}` === `${data?.device?.id}` &&
				 `${_d?.id}` === `${device?.id}`
				))?.length &&
				`${device?.id}` === `${data?.device?.id}` &&
				`${u?.data?.user?.id}` === `${data?.user?.id}` &&
				d?.data?.devices?.length != 0
			) {
				s.emit(triggerName,data);
			}
		}
	}
}
