import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { DefencesDataModel } from "./common/defences-data-model.mjs";
import { AffinitiesDataModel } from "./common/affinities-data-model.mjs";
import { StatusesDataModel } from "./common/statuses-data-model.mjs";
import { FU } from '../../helpers/config.mjs';

/**
 * 
 */
export class NpcDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, EmbeddedDataField, ArrayField, HTMLField, NumberField, BooleanField } = foundry.data.fields;
		return {
			description: new HTMLField(),
			traits: new StringField(),
			level: new SchemaField({ value: new NumberField({ initial: 5, min: 5, max: 60, integer: true, nullable: false }) }),
			species: new SchemaField({ value: new StringField({ initial: 'humanoid', choices: Object.keys(FU.species) }) }),
			villain: new StringField({ initial: '', blank: true, choices: Object.keys(FU.villainTypes) }),
			rank: new SchemaField({
				value: new StringField({ initial: 'soldier', choices: Object.keys(FU.enemyRanks) }),
				replacedSoldiers: new NumberField({ initial: 0, min: 0, max: 6 }),
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
				params: new EmbeddedDataField(DefencesDataModel, {}),
			}),
			affinity: new EmbeddedDataField(AffinitiesDataModel, {}),
			skills: new SchemaField({ current: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }) }),
			bonus: new SchemaField({
				test: new NumberField({ initial: 0, integer: true, nullable: false }),
				spell: new NumberField({ initial: 0, integer: true, nullable: false }),
				checks: new NumberField({ initial: 0, integer: true, nullable: false }),
				damage: new SchemaField({
					base: new NumberField({ initial: 0, integer: true, nullable: false }),
					spell: new NumberField({ initial: 0, integer: true, nullable: false }),
				}),
			}),
			status: new EmbeddedDataField(StatusesDataModel, {}),
		};
	}

	/**
	 * @return FUActor
	 */
	get actor() {
		return this.parent;
	}

	prepareBaseData() {
		const data = this;
		
		this.resources.hp.attribute = 'mig';
		this.resources.mp.attribute = 'wlp';

		(this.combat ??= {}).turns = 1;
		
		if ( this.rank.value == 'elite' )
			this.rank.replacedSoldiers = 1;
		else if ( this.rank.value == 'champion' )
			this.rank.replacedSoldiers = 2;
		else
			this.rank.replacedSoldiers = 0;
			
		// Defence, Magic Defence and Initiative
		this.resources.params.def.current = this.attributes.dex.value + this.resources.params.def.bonus;
		this.resources.params.mdef.current = this.attributes.ins.value + this.resources.params.mdef.bonus;
		this.resources.params.init.current = Math.floor( ( this.attributes.dex.value + this.attributes.ins.value ) / 2 ) + this.resources.params.init.bonus;

		// Checks and Damage Bonus
		this.level.checkBonus = {};
		this.level.checkBonus.test = Math.floor( this.level.value / 10 ) > 0 ? Math.floor( this.level.value / 10 ) : 0;
		this.level.checkBonus.test += this.bonus.test;
		this.level.checkBonus.spell = Math.floor( this.level.value / 10 ) > 0 ? Math.floor( this.level.value / 10 ) : 0
		this.level.checkBonus.spell += this.bonus.spell;
		this.level.checkBonus.checks = 0;
		this.level.checkBonus.checks += this.bonus.checks;

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
			this.resources.params.init.current += 1;
		} else if ( this.rank.value == 'champion' ) {
			this.skills.max += this.rank.replacedSoldiers;
			this.combat.turns = this.rank.replacedSoldiers;
			this.resources.params.init.current += this.rank.replacedSoldiers;
		}

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

	}
	
	#prepareBasicData() {
		const data = this;

		// Max HP
		const baseHP = Object.keys(FU.attributes).includes(this.resources.hp.attribute)
			? data.attributes[this.resources.hp.attribute].value
			: data.attributes.mig.value;
		const maxHP = ( baseHP * 5 ) + ( data.level.value * 2 ) + data.resources.hp.bonus;
		data.resources.hp.max = maxHP;
		
		if ( data.rank.value == 'elite' )
			data.resources.hp.max *= 2;
		else if ( data.rank.value == 'champion' )
			data.resources.hp.max *= data.rank.replacedSoldiers;

		if ( data.resources.hp.current > data.resources.hp.max )
			data.resources.hp.current = data.resources.hp.max;

		// HP Crisis
		data.resources.hp.crisis = Math.floor( data.resources.hp.max / 2 );

		// Max MP
		const baseMP = Object.keys(FU.attributes).includes(this.resources.mp.attribute)
			? data.attributes[this.resources.mp.attribute].value
			: data.attributes.mig.value;
		const maxMP = ( baseMP * 5 ) + data.level.value + data.resources.mp.bonus;
		data.resources.mp.max = maxMP;
		
		if ( data.rank.value == 'champion' )
			data.resources.mp.max *= 2;

		if ( data.resources.mp.current > data.resources.mp.max )
			data.resources.mp.current = data.resources.mp.max;

		// Set Ultima Points
		let maxUp = 0;
		if ( data.villain == 'minor' )
			maxUp = 5;
		else if ( data.villain == 'major' )
			maxUp = 10;
		else if ( data.villain == 'supreme' )
			maxUp = 15;
		data.resources.up.max = maxUp;
	}
}