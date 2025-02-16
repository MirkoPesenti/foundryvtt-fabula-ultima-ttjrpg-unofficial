import { FU } from '../../helpers/config.mjs';

/**
 */

export class SkillDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { StringField, HTMLField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			description: new HTMLField(),
			class: new StringField({ initial: 'arcanist', choices: Object.keys(FU.classes) }),
		};
	}
}