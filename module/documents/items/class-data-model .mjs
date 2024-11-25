/**
 * @property {string} summary.value
 * @property {string} description
 * @property {string} alias.value
 * @property {string[]} questions
 * @property {number} level.value
 * @property {number} bonus.hp
 * @property {number} bonus.mp
 * @property {number} bonus.ip
 * @property {boolean} bonus.ritual.arcanism
 * @property {boolean} bonus.ritual.chimerism
 * @property {boolean} bonus.ritual.elementalism
 * @property {boolean} bonus.ritual.entropism
 * @property {boolean} bonus.ritual.ritualism
 * @property {boolean} bonus.ritual.spiritism
 * @property {boolean} bonus.weapon.meleeWeapon
 * @property {boolean} bonus.weapon.rangedWeapon
 * @property {boolean} bonus.weapon.armor
 * @property {boolean} bonus.weapon.shield
 */

export class CLassDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, ArrayField, BooleanField, NumberField } = foundry.data.fields;
		return {
			summary: new SchemaField({ value: new StringField() }),
			description: new HTMLField(),
			alias: new SchemaField({ value: new StringField() }),
			questions: new ArrayField( new StringField() ),
			level: new SchemaField({ value: new NumberField({ initial: 1, min: 1, max: 10, integer: true, nullable: false }) }),
			bonus: new SchemaField({
				hp: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				mp: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				ip: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				ritual: new SchemaField({
					arcanism: new BooleanField({ initial: false }),
					chimerism: new BooleanField({ initial: false }),
					elementalism: new BooleanField({ initial: false }),
					entropism: new BooleanField({ initial: false }),
					ritualism: new BooleanField({ initial: false }),
					spiritism: new BooleanField({ initial: false }),
				}),
				weapon: new SchemaField({
					meleeWeapon: new BooleanField({ initial: false }),
					rangedWeapon: new BooleanField({ initial: false }),
					armor: new BooleanField({ initial: false }),
					shield: new BooleanField({ initial: false }),
				}),
			}),
		};
	}
}