import { Values } from './Values';
export class Insert {
	into:string = '';
	values:Values = new Values();
	constructor (into?:string, values?:{[x:string]:string|number|boolean}|Values) {
		if (typeof into == 'string') { if (!into) { throw new TypeError('INTO was empty string'); } else { this.into = into; } }
		if (new Values(values) instanceof Values) { if (!`${new Values(values)}`) { throw new TypeError('VALUES was empty'); } else { this.values = new Values(values); } }
	}

	toString () {
		if (!`${this?.into || ''}` || !`${this?.values || ''}`) { return ''; }
		return `INSERT INTO ${this?.into || ''} ${this?.values || ''}`;
	}
}
