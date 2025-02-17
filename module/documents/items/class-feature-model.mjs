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
			identifier: new StringField(),
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			origin: new StringField({ initial: '' }),
			description: new HTMLField(),
			isUnlimited: new BooleanField({ initial: false }),
			isFree: new BooleanField({ initial: false }),
			level: new SchemaField({ 
				current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false, }),
				max: new NumberField({ initial: 1, min: 1, integer: true, nullable: false, }),
			}),
		};
	}

	transferEffects() {
		return this.data?.transferEffects instanceof Function ? this.data?.transferEffects() : true;
	}
}