import { AttributesDataModel } from "./common/attributes-data-model.mjs";
import { DefencesDataModel } from "./common/defences-data-model.mjs";
import { BondDataModel } from "./common/bond-data-model.mjs";
import { AffinitiesDataModel } from "./common/affinities-data-model.mjs";
import { StatusesDataModel } from "./common/statuses-data-model.mjs";
import { EquipDataModel } from "./common/equip-data-model.mjs";
import { MartialDataModel } from "./common/martial-data-model.mjs";
import { CharacterRitualDataModel } from "./common/character-ritual-data-model.mjs";
import { CharacterMigration } from "./migrations/character-migration.mjs";
import { FU } from "../../helpers/config.mjs";

/**
 * 
 */
export class CharacterDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const { SchemaField, HTMLField, StringField, EmbeddedDataField, ArrayField, NumberField, BooleanField } = foundry.data.fields;
		return {
			description: new HTMLField(),
			features: new SchemaField({
				pronouns: new StringField({ initial: '' }),
				identity: new StringField({ initial: '' }),
				theme: new StringField({ initial: '' }),
				origin: new StringField({ initial: '' }),
			}),
			level: new SchemaField({
				exp: new NumberField({ initial: 0, min: 0, integer: true, nullable: false }),
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
				ip: new SchemaField({
					current: new NumberField({ initial: 6, min: 0, integer: true, nullable: false }),
					bonus: new NumberField({ initial: 0, integer: true, nullable: false }),
				}),
				fp: new SchemaField({ current: new NumberField({ initial: 3, min: 0, integer: true, nullable: false }), }),
				zenit: new NumberField({ initial: 500, min: 0, integer: true, nullable: false }),
			}),
			bond: new ArrayField(new EmbeddedDataField(BondDataModel, {})),
			params: new EmbeddedDataField(DefencesDataModel, {}),
			affinity: new EmbeddedDataField(AffinitiesDataModel, {}),
			status: new EmbeddedDataField(StatusesDataModel, {}),
			equip: new EmbeddedDataField(EquipDataModel, {}),
			useMartial: new EmbeddedDataField(MartialDataModel, {}),
			castRitual: new EmbeddedDataField(CharacterRitualDataModel, {}),
			createProject: new BooleanField({ initial: false }),
		};
	}

	static migrateData( source ) {
		CharacterMigration.run( source );
		return source;
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

		if ( this.level.value >= 40 )
			((this.bonus ??= {}).damage ??= {}).arcana = 20;
		else if ( this.level.value >= 20 )
			((this.bonus ??= {}).damage ??= {}).arcana = 10;
		else
			((this.bonus ??= {}).damage ??= {}).arcana = 0;

		for ( const bond of this.bond ) {
			bond.prepareData();
		}
	}

	prepareEmbeddedData() {

		this.#prepareBasicData();
		this.status.prepareData();
		this.params.prepareData();

	}

	#prepareBasicData() {
		const data = this;
		const actorClasses = this.parent.items.filter( item => item.type == 'class' ) ?? [];
		const freeBenefits = actorClasses.reduce(
			( add, curr ) => {
				if ( curr.system.bonus.hp == true )
					add.hp += 5;
				if ( curr.system.bonus.mp == true )
					add.mp += 5;
				if ( curr.system.bonus.ip == true )
					add.ip += 2;
				return add;
			}, { hp: 0, mp: 0, ip: 0 },
		);

		// Set usable Martial items and Rital disciplines
		for ( const item of actorClasses ) {
			if ( item.system.bonus.weapon.meleeWeapon ) data.useMartial.melee = true;
			if ( item.system.bonus.weapon.rangedWeapon ) data.useMartial.ranged = true;
			if ( item.system.bonus.weapon.armor ) data.useMartial.armor = true;
			if ( item.system.bonus.weapon.shield ) data.useMartial.shield = true;

			if ( item.system.bonus.ritual.arcanism ) data.castRitual.arcanism = true;
			if ( item.system.bonus.ritual.chimerism ) data.castRitual.chimerism = true;
			if ( item.system.bonus.ritual.elementalism ) data.castRitual.elementalism = true;
			if ( item.system.bonus.ritual.entropism ) data.castRitual.entropism = true;
			if ( item.system.bonus.ritual.ritualism ) data.castRitual.ritualism = true;
			if ( item.system.bonus.ritual.spiritism ) data.castRitual.spiritism = true;
		}

		// Set if character can create a project
		for ( const item of actorClasses ) {
			if ( item.system.bonus.projects.value ) data.createProject = true;
		}

		// Set level
		Object.defineProperty(this.level, 'value', {
			configurable: true,
			enumerable: true,
			get() {
				const level = actorClasses.reduce(
					( add, curr ) => {
						add.value += curr.system.level.value;
						return add;
					}, { value: 0 },
				);
				return level.value;
			},
			set( newVal ) {
				delete this.value;
				this.value = newVal;
			}
		});

		// Max HP
		Object.defineProperty(this.resources.hp, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				const baseAttr = Object.keys(FU.attributes).includes(this.attribute) ? data.attributes[this.attribute].base : data.attributes.mig.base;
				return ( baseAttr * 5 ) + data.level.value + this.bonus + freeBenefits.hp;
			},
			set( newVal ) {
				delete this.max;
				this.max = newVal;
			}
		});
		if ( data.resources.hp.current > data.resources.hp.max )
			data.resources.hp.current = data.resources.hp.max;

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
				return ( baseAttr * 5 ) + data.level.value + this.bonus + freeBenefits.mp;
			},
			set( newVal ) {
				delete this.max;
				this.max = newVal;
			}
		});
		if ( data.resources.mp.current > data.resources.mp.max )
			data.resources.mp.current = data.resources.mp.max;

		// Max IP
		Object.defineProperty(this.resources.ip, 'max', {
			configurable: true,
			enumerable: true,
			get() {
				return 6 + this.bonus + freeBenefits.ip;
			},
			set( newVal ) {
				delete this.max;
				this.max = newVal;
			}
		});
		if ( data.resources.ip.current > data.resources.ip.max )
			data.resources.ip.current = data.resources.ip.max;
	}
}