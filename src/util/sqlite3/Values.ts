export type ValuesOptions = {
	__KEY_PREFIX__?:string;
	__KEY_TO_UPPERCASE__?:boolean;
	__KEY_TO_LOWERCASE__?:boolean;
};
export class Values extends Object {
	private _opts:ValuesOptions = {
		__KEY_PREFIX__: '',
		__KEY_TO_UPPERCASE__: false,
		__KEY_TO_LOWERCASE__: false
	};

	constructor (values?:{
		[x:string]:string|number|boolean,
	}|Values) {
		super();
		Object.assign(this, values);
	}

	get keyPrefix () { return this?._opts?.__KEY_PREFIX__; }
	set keyPrefix (value) { this._opts.__KEY_PREFIX__ = value; }
	get keyToUpperCase () { return this?._opts?.__KEY_TO_UPPERCASE__; }
	set keyToUpperCase (value) {
		this._opts.__KEY_TO_UPPERCASE__ = value;
		if (this._opts.__KEY_TO_LOWERCASE__ && value) { this._opts.__KEY_TO_LOWERCASE__ = !(this._opts.__KEY_TO_UPPERCASE__); }
	}

	get keyToLowerCase () { return this?._opts?.__KEY_TO_LOWERCASE__; }
	set keyToLowerCase (value) {
		this._opts.__KEY_TO_LOWERCASE__ = value;
		if (this._opts.__KEY_TO_UPPERCASE__ && value) { this._opts.__KEY_TO_UPPERCASE__ = !(this._opts.__KEY_TO_LOWERCASE__); }
	}

	entries () {
		const _ = Object.entries(this)
			.filter(([k, v]) => (
				typeof k != 'undefined' &&
				typeof v != 'undefined' &&
				typeof v != 'object' &&
				(typeof v != 'string' || v?.length)
			)
			);
		return _;
	}

	keys () {
		const _ = this.entries();
		const keys = _.map(([k, v]) => (k));
		return keys;
	}

	values () {
		const _ = this.entries();
		const values = _.map(([k, v]) => (v));
		return values;
	}

	setOptions (_opts:ValuesOptions) {
		Object.assign(this._opts, JSON.parse(JSON.stringify(_opts)));
	}

	clear () {
		this.entries().forEach(([k, v]) => {
			delete this[k];
		});
	}

	apply () {
		const _ = this.entries();
		if (!_.length) { this.clear(); }
		const __ = _.forEach(([k, v]) => {
			delete this[k];
			let _k = `${this.keyPrefix}${k}`;
			if (this.keyToLowerCase) { _k = _k.toLowerCase(); }
			if (this.keyToUpperCase) { _k = _k.toUpperCase(); }
			this[_k] = v;
		});
	}

	clone () {
		const _ = this.entries();
		const __ = Object.fromEntries(_);
		const ___ = new Values(__);
		___.setOptions(this._opts);
		return ___;
	}

	filter (fn:(entry, index, array)=>boolean) {
		const _ = this.entries();
		const _f = {};
		_.forEach((entry, index, array) => {
			if (fn(entry, index, array)) {
				_f[entry[0]] = entry[1];
			}
		});
		return Object.assign(new Values(_f), { _opts: new Object(this._opts) });
	}

	get length () { return this.entries().length; }

	forEach (fn:((entry, index, array)=>void)) {
		const _ = this.entries();
		return _.forEach(fn);
	}

	find (key?:RegExp) {
		return this.filter(([k, v]) => (k.match(key)));
	}

	toObject () {
		const _ = this.entries();
		if (!_.length) { return new Values(Object.fromEntries(_)); }
		return new Values(Object.fromEntries(_));
	}

	toString () {
		const _c = this.clone();
		_c.apply();
		const _ = _c.entries();
		if (!_.length) { return ''; }
		const keys = _c.keys();
		const values = _c.values().map((v) => (typeof v == 'boolean' ? Number(v) : v));
		const __ = `( ${keys.join(',')} ) VALUES ( ${values.join(',')} )`;
		return __ || '';
	}
}
