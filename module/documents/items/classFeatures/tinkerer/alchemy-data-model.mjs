import { FU } from "../../../../helpers/config.mjs";
import { DamageDataModel } from "../../common/damage-data-model.mjs";

export class AlchemyDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, HTMLField, NumberField, StringField, ArrayField, EmbeddedDataField, BooleanField } = foundry.data.fields;
		return {
			fabulaID: new StringField(),
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			summary: new StringField(),
			rank: new StringField({ initial: 'base', choices: Object.keys(FU.technologiesRank) }),
			properties: new SchemaField({
				base: new SchemaField({
					IPCost: new NumberField({ initial: 0, min: 0, nullable: false }),
					dices: new NumberField({ initial: 1, min: 0, nullable: false }),
				}),
				advanced: new SchemaField({
					IPCost: new NumberField({ initial: 0, min: 0, nullable: false }),
					dices: new NumberField({ initial: 1, min: 0, nullable: false }),
				}),
				superior: new SchemaField({
					IPCost: new NumberField({ initial: 0, min: 0, nullable: false }),
					dices: new NumberField({ initial: 1, min: 0, nullable: false }),
				}),
			}),
			area: new ArrayField(new SchemaField({
				range: new SchemaField({
					min: new NumberField({ initial: 1, min: 1, max: 20, nullable: true }),
					max: new NumberField({ initial: undefined, min: 1, max: 20, nullable: true })
				}),
				description: new HTMLField(),
			})),
			effects: new ArrayField(new SchemaField({
				alwaysAvailable: new BooleanField({ initial: false }),
				range: new SchemaField({
					min: new NumberField({ initial: 1, min: 1, max: 20, nullable: true }),
					max: new NumberField({ initial: undefined, min: 1, max: 20, nullable: true })
				}),
				description: new HTMLField(),
				damage: new EmbeddedDataField(DamageDataModel, {}),
				heal: new SchemaField({
					hp: new NumberField({ initial: 0, min: 0, nullable: true }),
					mp: new NumberField({ initial: 0, min: 0, nullable: true }),
					status: new BooleanField({ initial: false }),
				}),
				statuses: new ArrayField(
					new StringField({ initial: "", blank: true, choices: Object.keys(CONFIG.statusEffects) })
				),
				resistances: new ArrayField(
					new StringField({ initial: "", blank: true, choices: Object.keys(FU.DamageTypes) })
				),
			})),
		}
	}

	transferEffects() {
		return this.data?.transferEffects instanceof Function ? this.data?.transferEffects() : true;
	}

	prepareBaseData() {}
}