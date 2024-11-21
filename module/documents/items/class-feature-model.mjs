/**
 * @property {string} description
 * @property {number} level.current
 * @property {number} level.max
 */

export class CLassFeatureDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, HTMLField, NumberField } = foundry.data.fields;
		return {
			description: new HTMLField(),
			level: new SchemaField({ 
				current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false, }),
				max: new NumberField({ initial: 1, min: 1, integer: true, nullable: false, }),
			}),
		};
	}
}