import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} summary.value
 * @property {string} description
 * @property {string} alias.value
 * @property {string[]} questions
 * @property {number} level.value
 * @property {number} bonus.hp.value
 * @property {number} bonus.mp.value
 * @property {number} bonus.ip.value
 * @property {boolean} bonus.startProjects.value
 * @property {string[]} bonus.ritualType
 * @property {string[]} bonus.weaponType
 */

export class CLassDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, ArrayField, BooleanField, NumberField } = foundry.data.fields;
		return {
			summary: new SchemaField({ value: new StringField() }),
		};
	}
}