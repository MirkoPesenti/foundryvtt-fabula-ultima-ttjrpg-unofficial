import { ProgressDataModel } from './common/progress-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} summary.value
 * @property {string} description
 * @property {string} potency.value
 * @property {string} area.value
 * @property {number} ZCost.value
 * @property {number} difficultyLevel.value
 * @property {boolean} hasReduction.value
 * @property {boolean} hasClock.value
 * @property {ProgressDataModel} progress
 */

export class ProjectDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, EmbeddedDataField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			summary: new SchemaField({ value: new StringField() }),
			description: new HTMLField(),
			potency: new SchemaField({ value: new StringField({ initial: 'minor', choices: Object.keys(FU.potencyList) }) }),
			area: new SchemaField({ value: new StringField({ initial: 'individual', choices: Object.keys(FU.areaList) }) }),
			uses: new SchemaField({ value: new StringField({ initial: 'consumable', choices: Object.keys(FU.usesList) }) }),
			hasFlaw: new SchemaField({ value: new BooleanField({ initial: false }) }),
			progress: new EmbeddedDataField(ProgressDataModel, { initial: { current: 0, step: 1, max: 1 } }),
		};
	}

	prepareBaseData() {
		const potencyCost = { minor: 100, medium: 200, major: 400, extreme: 800 };
		const areaCost = { individual: 1, small: 2, large: 3, huge: 4 };
		const usesCost = { consumable: 1, permanent: 5 };
		
		let ZCost = potencyCost[this.potency.value] * areaCost[this.area.value] * usesCost[this.uses.value];
		if ( this.hasFlaw.value ) {
			ZCost = ZCost - ( ZCost / 4 );
		}

		(this.ZCost ??= {}).value = ZCost;
		(this.progress ??= {}).max = ZCost / 100;
	}
}