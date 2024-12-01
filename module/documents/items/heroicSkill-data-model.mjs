import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {string[]} requirements.class
 * @property {string} requirements.classFeature
 * @property {string} spell
 */

export class HeroicSkillDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, ArrayField, NumberField, BooleanField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			requirements: new SchemaField({
				class: new ArrayField( new StringField() ),
				classFeature: new StringField(),
				multiClass: new BooleanField({ initial: false }),
				level: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
			}),
			spell: new StringField(),
		};
	}
}