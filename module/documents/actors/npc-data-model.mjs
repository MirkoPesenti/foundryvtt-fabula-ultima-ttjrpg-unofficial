import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { DefencesDataModel } from "./common/defences-data-model.mjs";
import { AffinitiesDataModel } from "./common/affinities-data-model.mjs";
import { StatusesDataModel } from "./common/statuses-data-model.mjs";
import { EquipDataModel } from "./common/equip-data-model.mjs";
import { FU } from '../../helpers/config.mjs';

/**
 * 
 */
export class NpcDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, EmbeddedDataField, HTMLField, NumberField, BooleanField } = foundry.data.fields;
		return {
			description: new HTMLField(),
			traits: new StringField(),
			level: new SchemaField({ value: new NumberField({ initial: 5, min: 5, max: 60, integer: true, nullable: false }) }),
			species: new SchemaField({ value: new StringField({ initial: 'humanoid', choices: Object.keys(FU.species) }) }),
			villain: new StringField({ initial: '', blank: true, choices: Object.keys(FU.villainTypes) }),
			rank: new SchemaField({
				value: new StringField({ initial: 'soldier', choices: Object.keys(FU.enemyRanks) }),
				replacedSoldiers: new NumberField({ initial: 1, min: 1, max: 6 }),
			}),
			attributes: new EmbeddedDataField(AttributesDataModel, {}),
			resources: new SchemaField({
				hp: new SchemaField({
					current: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }),
					bonus: new NumberField({ initial: 0, integer: true, nullable: false }),
				}),
				mp: new SchemaField({
					current: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }),
					bonus: new NumberField({ initial: 0, integer: true, nullable: false }),
				}),
				up: new SchemaField({ current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }) }),
			}),
			params: new EmbeddedDataField(DefencesDataModel, {}),
			affinity: new EmbeddedDataField(AffinitiesDataModel, {}),
			skills: new SchemaField({ current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }) }),
			bonus: new SchemaField({
				damage: new SchemaField({
					base: new NumberField({ initial: 0, integer: true, nullable: false }),
					spell: new NumberField({ initial: 0, integer: true, nullable: false }),
				}),
			}),
			status: new EmbeddedDataField(StatusesDataModel, {}),
			equip: new EmbeddedDataField(EquipDataModel, {}),
			equippable: new BooleanField({ initial: false }),
		};
	}

	/**
	 * @return FUActor
	 */
	get actor() {
		return this.parent;
	}

	prepareBaseData() {
		this.resources.hp.attribute = 'mig';
		this.resources.mp.attribute = 'wlp';

		(this.combat ??= {}).turns = 1;
		
		if ( this.rank.value == 'elite' )
			this.rank.replacedSoldiers = 1;
		else if ( this.rank.value == 'champion' )
			this.rank.replacedSoldiers = 2;
		else
			this.rank.replacedSoldiers = 1;

		// Checks and Damage Bonus
		this.level.checkBonus = {};
		this.level.checkBonus.test = Math.floor( this.level.value / 10 ) > 0 ? Math.floor( this.level.value / 10 ) : 0;
		this.level.checkBonus.spell = Math.floor( this.level.value / 10 ) > 0 ? Math.floor( this.level.value / 10 ) : 0
		this.level.checkBonus.checks = 0;

		if ( this.level.value == 60 )
			this.level.damageBonus = 15;
		else if ( this.level.value >= 40 )
			this.level.damageBonus = 10;
		else if ( this.level.value >= 20 )
			this.level.damageBonus = 5;
		else
			this.level.damageBonus = 0;

		// Max Skills
		if ( this.species.value == 'beast' )
			this.skills.max = 4;
		else if ( this.species.value == 'construct' )
			this.skills.max = 2;
		else if ( this.species.value == 'demon' )
			this.skills.max = 3;
		else if ( this.species.value == 'elemental' )
			this.skills.max = 2;
		else if ( this.species.value == 'monster' )
			this.skills.max = 4;
		else if ( this.species.value == 'plant' )
			this.skills.max = 3;
		else if ( this.species.value == 'undead' )
			this.skills.max = 2;
		else if ( this.species.value == 'humanoid' )
			this.skills.max = 3;
		else
			this.skills.max = 0;

		this.skills.max += Math.floor( this.level.value / 10 );

		if ( this.affinity.physical == 'vulnerability' )
			this.skills.max += 2;
		if ( this.affinity.air == 'vulnerability' )
			this.skills.max += 1;
		if ( this.affinity.bolt == 'vulnerability' )
			this.skills.max += 1;
		if ( this.affinity.dark == 'vulnerability' )
			this.skills.max += 1;
		if ( this.affinity.earth == 'vulnerability' )
			this.skills.max += 1;
		if ( this.affinity.fire == 'vulnerability' )
			this.skills.max += 1;
		if ( this.affinity.ice == 'vulnerability' )
			this.skills.max += 1;
		if ( this.affinity.light == 'vulnerability' )
			this.skills.max += 1;
		if ( this.affinity.poison == 'vulnerability' )
			this.skills.max += 1;

		// Bonus by Rank
		if ( this.rank.value == 'elite' ) {
			this.skills.max += 1;
			this.combat.turns = 2;
			this.params.init.current += 1;
		} else if ( this.rank.value == 'champion' ) {
			this.skills.max += this.rank.replacedSoldiers;
			this.combat.turns = this.rank.replacedSoldiers;
			this.params.init.current += this.rank.replacedSoldiers;
		}

		// Set Ultima Points
		let maxUp = 0;
		if ( this.villain == 'minor' )
			maxUp = 5;
		else if ( this.villain == 'major' )
			maxUp = 10;
		else if ( this.villain == 'supreme' )
			maxUp = 15;
		this.resources.up.max = maxUp;

		// Set Species Rules
		const speciesRules = [];
		if ( this.species.value == 'beast' ) {
			speciesRules.push({
				name: 'Bestia',
				description: `
					<p>Le <strong>bestie</strong> non possono acquisire l'Abilità <strong>Equipaggiabile</strong>.</p>
				`,
			});
		} else if ( this.species.value == 'construct' ) {
			speciesRules.push({
				name: 'Costrutto',
				description: `
					<p>I <strong>costrutti</strong> sono Immuni al danno da <strong>veleno</strong> e Resistenti al danno da <strong>terra</strong>.</p>
					<p>Sono inoltre immuni allo status <strong>avvelenato</strong>.</p>
				`,
			});
		} else if ( this.species.value == 'demon' ) {
			speciesRules.push({
				name: 'Demone',
				description: `
					<p>I <strong>demoni</strong> sono Resistenti a due tipi di danno a tua scelta.</p>
				`,
			});
		} else if ( this.species.value == 'elemental' ) {
			speciesRules.push({
				name: 'Elementale',
				description: `
					<p>Gli <strong>elementali</strong> sono Immuni al danno da <strong>veleno</strong> e a un altro tipo di danno a tua scelta. Sono inoltre immuni allo status <strong>avvelenato</strong>.</p>
				`,
			});
		} else if ( this.species.value == 'monster' ) {
			speciesRules.push({
				name: 'Mostro',
				description: `
					<p>I <strong>mostri</strong> non seguono regole speciali.</p>
				`,
			});
		} else if ( this.species.value == 'plant' ) {
			speciesRules.push({
				name: 'Pianta',
				description: `
					<p>Le <strong>piante</strong> sono Vulnerabili al danno da (scegliere uno tra: <strong>aria, fulmine, fuoco, ghiaccio</strong>). Sono inoltre immuni agli status <strong>confuso, furente</strong> e <strong>scosso</strong></p>
				`,
			});
		} else if ( this.species.value == 'undead' ) {
			speciesRules.push({
				name: 'Non morto',
				description: `
					<p>I <strong>non morti</strong> sono Immuni al danno da <strong>ombra</strong> e da <strong>veleno</strong> e Vulnerabili al danno da <strong>luce</strong>. Inoltre, sono immuni allo status <strong>avvelenato</strong>.</p>
					<p>In aggiunta, quando un effetto (come quello di un Arcanum, una pozione o un incantesimo) permetterebbe a un <strong>non morto</strong> di recuperare PV, chi controlla l'effetto può invece decidere di far perdere al <strong>non morto</strong> un ammontare di Punti Vita pari a metà dell'ammontare che avrebbe dovuto recuperare.</p>
				`,
			});
		} else if ( this.species.value == 'humanoid' ) {
			speciesRules.push({
				name: 'Umanoide',
				description: `
					<p>Gli <strong>umanoidi</strong> acquisiscono sempre gratuitamente l'Abilità <strong>Equipaggiabile</strong>.</p>
				`,
			});
		}
		this.species.rules = speciesRules;
	}

	prepareEmbeddedData() {

		this.#prepareBasicData();
		this.status.prepareData();
		this.params.prepareData();

	}
	
	#prepareBasicData() {
		const data = this;

		// Max HP
		Object.defineProperty(this.resources.hp, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				const baseAttr = Object.keys(FU.attributes).includes(this.attribute) ? data.attributes[this.attribute].base : data.attributes.mig.base;
				return ( ( baseAttr * 5 ) + ( data.level.value * 2 ) + this.bonus ) * data.rank.replacedSoldiers;
			},
			set( newVal ) {
				delete this.max;
				this.max = newVal;
			}
		});

		// HP Crisis
		Object.defineProperty(this.resources.hp, 'crisis', {
			configurable: true,
			enumerable: true,
			get() {
				return Math.floor( this.max / 2 );
			},
			set( newVal ) {
				delete this.crisis;
				this.crisis = newVal;
			}
		});

		// Max MP
		Object.defineProperty(this.resources.mp, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				const baseAttr = Object.keys(FU.attributes).includes(this.attribute) ? data.attributes[this.attribute].base : data.attributes.wlp.base;
				const multiplier = data.rank.value == 'champion' ? 2 : 1;
				return ( ( baseAttr * 5 ) + data.level.value + this.bonus ) * multiplier;
			},
			set( newVal ) {
				delete this.max;
				this.max = newVal;
			}
		});
	}
}