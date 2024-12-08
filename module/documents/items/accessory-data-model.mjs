import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {string} rarity
 * @property {number} cost
 */

export class AccessoryDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, NumberField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			rarity: new StringField({ initial: 'rare', choices: Object.keys(FU.rarityList) }),
			cost: new NumberField({ initial: 1, min: 0, integer: true }),
		};
	}
}