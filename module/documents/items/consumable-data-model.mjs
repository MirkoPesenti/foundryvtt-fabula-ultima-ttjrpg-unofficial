import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} type
 * @property {string} description
 * @property {number} IPCost
 */

export class ConsumableDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { StringField, HTMLField, NumberField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			type: new StringField({ initial: 'potion', choices: Object.keys(FU.consumableType) }),
			description: new HTMLField(),
			IPCost: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }),
		};
	}
}