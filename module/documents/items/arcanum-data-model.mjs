import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {string} domain
 * @property {string} merge
 * @property {string[]} dismiss.name
 * @property {string[]} dismiss.effect
 */

export class ArcanumDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { StringField, HTMLField, ArrayField, SchemaField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			domain: new StringField({ initial: '' }),
			merge: new HTMLField(),
			dismiss: new ArrayField(new SchemaField({
				name: new StringField({ initial: '' }),
				effect: new HTMLField(),
			})),
		};
	}
}