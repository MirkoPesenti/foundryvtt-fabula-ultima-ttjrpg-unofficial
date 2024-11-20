import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { DefencesDataModel } from "./common/defences-data-model.mjs";
import { BondDataModel } from "./common/bond-data-model.mjs";
import { AffinitiesDataModel } from "./common/affinities-data-model.mjs";
import { StatusesDataModel } from "./common/statuses-data-model.mjs";
import { EquipDataModel } from "./common/equip-data-model.mjs";

/**
 * @property {number} level.value
 * @property {number} resources.hp.value
 * @property {number} resources.mp.value
 * @property {number} resources.ip.value
 * @property {AttributesDataModel} resources.attributes
 * @property {number} resources.fp.value
 * @property {number} resources.exp.value
 * @property {DefencesDataModel} resources.params
 * @property {number} resources.zenit.value
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
				hp: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }), }),
				mp: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }), }),
				ip: new SchemaField({ value: new NumberField({ initial: 6, min: 0, max: 6, integer: true, nullable: false }), }),
				attributes: new EmbeddedDataField(AttributesDataModel, {}),
				fp: new NumberField({ initial: 3, min: 0, integer: true, nullable: false }),
				exp: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				params: new EmbeddedDataField(DefencesDataModel, {}),
				zenit: new SchemaField({ value: new NumberField({ initial: 500, min: 0, integer: true, nullable: false }) }),
			}),
			bond: new ArrayField(new EmbeddedDataField(BondDataModel, {}), {
				validate: ( val ) => {
					if ( val.length > 3 )
						val.splice(3);
				}
			}),
			features: new SchemaField({
				pronouns: new SchemaField({ value: new StringField() }),
				identity: new SchemaField({ value: new StringField() }),
				theme: new SchemaField({ value: new StringField() }),
				origin: new SchemaField({ value: new StringField() }),
			}),
			affinity: new EmbeddedDataField(AffinitiesDataModel, {}),
			status: new EmbeddedDataField(StatusesDataModel, {}),
			equip: new EmbeddedDataField(EquipDataModel, {}),
		};
	}
}