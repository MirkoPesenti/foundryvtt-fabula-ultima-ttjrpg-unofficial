import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {boolean} itemList.active
 * @property {string} itemList.list
 * @property {string} itemList.title
 */

export class RuleDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			itemList: new SchemaField({
				active: new BooleanField({ initial: false }),
				title: new StringField(),
				list: new StringField({ initial: '', blank: true, choices: Object.keys(FU.ItemTypes) }),
			}),
		};
	}
}