import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { FU } from "../../helpers/config.mjs";

/**
 * @property {string} fabulaID
 * @property {string} sourcebook
 * @property {string} origin
 * @property {string} subtype
 * @property {string} description
 * @property {number} level.current
 * @property {number} level.max
 * @property {string} uses.duration
 * @property {number} uses.spent
 * @property {number} uses.max
 * @property {number} uses.current
 * @property {string} uses.status
 * @property {boolean} test.value
 * @property {string} test.attributes.primary.value
 * @property {string} test.attributes.secondary.value
 * @property {string} test.bonus
 * @property {boolean} ritual.value
 * @property {string} ritual.type
 * @property {string} recovery.hp.formula
 * @property {string} recovery.mp.formula
 * @property {string} recovery.ip.formula
 * @property {boolean} advancement.value
 * @property {string[]} features
 */

export class CLassFeatureDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, HTMLField, NumberField, StringField, BooleanField, EmbeddedDataField, ArrayField } = foundry.data.fields;
		return {
			fabulaID: new StringField(),
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			origin: new StringField({ initial: undefined, blank: true, choices: Object.keys(FU.classes) }),
			subtype: new StringField({ initial: undefined, blank: true, choices: Object.keys(FU.featureSubtype) }),
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
				hasChoice: new BooleanField({ initial: false }),
				attributesSecondary: new EmbeddedDataField(AttributesDataModel, {}),
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
			bonus: new SchemaField({
				temporary: new BooleanField({ initial: true }),
				key: new StringField({ initial: undefined, blank: true }),
				modifier: new StringField({ initial: undefined, blank: true }),
			}),
			advancement: new SchemaField({ 
				value: new BooleanField({ initial: false }),
				min: new NumberField({ initial: 1, min: 1, integer: true, nullable: false }),
			}),
			features: new ArrayField( new StringField() ),
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