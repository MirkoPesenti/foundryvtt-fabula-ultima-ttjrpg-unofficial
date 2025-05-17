import { FU } from '../../../helpers/config.mjs';

/**
 * @property {boolean} hasDamage.value
 * @property {string} type.value
 * @property {number} value
 */

export class DamageDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { SchemaField, StringField, BooleanField, NumberField } = foundry.data.fields;
		return {
			hasDamage: new BooleanField({ initial: true }),
			type: new SchemaField({ value: new StringField({ initial: 'physical', blank: true, choices: Object.keys(FU.DamageTypes) }) }),
			value: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
			levelBonus: new SchemaField({
				first: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
				second: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
			}),
		};
	}
}