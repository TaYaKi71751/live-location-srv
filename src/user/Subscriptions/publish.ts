import SocketIO from 'socket.io';

export async function publish (
	io:SocketIO.Server,
	path:string,
	room:string,
	triggerName:string,
	data:any
) {
	io.of(path).to(room).emit(triggerName, data);
}

