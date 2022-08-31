import { withFilter,PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();
export function getPubSub(){ return pubsub; }

export const Subscription = {
	locationUpdated: {
		async subscribe(payload,args,info){
			const _auth = await info.resolvers.Query.auth(payload,args,info);
			return withFilter(
				() => pubsub.asyncIterator(['LOCATION_UPDATED']),
					(payload,args,info) => {
					return (
						payload.locationUpdated.device.id == args.device.id &&
							payload.locationUpdated.user.id == _auth.id
					);
				}
			)(payload,args,info);
		},
	},
};
