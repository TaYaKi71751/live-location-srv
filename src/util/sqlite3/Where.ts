import { Values } from './Values';
const js = JSON.stringify;

export class Where extends Values {
	constructor (values?:{
		[x:string]:string|number|boolean,
	}) {
		super();
		Object.assign(this, values);
	}

	toString () {
		const _c = this.clone();
		const _ = _c.entries();
		if (!_.length) { return ''; }
		const __ = _.map(
			([k, v]) => ([(k), typeof v == 'boolean' ? Number(v) : v].join(' = '))
		).join(' AND ');
		return __ ? `WHERE ${__}` : '';
	}
}
