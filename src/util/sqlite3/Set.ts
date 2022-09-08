import { Values } from './Values';
import { Where } from './Where';
export class Set extends Values {
	constructor (values?:{
		[x:string]:string|number|boolean|undefined,
	}|Set|Where|Values) {
		super();
		Object.assign(this, values);
	}

	toString () {
		const _c = this.clone();
		_c.apply();
		const _ = (
			_c.entries()
				.map(([k, v]) => `${k} = ${(typeof v == 'boolean' ? Number(v) : v)}`)
		);
		if (!_.length) { return ''; }
		return _.join(',') || '';
	}
}
