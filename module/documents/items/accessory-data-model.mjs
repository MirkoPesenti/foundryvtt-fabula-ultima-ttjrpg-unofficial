import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} description
 * @property {string} summary
 * @property {string} rarity.value
 * @property {number} cost.value
 */

export class AccessoryDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, NumberField } = foundry.data.fields;
		return {
			summary: new SchemaField({ value: new StringField() }),
			description: new HTMLField(),
			rarity: new SchemaField({ value: new StringField({ initial: 'base', choices: Object.keys(FU.rarityList) }) }),
			cost: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true }) }),
		};
	}
}