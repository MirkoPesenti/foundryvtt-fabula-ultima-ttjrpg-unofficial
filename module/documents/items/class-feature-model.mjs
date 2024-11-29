import { FU } from "../../helpers/config.mjs";

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {number} level.current
 * @property {number} level.max
 */

export class CLassFeatureDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, HTMLField, NumberField, StringField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			origin: new StringField({ initial: '' }),
			description: new HTMLField(),
			level: new SchemaField({ 
				current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false, }),
				max: new NumberField({ initial: 1, min: 1, integer: true, nullable: false, }),
			}),
		};
	}
}