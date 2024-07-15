import { ItemAttributesDataModel } from './common/item-attributes-data-model.mjs';
import { DamageDataModel } from './common/damage-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} type.value
 * @property {string} summary.value
 * @property {string} description
 * @property {boolean} isOffensive
 * @property {ItemAttributesDataModel} attributes
 * @property {DamageDataModel} damage
 * @property {number} MPCost.value
 * @property {string} target.value
 * @property {number} target.MPCost
 * @property {number} target.number
 * @property {string} duration.value
 * @property {boolean} opportunity.value
 * @property {string} opportunityEffect
 * @property {boolean} isFavorite.value
 */

export class SpellDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField, EmbeddedDataField } = foundry.data.fields;
		return {
			type: new SchemaField({ value: new StringField({ initial: 'chimerism', choices: Object.keys(FU.SpellDisciplines) }) }),
			summary: new SchemaField({ value: new StringField() }),
			description: new HTMLField(),
			isOffensive: new SchemaField({ value: new BooleanField() }),
			attributes: new EmbeddedDataField(ItemAttributesDataModel, { initial: { primary: { value: 'ins' }, secondary: { value: 'wlp' } } }),
			damage: new EmbeddedDataField(DamageDataModel, {}),
			target: new SchemaField({ value: new StringField(), MPCost: new NumberField({ initial: 1, min: 0, integer: true }), number: new NumberField({ initial: 1, min: 1, integer: true }) }),
			duration: new SchemaField({ value: new StringField({ initial: 'instantaneous', choices: Object.keys(FU.SpellDurations) }) }),
			opportunity: new SchemaField({ value: new BooleanField() }),
			opportunityEffect: new HTMLField(),
			isFavorite: new SchemaField({ value: new BooleanField() }),
		};
	}

	prepareBaseData() {
		const MPCost = this.target.MPCost * this.target.number;
		(this.MPCost ??= {}).value = MPCost;

		const typeAttributes = {
			chimerism: [ 'mig', 'wlp' ],
			elementalism: [ 'ins', 'wlp' ],
			entropism: [ 'ins', 'wlp' ],
			spiritism: [ 'ins', 'wlp' ]
		};

		const attributes = typeAttributes[this.type.value];
		(this.attributes ??= {}).primary = attributes[0];
		(this.attributes ??= {}).secondary = attributes[1];
	}
}