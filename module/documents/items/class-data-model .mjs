import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} summary.value
 * @property {string} description
 * @property {string} alias.value
 * @property {string[]} questions
 * @property {number} level.value
 * @property {number} bonus.hp
 * @property {number} bonus.mp
 * @property {number} bonus.ip
 * @property {boolean} bonus.startProjects
 * @property {string[]} bonus.ritualType
 * @property {string[]} bonus.weaponType
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
				startProject: new BooleanField({ initial: false }),
				ritualType: new ArrayField( new StringField({ initial: '', blank: true, choices: Object.keys(FU.MagicDisciplines) }) ),
				weaponType: new ArrayField( new StringField({ initial: '', blank: true, choices: Object.keys(FU.martialItems) }) ),
			}),
		};
	}
}