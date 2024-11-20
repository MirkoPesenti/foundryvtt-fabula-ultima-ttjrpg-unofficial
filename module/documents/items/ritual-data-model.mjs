import { AttributesDataModel } from './common/attributes-data-model.mjs';
import { ProgressDataModel } from './common/progress-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} type.value
 * @property {string} summary
 * @property {string} description
 * @property {AttributesDataModel} attributes
 * @property {string} potency.value
 * @property {string} area.value
 * @property {number} MPCost.value
 * @property {number} difficultyLevel.value
 * @property {boolean} hasReduction.value
 * @property {boolean} hasClock.value
 * @property {ProgressDataModel} progress
 * @property {string} isFavorite.value
 */

export class RitualDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField, EmbeddedDataField } = foundry.data.fields;
		return {
			type: new SchemaField({ value: new StringField({ initial: 'arcanism', choices: Object.keys(FU.MagicDisciplines) }) }),
			summary: new SchemaField({ value: new StringField() }),
			description: new HTMLField(),
			attributes: new EmbeddedDataField(AttributesDataModel, { initial: { primary: { value: 'ins' }, secondary: { value: 'wlp' } } }),
			potency: new SchemaField({ value: new StringField({ initial: 'minor', choices: Object.keys(FU.potencyList) }) }),
			area: new SchemaField({ value: new StringField({ initial: 'individual', choices: Object.keys(FU.areaList) }) }),
			hasReduction: new SchemaField({ value: new BooleanField({ initial: false }) }),
			hasClock: new SchemaField({ value: new BooleanField() }),
			progress: new EmbeddedDataField(ProgressDataModel, { initial: { current: 0, step: 1, max: 4 } }),
			isFavorite: new SchemaField({ value: new BooleanField() }),
		};
	}

	prepareBaseData() {
		const potencyCost = { minor: 20, medium: 30, major: 40, extreme: 50 };
		const areaCost = { individual: 1, small: 2, large: 3, huge: 4 };
		const potencyDifficulty = { minor: 7, medium: 10, major: 13, extreme: 16 };
		const potencyClock = { minor: 4, medium: 6, major: 6, extreme: 8 };

		let MPCost = potencyCost[this.potency.value] * areaCost[this.area.value];
		if ( this.hasReduction.value ) {
			MPCost = MPCost / 2;
		}
		const difficultyLevel = potencyDifficulty[this.potency.value];
		const clock = potencyClock[this.potency.value];

		(this.MPCost ??= {}).value = MPCost;
		(this.difficultyLevel ??= {}).value = difficultyLevel;
		(this.progress ??= {}).max = clock;

		const typeAttributes = { 
			arcanism: [ 'wlp', 'wlp' ],
			chimerism: [ 'mig', 'wlp' ],
			elementalism: [ 'ins', 'wlp' ],
			entropism: [ 'ins', 'wlp' ],
			ritualism: [ 'ins', 'wlp' ],
			spiritism: [ 'ins', 'wlp' ]
		};

		const attributes = typeAttributes[this.type.value];
		(this.attributes ??= {}).primary = attributes[0];
		(this.attributes ??= {}).secondary = attributes[1];
	}
}