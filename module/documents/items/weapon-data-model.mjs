import { AttributesDataModel } from './common/attributes-data-model.mjs';
import { DamageDataModel } from './common/damage-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} summary
 * @property {boolean} isMartial.value
 * @property {string} description
 * @property {string} rarity.value
 * @property {string} type.value
 * @property {number} cost.value
 * @property {boolean} needTwoHands.value
 * @property {string} range.value
 * @property {AttributesDataModel} precisionAttributes
 * @property {number} precisionBonus.value
 * @property {DamageDataModel} damage
 */

export class WeaponDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField, EmbeddedDataField } = foundry.data.fields;
		return {
			summary: new SchemaField({ value: new StringField() }),
			isMartial: new SchemaField({ value: new BooleanField() }),
			description: new HTMLField(),
			rarity: new SchemaField({ value: new StringField({ initial: 'base', choices: Object.keys(FU.rarityList) }) }),
			type: new SchemaField({ value: new StringField({ initial: 'sword', choices: Object.keys(FU.weaponCategories) }) }),
			cost: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true }) }),
			needTwoHands: new SchemaField({ value: new BooleanField }),
			range: new SchemaField({ value: new StringField({ initial: 'melee', choices: Object.keys(FU.WeaponRanges) }) }),
			precisionAttributes: new EmbeddedDataField(AttributesDataModel, { initial: { primary: { value: 'dex' }, secondary: { value: 'ins' } } }),
			precisionBonus: new SchemaField({ value: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }) }),
			damage: new EmbeddedDataField(DamageDataModel, {}),
		};
	}
}