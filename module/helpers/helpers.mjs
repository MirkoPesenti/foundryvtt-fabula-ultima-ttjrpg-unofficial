export function checkParams( params ) {
	const values = Object.values(params);
	values.sort((a, b) => a - b);
	const combinations = [
		[8, 8, 8, 8],
		[10, 8, 8, 6],
		[10, 10, 6, 6]
	];

	function getFrequency(arr) {
		return arr.reduce((acc, val) => {
			acc[val] = ( acc[val] || 0 ) + 1;
			return acc;
		}, {});
	}

	const inputFrequency = getFrequency( values );

	return combinations.some((combo) => {
		const comboFrequency = getFrequency(combo);
		return Object.keys(comboFrequency).every(
			key => comboFrequency[key] === inputFrequency[key]
		);
	});
}