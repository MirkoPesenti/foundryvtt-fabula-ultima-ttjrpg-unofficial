/**
 * @property {string} armor
 * @property {string} mainHand
 * @property {string} offHand
 * @property {string} accessory
 * @property {string} phantom
 * @property {string} arcanum
 */
export class MartialDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { BooleanField } = foundry.data.fields;
		return {
			melee: new BooleanField({ initial: false }),
			ranged: new BooleanField({ initial: false }),
			shield: new BooleanField({ initial: false }),
			armor: new BooleanField({ initial: false }),
		};
	}
}
