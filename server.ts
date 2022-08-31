import http from 'http';
import {config} from './Config';
import {apolloServer as userApolloServer,schema as userSchema} from './src/user/ApolloServer';
import {apolloServer as deviceApolloServer} from './src/device/ApolloServer';
const userHandler = userApolloServer.createHandler({path: '/user/graphql' });
const deviceHandler = deviceApolloServer.createHandler({path: '/device/graphql' });

const httpServer = http.createServer((req,res)=>{
	if(`${req.url}`.startsWith('/user')) { userHandler(req,res); }
	if(`${req.url}`.startsWith('/device')) { deviceHandler(req,res); }
});

userApolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen(config.http.port);

export {httpServer}