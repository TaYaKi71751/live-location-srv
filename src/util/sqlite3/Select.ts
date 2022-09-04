import { Where } from './Where';

export class Select {
	what:string = '';
	from:string = '';
	where:Where = new Where();
	constructor (what?:string, opts?:{
		from:string,
		where?:Where
	}) {
		if (typeof what == 'string') { if (!what) { throw new TypeError('Something wrong with what'); } else { this.what = what; } }
		if (typeof opts?.from == 'string') { if (!opts?.from) { throw new TypeError('Something wrong with from'); } else { this.from = opts?.from; } }
		if (typeof opts?.where == 'string' || opts?.where instanceof Where) { if (!`${opts?.where}`) { throw new TypeError('Something wrong with where'); } else { Object.assign(this.where, opts?.where); } }
	}

	toString () {
		if (!`${this?.what || ''}` || !`${this?.from || ''}`) { return ''; }
		return (
			`SELECT ${this?.what} FROM ${this?.from}${this?.where ? ` ${this?.where}` : ''}`
		);
	}
}
