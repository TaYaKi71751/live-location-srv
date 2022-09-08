import { Values } from './Values';
export class Insert {
	into:string = '';
	values:Values = new Values();
	constructor (into?:string, values?:{[x:string]:string|number|boolean|undefined}|Values) {
		this.into = into || '';
		this.values = new Values(values);
	}

	toString () {
		try {
			if (!`${this.values}`) { throw new TypeError('VALUES was empty'); }
			if (!this.into) { throw new TypeError('INTO was empty string'); }
			return `INSERT INTO ${this?.into || ''} ${this?.values || ''}`;
		} catch (e) { return ''; }
	}
}
