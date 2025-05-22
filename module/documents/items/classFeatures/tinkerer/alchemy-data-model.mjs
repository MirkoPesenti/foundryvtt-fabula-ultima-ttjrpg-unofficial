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
					new StringField({ initial: "", blank: true, choices: Object.keys(FU.statusses) })
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

export function AlchemyListeners(html, item) {
	if (item.type !== 'alchemy') return;

	// Add entry to Array
	html.on('click', '.js_addArrayEntry', async (e) => {
		e.preventDefault();
		const target = e.currentTarget.dataset.target;
		if ( !target ) return;

		const prop = `system.${target}`;
		const array = foundry.utils.duplicate(item.system?.[target]) || [];
		array.push({});
		await item.update({ [prop]: array });
	});

	// Add entry to second level Array
	html.on('click', '.js_addSecondLevelArray', async (e) => {
		e.preventDefault();
		const index = e.currentTarget.dataset.index;
		const target = e.currentTarget.dataset.target;
		if ( !index || !target ) return;

		const effects = foundry.utils.duplicate(item.system.effects) || [];
		if ( effects[index]?.[target] ) {
			effects[index][target].push('');
		}
		await item.update({ 'system.effects': effects });
	});

	// Remove entry to second level Array
	html.on('click', '.js_removeSecondLevelArray', async (e) => {
		e.preventDefault();
		const effectIndex = e.currentTarget.dataset.effectIndex;
		const index = e.currentTarget.dataset.index;
		const target = e.currentTarget.dataset.target;
		if ( !effectIndex || !target || !index ) return;

		const effects = foundry.utils.duplicate(item.system.effects) || [];
		const newEffects = [...effects];
		if ( effects[effectIndex]?.[target] ) {
			newEffects[effectIndex][target].splice(index, 1);
		}
		await item.update({ 'system.effects': newEffects });
	});
}