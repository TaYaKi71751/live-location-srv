import SocketIO from 'socket.io';

export async function publish (
	io:SocketIO.Server,
	path:string,
	triggerName:string,
	data:any,
	filter?:((socket, data) => Promise<boolean>|boolean)
) {
	let _socket:any = null;
	const socketEntries = io.of(`${path}`)?.sockets?.entries();
	while (!(_socket = socketEntries.next()).done) {
		const [, s] = _socket.value;
		const f = await (filter || (async (socket, data) => true))(s, data);
		if (f) { s.emit(triggerName, data); }
	}
}
