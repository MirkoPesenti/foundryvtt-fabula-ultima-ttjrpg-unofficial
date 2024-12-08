import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} summary
 * @property {string} description
 */

export class ShieldDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { StringField, HTMLField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			summary: new StringField(),
			description: new HTMLField(),
		};
	}
}