/**
 * @property {number} value
 */
export class AttributeDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { NumberField } = foundry.data.fields;
		return ({
			value: new NumberField({ initial: 8, min: 6, max: 12, integer: true, nullable: false }),
		});
	}
}