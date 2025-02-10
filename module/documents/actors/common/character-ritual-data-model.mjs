/**
 * @property {string} armor
 * @property {string} mainHand
 * @property {string} offHand
 * @property {string} accessory
 * @property {string} phantom
 * @property {string} arcanum
 */
export class CharacterRitualDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { BooleanField } = foundry.data.fields;
		return {
			arcanism: new BooleanField({ initial: false }),
			chimerism: new BooleanField({ initial: false }),
			elementalism: new BooleanField({ initial: false }),
			entropism: new BooleanField({ initial: false }),
			ritualism: new BooleanField({ initial: false }),
			spiritism: new BooleanField({ initial: false }),
		};
	}
}
