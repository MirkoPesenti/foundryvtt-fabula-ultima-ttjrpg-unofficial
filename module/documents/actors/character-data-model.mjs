import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { DefencesDataModel } from "./common/defences-data-model.mjs";
import { BondDataModel } from "./common/bond-data-model.mjs";
import { AffinitiesDataModel } from "./common/affinities-data-model.mjs";
import { StatusesDataModel } from "./common/statuses-data-model.mjs";
import { EquipDataModel } from "./common/equip-data-model.mjs";
import { FU } from "../../helpers/config.mjs";

/**
 * @property {number} level.value
 * @property {number} resources.hp.value
 * @property {number} resources.mp.value
 * @property {number} resources.ip.value
 * @property {AttributesDataModel} resources.attributes
 * @property {number} resources.fp
 * @property {number} resources.exp
 * @property {DefencesDataModel} resources.params
 * @property {number} resources.zenit
 * @property {BondDataModel[]} bond
 * @property {string} features.pronouns.value
 * @property {string} features.identity.value
 * @property {string} features.theme.value
 * @property {string} features.origin.value
 * @property {AffinitiesDataModel} affinity
 * @property {StatusesDataModel} status
 * @property {EquipDataModel} equip
 */
export class CharacterDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, EmbeddedDataField, ArrayField, NumberField } = foundry.data.fields;
		return {
			level: new SchemaField({ value: new NumberField({ initial: 5, min: 5, max: 50, integer: true, nullable: false }) }),
			resources: new SchemaField({
				hp: new SchemaField({ current: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }) }),
				mp: new SchemaField({ current: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }) }),
				ip: new SchemaField({ current: new NumberField({ initial: 6, min: 0, max: 6, integer: true, nullable: false }) }),
				attributes: new EmbeddedDataField(AttributesDataModel, {}),
				fp: new NumberField({ initial: 3, min: 0, integer: true, nullable: false }),
				exp: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				params: new EmbeddedDataField(DefencesDataModel, {}),
				zenit: new NumberField({ initial: 500, min: 0, integer: true, nullable: false }),
			}),
			bond: new ArrayField(new EmbeddedDataField(BondDataModel, {}), {
				validate: ( val ) => {
					if ( val.length > 3 )
						val.splice(3);
				}
			}),
			features: new SchemaField({
				pronouns: new StringField(),
				identity: new StringField(),
				theme: new StringField(),
				origin: new StringField(),
			}),
			affinity: new EmbeddedDataField(AffinitiesDataModel, {}),
			status: new EmbeddedDataField(StatusesDataModel, {}),
			equip: new EmbeddedDataField(EquipDataModel, {}),
		};
	}

	/**
	 * @return FUActor
	 */
	get actor() {
		return this.parent;
	}

	prepareEmbeddedData() {
		this.#prepareBasicResources();
	}

	#prepareBasicResources() {
		const data = this;
		const itemTypes = data.actor.itemTypes;
		let freeBenefits = itemTypes.class.reduce(
			( add, curr ) => {
				if ( curr.system.bonus.hp > 0 )
					add.hp += curr.system.bonus.hp
				if ( curr.system.bonus.mp > 0 )
					add.mp += curr.system.bonus.mp
				if ( curr.system.bonus.ip > 0 )
					add.ip += curr.system.bonus.ip
			},
			{ hp: 0, mp: 0, ip: 0 },
		);

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

		Object.defineProperty(this.resources.ip, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				return 6 + freeBenefits.ip;
			},
			set( newVal ) {
				delete this.max;
				this.max = newVal;
			},
		});
	}
}