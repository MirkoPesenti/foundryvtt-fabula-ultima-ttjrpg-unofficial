/**
 * @property {boolean} vulnerability
 * @property {boolean} resistance
 * @property {boolean} immunity
 * @property {boolean} absorption
 */
export class AffinityDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { BooleanField } = foundry.data.fields;
		return ({
			vulnerability: new BooleanField(),
			resistance: new BooleanField(),
			immunity: new BooleanField(),
			absorption: new BooleanField(),
		});
	}
}