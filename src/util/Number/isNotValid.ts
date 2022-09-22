export function isNotValid (value:`${number}`|number) {
	switch (true) {
	case typeof value == 'undefined':
	case value === null:
	case `${value}`.replaceAll(/[^-|.|0-9]/g, '') !== `${value}`:
		return true;
	default: return false;
	}
}
