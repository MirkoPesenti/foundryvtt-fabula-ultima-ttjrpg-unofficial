import { FU } from "../../helpers/config.mjs";

/**
 * @property {string} sourcebook
 * @property {string} art.src
 * @property {string} summary.value
 * @property {string} description
 * @property {string} alias.value
 * @property {string[]} questions
 * @property {number} level.value
 * @property {boolean} bonus.hp
 * @property {boolean} bonus.mp
 * @property {boolean} bonus.ip
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
 * @property {boolean} bonus.projects.value
 * @property {string} bonus.projects.condition
 */

export class CLassDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, ArrayField, BooleanField, NumberField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			art: new SchemaField({ src: new StringField() }),
			summary: new SchemaField({ value: new StringField() }),
			description: new HTMLField(),
			alias: new SchemaField({ value: new StringField() }),
			questions: new ArrayField( new StringField() ),
			level: new SchemaField({ value: new NumberField({ initial: 0, min: 0, max: 10, integer: true, nullable: false }) }),
			bonus: new SchemaField({
				hp: new BooleanField({ initial: false }),
				mp: new BooleanField({ initial: false }),
				ip: new BooleanField({ initial: false }),
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
				projects: new SchemaField({
					value: new BooleanField({ initial: false }),
					condition: new StringField(),
				}),
			}),
		};
	}
}