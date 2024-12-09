import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { DefencesDataModel } from "./common/defences-data-model.mjs";
import { AffinitiesDataModel } from "./common/affinities-data-model.mjs";
import { DamageDataModel } from "../items/common/damage-data-model.mjs";
import { FU } from '../../helpers/config.mjs';

/**
 * 
 */
export class NpcDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, EmbeddedDataField, ArrayField, HTMLField, BooleanField, NumberField } = foundry.data.fields;
		return {
			description: new HTMLField(),
			traits: new StringField(),
			level: new NumberField({ initial: 5, min: 5, max: 60, integer: true, nullable: false }),
			species: new StringField({ initial: 'humanoid', choices: Object.keys(FU.species) }),
			isVillain: new BooleanField({ initial: false }),
			villainType: new StringField({ initial: '', blank: true, choices: Object.keys(FU.villainTypes) }),
			enemyRank: new StringField({ initial: '', blank: true, choices: Object.keys(FU.enemyRanks) }),
			resources: new SchemaField({
				hp: new SchemaField({ current: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }) }),
				mp: new SchemaField({ current: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }) }),
				attributes: new EmbeddedDataField(AttributesDataModel, {}),
				up: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				params: new EmbeddedDataField(DefencesDataModel, {}),
			}),
			affinity: new EmbeddedDataField(AffinitiesDataModel, {}),
			attacks: new ArrayField(new SchemaField({
				name: new StringField(),
				description: new HTMLField(),
				range: new StringField({ initial: 'melee', choices: Object.keys(FU.WeaponRanges) }),
				precisionAttr: new EmbeddedDataField(AttributesDataModel, {}),
				precisionBonus: new NumberField({ initial: 0, nullable: true }),
				damage: new EmbeddedDataField(DamageDataModel, {}),
			})),
			otherActions: new ArrayField(new SchemaField({
				name: new StringField(),
				description: new HTMLField(),
			})),
			specialRules: new ArrayField(new SchemaField({
				name: new StringField(),
				description: new HTMLField(),
			})),
		};
	}

	prepareBaseData() {

		// Generate Max HP and MP
		Object.defineProperty(this.resources.hp, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				const baseAttr = Object.keys(FU.attributes).includes(this.attribute) ? data.resources.attributes[this.attribute].value : data.resources.attributes.ins.value;
				return baseAttr * 5  + data.level.value + freeBenefits.hp;
			},
			set( newVal ) {
				delete this.max;
				this.max = newVal;
			},
		});
		this.resources.hp.crisis = Math.floor( this.resources.hp.max / 2 );
		Object.defineProperty(this.resources.mp, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				const baseAttr = Object.keys(FU.attributes).includes(this.attribute) ? data.resources.attributes[this.attribute].value : data.resources.attributes.wlp.value;
				return baseAttr * 5  + data.level.value + freeBenefits.mp;
			},
			set( newVal ) {
				delete this.max;
				this.max = newVal;
			},
		});

	}
}