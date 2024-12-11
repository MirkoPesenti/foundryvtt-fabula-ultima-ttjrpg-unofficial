import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { DefencesDataModel } from "./common/defences-data-model.mjs";
import { AffinitiesDataModel } from "./common/affinities-data-model.mjs";
import { PrecisionDataModel } from "./common/precision-data-model.mjs";
import { DamageDataModel } from "../items/common/damage-data-model.mjs";
import { FU } from '../../helpers/config.mjs';

/**
 * 
 */
export class NpcDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, StringField, EmbeddedDataField, ArrayField, HTMLField, BooleanField, NumberField } = foundry.data.fields;
		return {
			description: new HTMLField(),
			traits: new StringField(),
			level: new SchemaField({ value: new NumberField({ initial: 5, min: 5, max: 60, integer: true, nullable: false }) }),
			species: new StringField({ initial: 'humanoid', choices: Object.keys(FU.species) }),
			villain: new StringField({ initial: '', blank: true, choices: Object.keys(FU.villainTypes) }),
			rank: new SchemaField({
				value: new StringField({ initial: 'soldier', choices: Object.keys(FU.enemyRanks) }),
				replacedSoldiers: new NumberField({ initial: 0, min: 0, max: 6 }),
			}),
			resources: new SchemaField({
				hp: new SchemaField({ current: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }) }),
				mp: new SchemaField({ current: new NumberField({ initial: 1, min: 0, integer: true, nullable: false }) }),
				attributes: new EmbeddedDataField(AttributesDataModel, {}),
				up: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
				params: new EmbeddedDataField(DefencesDataModel, {}),
			}),
			affinity: new EmbeddedDataField(AffinitiesDataModel, {}),
			actions: new ArrayField(new SchemaField({
				name: new StringField(),
				description: new HTMLField(),
				type: new StringField({ initial: 'attack', choices: Object.keys(FU.NPCactionTypes) }),
				range: new StringField({ initial: 'melee', choices: Object.keys(FU.WeaponRanges) }),
				precisionAttr: new EmbeddedDataField(PrecisionDataModel, {}),
				precisionBonus: new NumberField({ initial: 0, nullable: true }),
				damage: new EmbeddedDataField(DamageDataModel, {}),
			})),
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
		this.resources.params.def.bonus = this.resources.attributes.dex.value;
		this.resources.params.mdef.bonus = this.resources.attributes.ins.value;
		this.resources.params.init.bonus = Math.floor( ( this.resources.attributes.dex.value + this.resources.attributes.ins.value ) / 2 );

		// Checks and Damage Bonus
		this.level.checkBonus = Math.floor( this.level.value / 10 ) > 0 ? Math.floor( this.level.value / 10 ) : 0;
		if ( this.level.value == 60 )
			this.level.damageBonus = 15;
		else if ( this.level.value >= 40 )
			this.level.damageBonus = 10;
		else if ( this.level.value >= 20 )
			this.level.damageBonus = 5;
		else
			this.level.damageBonus = 0;

		// Max Skills
		if ( this.species == 'beast' )
			this.maxSkills = 4;
		else if ( this.species == 'construct' )
			this.maxSkills = 2;
		else if ( this.species == 'demon' )
			this.maxSkills = 3;
		else if ( this.species == 'elemental' )
			this.maxSkills = 2;
		else if ( this.species == 'monster' )
			this.maxSkills = 4;
		else if ( this.species == 'plant' )
			this.maxSkills = 3;
		else if ( this.species == 'undead' )
			this.maxSkills = 2;
		else if ( this.species == 'humanoid' )
			this.maxSkills = 3;
		else
			this.maxSkills = 0;

		this.maxSkills += Math.floor( this.level.value / 10 );

		if ( this.affinity.physical == 'vulnerability' )
			this.maxSkills += 2;
		if ( this.affinity.air == 'vulnerability' )
			this.maxSkills += 1;
		if ( this.affinity.bolt == 'vulnerability' )
			this.maxSkills += 1;
		if ( this.affinity.dark == 'vulnerability' )
			this.maxSkills += 1;
		if ( this.affinity.earth == 'vulnerability' )
			this.maxSkills += 1;
		if ( this.affinity.fire == 'vulnerability' )
			this.maxSkills += 1;
		if ( this.affinity.ice == 'vulnerability' )
			this.maxSkills += 1;
		if ( this.affinity.light == 'vulnerability' )
			this.maxSkills += 1;
		if ( this.affinity.poison == 'vulnerability' )
			this.maxSkills += 1;

		// Bonus by Rank
		if ( this.rank.value == 'elite' ) {
			this.maxSkills += 1;
			this.combat.turns = 2;
			this.resources.params.init.bonus += 1;
		} else if ( this.rank.value == 'champion' ) {
			this.maxSkills += this.rank.replacedSoldiers;
			this.combat.turns = this.rank.replacedSoldiers;
			this.resources.params.init.bonus += this.rank.replacedSoldiers;
		}
	}

	async prepareEmbeddedData() {
		const data = this;

		if (!this.resources || !this.resources.hp || typeof this.resources.hp !== 'object') {
			console.error("this.resources.hp non è definito o non è un oggetto valido.");
			return;
		}

		// Max HP
		const baseHP = Object.keys(FU.attributes).includes(this.resources.hp.attribute)
			? data.resources.attributes[this.resources.hp.attribute].value
			: data.resources.attributes.mig.value;
		const maxHP = ( baseHP * 5 ) + ( data.level.value * 2 );
		this.resources.hp.max = maxHP;
		
		if ( this.rank.value == 'elite' )
			this.resources.hp.max *= 2;
		else if ( this.rank.value == 'champion' )
			this.resources.hp.max *= this.rank.replacedSoldiers;

		// HP Crisis
		this.resources.hp.crisis = Math.floor( this.resources.hp.max / 2 );

		// Max MP
		const baseMP = Object.keys(FU.attributes).includes(this.resources.mp.attribute)
			? data.resources.attributes[this.resources.mp.attribute].value
			: data.resources.attributes.mig.value;
		const maxMP = ( baseMP * 5 ) + ( data.level.value * 2 );
		this.resources.mp.max = maxMP;
		
		if ( this.rank.value == 'champion' )
			this.resources.mp.max *= 2;

		// Set Ultima Points
		let baseUP = 0;
		if ( data.villain == 'minor' )
			baseUP = 5;
		else if ( data.villain == 'major' )
			baseUP = 10;
		else if ( data.villain == 'supreme' )
			baseUP = 15;
		this.resources.up = baseUP;
	}
}