import SocketIO from 'socket.io';

export async function publish (
	io:SocketIO.Server,
	path:string,
	triggerName:string,
	data:any,
	filter?:((socket, data) => Promise<boolean>)
	) {
		io.of(path).sockets.forEach((socket)=>{
			filter(socket,data)
			.then((stat)=>{
				if(stat){socket.emit(triggerName,data)}
			})
		})
	}
	