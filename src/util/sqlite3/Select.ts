import { Where } from './Where';

export class Select {
	what:string = '';
	from:string = '';
	where:Where = new Where();
	constructor (what?:string, opts?:{
		from:string,
		where?:Where|{[x:string]:string|number|boolean|undefined}
	}) {
		this.what = what || '';
		this.from = opts?.from || '';
		this.where = new Where(opts?.where);
	}

	toString () {
		try {
			if (!`${this.what}`) { throw new TypeError('WHAT was empty string'); }
			if (!`${this.from}`) { throw new TypeError('FROM was empty string'); }
			return `SELECT ${this.what} FROM ${this.from} ${this.where}`;
		} catch (e) { return ''; }
	}
}
