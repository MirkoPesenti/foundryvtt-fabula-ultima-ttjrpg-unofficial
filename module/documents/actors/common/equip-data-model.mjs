/**
 * @property {string} armor
 * @property {string} mainHand
 * @property {string} offHand
 * @property {string} accessory
 * @property {string} phantom
 * @property {string} arcanum
 */
export class EquipDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { StringField } = foundry.data.fields;
		return {
			armor: new StringField({ initial: null, nullable: true }),
			mainHand: new StringField({ initial: null, nullable: true }),
			offHand: new StringField({ initial: null, nullable: true }),
			accessory: new StringField({ initial: null, nullable: true }),
			arcanum: new StringField({ initial: null, nullable: true }),
		};
	}

	isEquipped(item) {
		return item && Object.values(this).includes(item?.id);
	}
}
