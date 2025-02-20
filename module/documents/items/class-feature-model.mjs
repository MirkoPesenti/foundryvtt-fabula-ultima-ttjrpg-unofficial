import { AttributesDataModel } from "./common/attributes-data-model.mjs";
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
		const { SchemaField, HTMLField, NumberField, StringField, BooleanField, EmbeddedDataField } = foundry.data.fields;
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
			uses: new SchemaField({
				duration: new StringField({ initial: '' }),
				spent: new NumberField({ initial: 0, min: 0, integer: true, nullable: false, }),
				max: new NumberField({ initial: undefined,  min: 0, nullable: true, }),
				status: new StringField({ initial: undefined, blank: true, choices: Object.keys(FU.statusEffects) }),
			}),
			test: new SchemaField({
				value: new BooleanField({ initial: false }),
				attributes: new EmbeddedDataField(AttributesDataModel, {}),
				bonus: new StringField({ initial: undefined, blank: true, }),
			}),
			ritual: new SchemaField({
				value: new BooleanField({ initial: false }),
				type: new StringField({ initial: undefined, blank: true, choices: Object.keys(FU.MagicDisciplines) }),
			}),
			recovery: new SchemaField({
				hp: new SchemaField({ formula: new StringField({ initial: '' }) }),
				mp: new SchemaField({ formula: new StringField({ initial: '' }) }),
				ip: new SchemaField({ formula: new StringField({ initial: '' }) }),
			}),
		};
	}

	transferEffects() {
		return this.data?.transferEffects instanceof Function ? this.data?.transferEffects() : true;
	}

	prepareBaseData() {
		let current = 0;
		if ( typeof this.uses.max === 'number' && this.uses.max > 0 ) {
			current = this.uses.max - this.uses.spent;
			this.uses.current = current;
		}
	}
}