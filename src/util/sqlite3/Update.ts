import { Set, Where } from './index';
export class Update {
	to:string = '';
	set:Set = new Set();
	where:Where = new Where();
	constructor (to?:string, opts?:{
		set?:Set|{[x:string]:string|number|boolean|undefined},
		where?:Where|{[x:string]:string|number|boolean|undefined}
	}) {
		this.to = to || '';
		this.set = new Set(opts?.set);
		this.where = new Where(opts?.where);
	}

	toString () {
		try {
			if (!this.to) { throw new TypeError('TO was empty'); }
			if (!`${this.set}`) { throw new TypeError('SET was empty'); }
			return `UPDATE ${this.to} ${this.set} ${this.where}`;
		} catch (e) { return ''; }
	}
}
