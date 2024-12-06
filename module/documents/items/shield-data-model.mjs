import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} summary
 * @property {boolean} isMartial.value
 * @property {string} description
 * @property {string} rarity
 * @property {number} cost
 * @property {number} defenseBonus
 * @property {number} initiativeMalus
 */

export class ShieldDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			summary: new StringField({ initial: 'Nessuna Qualità.' }),
			isEquipped: new BooleanField({ initial: false }),
			isMartial: new SchemaField({ value: new BooleanField() }),
			description: new HTMLField(),
			rarity: new StringField({ initial: 'base', choices: Object.keys(FU.rarityList) }),
			cost: new NumberField({ initial: 1, min: 0, integer: true }),
			defenseBonus: new NumberField({ initial: 1, min: 0, integer: true, nullable: true }),
			magicDefenseBonus: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
		};
	}
}