import { PrecisionDataModel } from './common/precision-data-model.mjs';
import { DamageDataModel } from './common/damage-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {string} range
 * @property {number} precisionBonus
 */

export class AttackDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, NumberField, EmbeddedDataField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			range: new StringField({ initial: 'melee', choices: Object.keys(FU.WeaponRanges) }),
			precisionAttr: new EmbeddedDataField(PrecisionDataModel, {}),
			precisionBonus: new NumberField({ initial: 0, nullable: true }),
			damage: new EmbeddedDataField(DamageDataModel, {}),
		};
	}
}