/**
 * @property {string} summary
 * @property {string} type
 * @property {string} description
 * @property {number} IPCost.value
 * @property {boolean} isFavorite.value
 */

export class ConsumableDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, BooleanField, NumberField } = foundry.data.fields;
		return {
			summary: new SchemaField({ value: new StringField() }),
			type: new SchemaField({ value: new StringField() }),
			description: new HTMLField(),
			IPCost: new SchemaField({ value: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }) }),
			isFavorite: new SchemaField({ value: new BooleanField() }),
		};
	}
}