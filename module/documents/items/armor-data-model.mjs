import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} summary
 * @property {boolean} isMartial.value
 * @property {string} description
 * @property {string} rarity
 * @property {number} cost
 * @property {boolean} defBonus.def.isFixes
 * @property {number} defBonus.def.value
 * @property {boolean} defBonus.mdef.isFixes
 * @property {number} defBonus.mdef.value
 * @property {number} initiativeMalus
 */

export class ArmorDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			summary: new StringField({ initial: 'Nessuna Qualità.' }),
			isMartial: new SchemaField({ value: new BooleanField() }),
			description: new HTMLField(),
			rarity: new StringField({ initial: 'base', choices: Object.keys(FU.rarityList) }),
			cost: new NumberField({ initial: 1, min: 0, integer: true }),
			defBonus: new SchemaField({ 
				def: new SchemaField({
					isFixed: new BooleanField({ initial: false }),
					value: new NumberField({ initial: 1, min: 0, integer: true }),
				}),
				mdef: new SchemaField({
					isFixed: new BooleanField({ initial: false }),
					value: new NumberField({ initial: 0, min: 0, integer: true }),
				}),
			}),
			initiativeMalus: new NumberField({ initial: 0, min: 0, integer: true }),
		};
	}
}