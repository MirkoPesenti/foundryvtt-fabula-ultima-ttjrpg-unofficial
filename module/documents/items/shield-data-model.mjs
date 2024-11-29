import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} summary.value
 * @property {boolean} isMartial.value
 * @property {string} description
 * @property {string} rarity.value
 * @property {number} cost.value
 * @property {boolean} isDefenseFixed.value
 * @property {number} defenseBonusFixed.value
 * @property {number} defenseBonus.value
 * @property {number} initiativeMalus.value
 */

export class ShieldDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			summary: new SchemaField({ value: new StringField() }),
			isMartial: new SchemaField({ value: new BooleanField() }),
			description: new HTMLField(),
			rarity: new SchemaField({ value: new StringField({ initial: 'base', choices: Object.keys(FU.rarityList) }) }),
			cost: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true }) }),
			defenseBonus: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true, nullable: true }) }),
			magicDefenseBonus: new SchemaField({ value: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }) }),
		};
	}
}