import { FU } from '../../helpers/config.mjs';

/**
 * @property {string} sourcebook
 * @property {string} description
 * @property {string[]} requirements.class
 * @property {string[]} requirements.classFeature
 */

export class HeroicSkillDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, HTMLField, ArrayField, NumberField, BooleanField } = foundry.data.fields;
		return {
			sourcebook: new StringField({ initial: 'base', choices: Object.keys(FU.sourcebook) }),
			summary: new StringField(),
			description: new HTMLField(),
			requirements: new SchemaField({
				class: new ArrayField( new StringField() ),
				classFeature: new ArrayField( new StringField() ),
				multiClass: new BooleanField({ initial: false }),
				level: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
				offensiveSpells: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
			}),
		};
	}

	prepareBaseData() {
		if ( this.requirements.classFeature[0] == '' )
			this.requirements.classFeature = [];

		let req = '';

		if ( this.requirements.class.length > 0 ) {
			req += 'devi aver padroneggiato';
			if ( this.requirements.class.length > 1 ) {
				if ( this.requirements.multiClass )
					req += ' <strong>due o più</strong>';
				else
					req += ' una o più';

				req += ' Classi tra';
			} else {
				req += ' la Classe';
			}
			this.requirements.class.forEach(( el, index ) => {
				if ( index != 0 ) {
					if ( index == this.requirements.class.length - 1 )
						req += ' e';
					else
						req += ',';
				}
				req += ` <strong>${el}</strong>`;
			});
			if ( this.requirements.classFeature.length > 0 ) {
				req += ' e aver acquistato';
				if ( this.requirements.classFeature.length > 1 )
					req += ' una o più Abilità tra';
				else
					req += ` l'Abilità`;
				this.requirements.classFeature.forEach(( el, index ) => {
					if ( index != 0 ) {
						if ( index == this.requirements.classFeature.length - 1 )
							req += ' e';
						else
							req += ',';
					}
					req += ` <strong>${el}</strong>`;
				});
			}
			if ( this.requirements.level > 0 )
				req += `, e aver raggiunto il <strong>livello ${this.requirements.level}</strong>`;
			if ( this.requirements.offensiveSpells > 0 )
				req += `, e devi conoscere almeno <strong>${this.requirements.offensiveSpells}</strong> incantesimi offensivi`;

			req += '.';
		}

		this.requirements.desc = req;

	}
}