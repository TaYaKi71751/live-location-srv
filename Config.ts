export type SocketIOServerConfig = {
	hostname: string;
	path: {
		user:{graphql:string,subscriptions:string};
		device:{graphql:string};
	};
	port: number;
};
export type DataBaseConfig = {
	path: string;
}
export type ApolloServerConfig = {
	playground: boolean;
}
export type Config = {
	io: SocketIOServerConfig;
	apollo: ApolloServerConfig;
	db: DataBaseConfig;
};
export const config: Config = {
	io:{port: 4000,hostname:'localhost',path:{user:{graphql:'/user/graphql',subscriptions:'/user/subscriptions',},device:{graphql:'/device/graphql'}}},
	apollo:{playground:false},
	db: {path: './tmp.db'}
};
