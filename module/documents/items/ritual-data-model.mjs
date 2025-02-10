import { AttributesDataModel } from './common/attributes-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
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
 */

export class RitualDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, EmbeddedDataField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			type: new StringField({ initial: 'arcanism', choices: Object.keys(FU.MagicDisciplines) }),
			description: new HTMLField(),
			attributes: new EmbeddedDataField(AttributesDataModel, { initial: { primary: { value: 'ins' }, secondary: { value: 'wlp' } } }),
			potency: new SchemaField({ value: new StringField({ initial: 'minor', choices: Object.keys(FU.potencyList) }) }),
			area: new SchemaField({ value: new StringField({ initial: 'individual', choices: Object.keys(FU.areaList) }) }),
			reduction: new SchemaField({ 
				active: new BooleanField({ initial: false }),
			}),
			clock: new SchemaField({
				active: new BooleanField({ initial: false }),
				id: new StringField({ initial: '' }),
			}),
		};
	}

	prepareBaseData() {
		const potencyCost = { minor: 20, medium: 30, major: 40, extreme: 50 };
		const areaCost = { individual: 1, small: 2, large: 3, huge: 4 };
		const potencyDifficulty = { minor: 7, medium: 10, major: 13, extreme: 16 };
		const potencyClock = { minor: 4, medium: 6, major: 6, extreme: 8 };

		let MPCost = potencyCost[this.potency.value] * areaCost[this.area.value];
		if ( this.reduction.active ) {
			MPCost = Math.floor( MPCost / 2 );
		}
		const difficultyLevel = potencyDifficulty[this.potency.value];
		const steps = potencyClock[this.potency.value];

		(this.MPCost ??= {}).value = MPCost;
		(this.difficultyLevel ??= {}).value = difficultyLevel;
		this.clock.steps = steps;

		const typeAttributes = { 
			arcanism: [ 'wlp', 'wlp' ],
			chimerism: [ 'ins', 'wlp' ],
			elementalism: [ 'ins', 'wlp' ],
			entropism: [ 'ins', 'wlp' ],
			ritualism: [ 'ins', 'wlp' ],
			spiritism: [ 'ins', 'wlp' ]
		};

		const attributes = typeAttributes[this.type];
		if ( this.type != 'chimerism' ) {
			(this.attributes ??= {}).primary.value = attributes[0];
		}
		(this.attributes ??= {}).secondary.value = attributes[1];
	}
}