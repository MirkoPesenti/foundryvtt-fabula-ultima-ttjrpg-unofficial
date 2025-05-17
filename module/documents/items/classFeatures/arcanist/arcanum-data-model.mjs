import { FU } from '../../../../helpers/config.mjs';
import { DamageDataModel } from '../../common/damage-data-model.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {string} domain
 * @property {string} merge
 * @property {string[]} dismiss.name
 * @property {string[]} dismiss.effect
 */

export class ArcanumDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { StringField, HTMLField, ArrayField, SchemaField, BooleanField, EmbeddedDataField } = foundry.data.fields;
		return {
			fabulaID: new StringField(),
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			summary: new StringField(),
			isEquipped: new BooleanField({ initial: false }),
			domain: new StringField({ initial: '' }),
			merge: new HTMLField(),
			mergeName: new StringField({ initial: '' }),
			dismiss: new ArrayField(new SchemaField({
				name: new StringField({ initial: '' }),
				effect: new HTMLField(),
				damage: new EmbeddedDataField(DamageDataModel, {}),
			})),
		};
	}

	transferEffects() {
		return this.parent.isEquipped;
	}
}