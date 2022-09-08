import { register, addDevice, deactivateDevice } from './Query/index';

export const resolvers = {
	Query: {
		register,
		addDevice,
		deactivateDevice
	}
};
