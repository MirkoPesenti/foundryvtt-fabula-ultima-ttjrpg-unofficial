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
			level: new SchemaField({ 
				current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false, }),
				max: new NumberField({ initial: 1, min: 1, integer: true, nullable: false, }),
			}),
			requirements: new SchemaField({
				class: new ArrayField( new StringField() ),
				multiClass: new BooleanField({ initial: false }),
				classFeature: new ArrayField( new StringField() ),
				multiClassFeature: new BooleanField({ initial: false }),
				classFeatureLevel: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
				level: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
				offensiveSpells: new NumberField({ initial: 0, min: 0, integer: true, nullable: true }),
				spell: new ArrayField( new StringField() ),
				other: new StringField({ initial: '' }),
			}),
			bonus: new SchemaField({
				hp: new BooleanField({ initial: false }),
				mp: new BooleanField({ initial: false }),
				ip: new BooleanField({ initial: false }),
				dualWield: new BooleanField({ initial: false }),
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
				req += ' e aver acquisito';
				if ( this.requirements.classFeature.length > 1 ) {
					if ( this.requirements.multiClassFeature )
						req += ' le Abilità';
					else
						req += ' una o più Abilità tra';
				} else {
					if ( this.requirements.classFeatureLevel > 1 )
						req += ` <strong>${this.requirements.classFeatureLevel} Livelli Abilità</strong> in`;
					else
						req += ` l'Abilità`;
				}

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
			if ( this.requirements.spell.length > 0 ) {
				req += ', e devi aver appreso';
				if ( this.requirements.spell.length > 1 )
					req += ' entrambi gli incantesimi';
				else
					req += ' l\'incantesimo';

				this.requirements.spell.forEach(( el, index ) =>  {
					if ( index != 0 ) {
						if ( index == this.requirements.class.length - 1 )
							req += ' e';
						else
							req += ',';
					}
					req += ` <strong>${el}</strong>`
				});
			}
			if ( this.requirements.other != '' )
				req += ` ${this.requirements.other}`;

			req += '.';
		}

		this.requirements.desc = req;

	}
}