/**
 * @property {boolean} active
 * @property {boolean} immunity
 */
export class StatusDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { BooleanField } = foundry.data.fields;
		return ({
			active: new BooleanField({ initial: false }),
			immunity: new BooleanField({ initial: false }),
		});
	}
}