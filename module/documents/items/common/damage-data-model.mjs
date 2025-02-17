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
			hasDamage: new SchemaField({ value: new BooleanField() }),
			type: new SchemaField({ value: new StringField({ initial: 'physical', blank: true, choices: Object.keys(FU.DamageTypes) }) }),
			value: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
		};
	}
}