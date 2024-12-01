import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 */

export class RuleDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, ArrayField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
		};
	}
}