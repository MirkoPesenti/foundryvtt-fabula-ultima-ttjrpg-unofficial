import { FU } from "../../helpers/config.mjs";

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {boolean} isUnlimited
 * @property {boolean} isFree
 * @property {number} level.current
 * @property {number} level.max
 */

export class CLassFeatureDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, HTMLField, NumberField, StringField, BooleanField } = foundry.data.fields;
		return {
			fabulaID: new StringField(),
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			subtype: new StringField({ initial: undefined, blank: true, choices: Object.keys(FU.featureSubtype) }),
			origin: new StringField({ initial: undefined, blank: true, choices: Object.keys(FU.classes) }),
			description: new HTMLField(),
			level: new SchemaField({ 
				current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false, }),
				max: new NumberField({ initial: undefined, min: 0, nullable: true, }),
			}),
		};
	}

	transferEffects() {
		return this.data?.transferEffects instanceof Function ? this.data?.transferEffects() : true;
	}
}