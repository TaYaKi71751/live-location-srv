export type HttpServerConfig = {
	port: Number;
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
	http:{port: 3000},
	apollo:{playground:true},
	db: {path: './tmp.db'}
};
