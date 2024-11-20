import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { DefencesDataModel } from "./common/defences-data-model.mjs";
import { BondDataModel } from "./common/bond-data-model.mjs";
import { AffinitiesDataModel } from "./common/affinities-data-model.mjs";
import { StatusDataModel } from "./common/status-data-model.mjs";
import { EquipDataModel } from "./common/equip-data-model.mjs";

/**
 * 
 */
export class CharacterDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, EmbeddedDataField, ArrayField, NumberField } = foundry.data.fields;
		return {
			level: new SchemaField({ initial: 5, min: 5, max: 50, integer: true, nullable: false }),
			resources: {
				hp: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }), }),
				mp: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }), }),
				ip: new SchemaField({ value: new NumberField({ initial: 6, min: 0, max: 6, integer: true, nullable: false }), }),
				attributes: new EmbeddedDataField(AttributesDataModel, {}),
				fp: new NumberField({ initial: 3, min: 0, integer: true, nullable: false }),
				exp: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				params: new EmbeddedDataField(DefencesDataModel, {}),
				zenit: new SchemaField({ value: new NumberField({ initial: 500, min: 0, integer: true, nullable: false }) }),
			},
			bond: new ArrayField(new EmbeddedDataField(BondDataModel, {}), {
				validate: ( val ) => {
					if ( val.length > 3 )
						val.splice(3);
				}
			}),
			features: {
				pronouns: new SchemaField({ value: new StringField() }),
				identity: new SchemaField({ value: new StringField() }),
				theme: new SchemaField({ value: new StringField() }),
				origin: new SchemaField({ value: new StringField() }),
			},
			affinity: new EmbeddedDataField(AffinitiesDataModel, {}),
			status: new EmbeddedDataField(StatusDataModel, {}),
			equip: new EmbeddedDataField(EquipDataModel, {}),
		};
	}
}