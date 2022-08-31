export type HttpServerConfig = {
	port: Number;
	hostname: string;
};
export type DataBaseConfig = {
	path: string;
}
export type ApolloServerConfig = {
	playground: boolean;
}
export type Config = {
	http: HttpServerConfig;
	apollo: ApolloServerConfig;
	db: DataBaseConfig;
};
export const config: Config = {
	http:{port: 3000,hostname:'example.com'},
	apollo:{playground:true},
	db: {path: './tmp.db'}
};
