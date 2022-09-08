import { faker } from '@faker-js/faker';
import { config } from '../../../Config';
import { gql } from 'apollo-server-micro';
import { io } from 'socket.io-client';
import fs from 'fs';

const js = JSON.stringify;
const outFile = './auths.json';
const path = config.io.path.user.graphql;
const { hostname, port } = config.io;

const socket = io(`ws://${hostname}:${port}${path}`);

const randomUserAuth = () => ({
	user: {
		email: faker.internet.email(),
		password: faker.internet.password()
	}
});

const registerQuery = (auth:{user:{email:string, password:string}}) => `${(gql`query {
	register(user:{email:${js(auth.user.email)},password:${js(auth.user.password)}}) {
		user {
			email,
			auth {
				password,
				created_at
			}
		}
	}
}`).loc.source.body}`;
const register = (socket) => {
	let _:any = null;
	let auth = randomUserAuth();
	const events = ['connect', 'disconnect', 'response'];
	events?.forEach((event) => (
		socket.on(event, (data) => (
			console.log(`[socket.io][${path}][${event}]`, data)
		))
	));
	socket.on('response', ({data}) => {
		const register = data?.register;
		const email = register?.user?.email;
		const password = register?.user?.auth?.password;

		if (email && password) {
			try { _ = fs.readFileSync(outFile).toString() || '[]'; } catch (e) { _ = '[]'; };
			_ = JSON.parse(_);
			_.push({ user: { email,password } });
			fs.writeFileSync(outFile, js(_));
		}
		auth = randomUserAuth();
	});
	const registerInterval = setInterval(
		() => socket.emit('query', { query: `${registerQuery(randomUserAuth())}` }),
		1000 + (Math.random() * 1000 % 777)
	);
};
register(socket);
