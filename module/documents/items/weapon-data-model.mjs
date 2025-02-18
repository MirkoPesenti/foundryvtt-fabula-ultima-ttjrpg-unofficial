import { AttributesDataModel } from './common/attributes-data-model.mjs';
import { DamageDataModel } from './common/damage-data-model.mjs';
import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {boolean} isMartial.value
 * @property {string} rarity
 * @property {string} type
 * @property {number} cost
 * @property {boolean} needTwoHands
 * @property {string} range
 * @property {AttributesDataModel} precisionAttributes
 * @property {number} precisionBonus
 * @property {DamageDataModel} damage
 */

export class WeaponDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField, EmbeddedDataField } = foundry.data.fields;
		return {
			fabulaID: new StringField(),
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			isMartial: new SchemaField({ value: new BooleanField() }),
			isEquipped: new BooleanField({ initial: false }),
			rarity: new StringField({ initial: 'base', choices: Object.keys(FU.rarityList) }),
			type: new StringField({ initial: 'sword', choices: Object.keys(FU.weaponCategories) }),
			cost: new NumberField({ initial: 1, min: 0, integer: true }),
			needTwoHands: new BooleanField({ initial: false }),
			range: new StringField({ initial: 'melee', choices: Object.keys(FU.WeaponRanges) }),
			precisionAttributes: new EmbeddedDataField(AttributesDataModel, { initial: { primary: { value: 'dex' }, secondary: { value: 'ins' } } }),
			precisionBonus: new NumberField({ initial: 0, nullable: true }),
			damage: new EmbeddedDataField(DamageDataModel, {}),
		};
	}

	transferEffects() {
		return this.parent.isEquipped;
	}
}