import { AttributesDataModel } from './common/attributes-data-model.mjs';
import { DamageDataModel } from './common/damage-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} type.value
 * @property {string} summary.value
 * @property {string} description
 * @property {boolean} isOffensive.value
 * @property {AttributesDataModel} attributes
 * @property {DamageDataModel} damage
 * @property {number} MPCost.value
 * @property {string} target.value
 * @property {number} target.number
 * @property {string} duration.value
 * @property {boolean} opportunity.value
 * @property {string} opportunityEffect
 */

export class SpellDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField, EmbeddedDataField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			type: new SchemaField({ value: new StringField({ initial: 'chimerism', choices: Object.keys(FU.SpellDisciplines) }) }),
			description: new HTMLField(),
			isOffensive: new SchemaField({ value: new BooleanField({ initial: false }) }),
			attributes: new EmbeddedDataField(AttributesDataModel, { initial: { primary: { value: 'ins' }, secondary: { value: 'wlp' } } }),
			damage: new EmbeddedDataField(DamageDataModel, {}),
			MPCost: new SchemaField({ 
				value: new NumberField({ initial: 1, min: 0, integer: true }), 
				upTo: new BooleanField({ initial: false }) 
			}),
			target: new SchemaField({ 
				value: new StringField(), 
				number: new NumberField({ initial: 1, min: 1, integer: true }) 
			}),
			duration: new SchemaField({ value: new StringField({ initial: 'instantaneous', choices: Object.keys(FU.SpellDurations) }) }),
			opportunity: new SchemaField({ value: new BooleanField() }),
			opportunityEffect: new HTMLField(),
		};
	}

	prepareBaseData() {
		const typeAttributes = {
			chimerism: [ 'mig', 'wlp' ],
			elementalism: [ 'ins', 'wlp' ],
			entropism: [ 'ins', 'wlp' ],
			spiritism: [ 'ins', 'wlp' ]
		};

		const attributes = typeAttributes[this.type.value];
		(this.attributes ??= {}).primary.value = attributes[0];
		(this.attributes ??= {}).secondary.value = attributes[1];
	}
}