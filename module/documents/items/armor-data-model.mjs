import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {boolean} isEquipped
 * @property {boolean} isMartial.value
 * @property {string} description
 * @property {string} rarity
 * @property {number} cost
 * @property {boolean} defBonus.def.isFixed
 * @property {number} defBonus.def.value
 * @property {boolean} defBonus.mdef.isFixed
 * @property {number} defBonus.mdef.value
 * @property {number} initiativeMalus
 */

export class ArmorDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			isEquipped: new BooleanField({ initial: false }),
			isMartial: new SchemaField({ value: new BooleanField() }),
			rarity: new StringField({ initial: 'base', choices: Object.keys(FU.rarityList) }),
			cost: new NumberField({ initial: 1, min: 0, integer: true }),
			defBonus: new SchemaField({ 
				def: new SchemaField({
					isFixed: new BooleanField({ initial: false }),
					value: new NumberField({ initial: 0, min: 0, integer: true }),
				}),
				mdef: new SchemaField({
					isFixed: new BooleanField({ initial: false }),
					value: new NumberField({ initial: 0, min: 0, integer: true }),
				}),
			}),
			initiativeMalus: new NumberField({ initial: 0, integer: true }),
		};
	}

	transferEffects() {
		return this.parent.isEquipped;
	}
}