import { DamageDataModel } from './common/damage-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} type
 * @property {string} description
 * @property {number} IPCost
 */

export class ConsumableDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { StringField, HTMLField, NumberField, EmbeddedDataField, SchemaField, BooleanField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			type: new StringField({ initial: 'potion', choices: Object.keys(FU.consumableType) }),
			description: new HTMLField(),
			IPCost: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }),
			damage: new EmbeddedDataField(DamageDataModel, {}),
			recover: new SchemaField({
				hasRecover: new BooleanField({ initial: false }),
				recoverValue: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				recoverResource: new StringField({ initial: 'hp', choices: Object.keys(FU.recoverResources) }),
			}),
			status: new SchemaField({
				hasRecover: new BooleanField({ initial: false }),
				value: new StringField({ initial: '', blank: true, choices: Object.keys(FU.statusses) }),
			}),
			rest: new BooleanField({ initial: false }),
		};
	}
}