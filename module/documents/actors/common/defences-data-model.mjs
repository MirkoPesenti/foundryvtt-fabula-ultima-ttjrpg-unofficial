/**
 * @property {number} def.current
 * @property {number} def.bonus
 * @property {number} mdef.current
 * @property {number} mdef.bonus
 * @property {number} init.current
 * @property {number} init.bonus
 */
export class DefencesDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { SchemaField, NumberField } = foundry.data.fields;
		return ({
			def: new SchemaField({ bonus: new NumberField({ initial: 0, integer: true, nullable: false }), }),
			mdef: new SchemaField({ bonus: new NumberField({ initial: 0, integer: true, nullable: false }), }),
			init: new SchemaField({ bonus: new NumberField({ initial: 0, integer: true, nullable: false }), }),
		});
	}
}