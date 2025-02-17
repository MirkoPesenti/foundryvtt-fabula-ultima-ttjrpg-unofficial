import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
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
			identifier: new StringField(),
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			isEquipped: new BooleanField({ initial: false }),
			isMartial: new SchemaField({ value: new BooleanField() }),
			rarity: new StringField({ initial: 'base', choices: Object.keys(FU.rarityList) }),
			cost: new NumberField({ initial: 1, min: 0, integer: true }),
			defenseBonus: new NumberField({ initial: 1, min: 0, integer: true, nullable: true }),
			magicDefenseBonus: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
		};
	}

	transferEffects() {
		return this.parent.isEquipped;
	}
}