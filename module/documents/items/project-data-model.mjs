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
 */

export class ProjectDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			potency: new SchemaField({ value: new StringField({ initial: 'minor', choices: Object.keys(FU.potencyList) }) }),
			area: new SchemaField({ value: new StringField({ initial: 'individual', choices: Object.keys(FU.areaList) }) }),
			uses: new SchemaField({ value: new StringField({ initial: 'consumable', choices: Object.keys(FU.usesList) }) }),
			flaw: new SchemaField({ active: new BooleanField({ initial: false }), }),
			progress: new SchemaField({
				current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				step: new NumberField({ initial: 1, min: 1, integer: true, nullable: false }),
				max: new NumberField({ initial: 6, min: 0, integer: true, nullable: false }),
			}),
		};
	}

	prepareBaseData() {
		const potencyCost = { minor: 100, medium: 200, major: 400, extreme: 800 };
		const areaCost = { individual: 1, small: 2, large: 3, huge: 4 };
		const usesCost = { consumable: 1, permanent: 5 };
		
		let ZCost = potencyCost[this.potency.value] * areaCost[this.area.value] * usesCost[this.uses.value];
		if ( this.flaw.active ) {
			ZCost = ZCost - Math.floor( ZCost / 4 );
		}

		(this.ZCost ??= {}).value = ZCost;
		(this.progress ??= {}).max = Math.floor( ZCost / 100 );
	}
}