import { register, addDevice, listDevice, deactivateDevice } from './Query/index';

export const resolvers = {
	Query: {
		register,
		addDevice,
		listDevice,
		deactivateDevice
	}
};
