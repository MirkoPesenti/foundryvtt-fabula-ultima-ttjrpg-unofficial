import { FU } from "../../helpers/config.mjs";

/**
 * Extend basic Actor
 * @extends {Actor}
 */

export class FabulaActor extends Actor {

	overrides = this.overrides ?? {};

	/**
	 * Augment basic Actor data model
	 */
	prepareData() {
		super.prepareData();
	}

	prepareBaseData() {
	}

	prepareDerivedData() {
		super.prepareDerivedData();
		const actorData = this;
		const systemData = actorData.system;
		const flags = actorData.flags.boilerplate || {};
		
		this.items.forEach((item) => item.applyActiveEffects());
	
		this._prepareCharacterData(actorData);
		this._prepareNpcData(actorData);
	}

	_prepareCharacterData(actorData) {
		if (actorData.type !== 'character') return;
	  
		const systemData = actorData.system;
	}

	_prepareNpcData(actorData) {
		if (actorData.type !== 'npc') return;
	  
		const systemData = actorData.system;
		systemData.specialRules = systemData.specialRules || [];
	}

	*allApplicableEffects() {
		for ( const effect of super.allApplicableEffects() ) {
			const item = effect.parent;

			if ( item instanceof FabulaActor ) {
				if ( item.system.transferEffects instanceof Function ? item.system.transferEffects() : true ) {
					yield effect;
				}
			} else {
				yield effect;
			}
		}
	}

	applyActiveEffects() {
		if (this.system.prepareEmbeddedData instanceof Function) {
			this.system.prepareEmbeddedData();
		}
		return super.applyActiveEffects();
	}

	async _onCreate( data, options, userId ) {
		await super._onCreate( data, options, userId );

		// Check if Unarmed Strike is equipped to the Actor
		if ( this.type == 'character' || this.type == 'npc' ) {
			if ( FU.UnarmedStrike ) {
				const embeddedItem = this.items.find( item => item.name == FU.UnarmedStrike.name );

				if ( !embeddedItem ) {
					const createdItem = await this.createEmbeddedDocuments( 'Item', [FU.UnarmedStrike] );
					if ( this.type == 'character' )
					await createdItem[0].update({ 'system.isEquipped': true });
					await this.update({
						'system.equip.mainHand': createdItem[0]._id,
						'system.equip.offHand': createdItem[0]._id,
					});
				}
			}
		}
	}

	async _preUpdate( changes, options, userId ) {

		// Check hp values
		const newHP = changes.system?.resources?.hp;
		const currentHP = this.system.resources.hp;
		const newMP = changes.system?.resources?.mp;
		const currentMP = this.system.resources.mp;
		
		if ( newMP ) {
			console.log( newMP.current );
		}

		// if ( newHP ) {
		// 	console.log( newHP, currentHP );
		// }

		await super._preUpdate( changes, options, userId );
	}

	async _onUpdate( changed, options, userId ) {

		const hp = this.system.resources?.hp;
		if ( hp && userId === game.userId ) {

			// Auto set crisis status
			const crisis = Math.floor( hp.max / 2 );
			const isCrisis = hp.current <= crisis;
			if ( isCrisis !== this.statuses.has( 'crisis' ) ) {
				await this.toggleStatusEffect( 'crisis' );
			}

			// Auto set defeated status
			const isDefeated = hp.current === 0;
			if ( isDefeated !== this.statuses.has( 'defeated' ) ) {
				await this.toggleStatusEffect( 'defeated' );
			}
		}

		super._onUpdate( changed, options, userId );
	}

	getRollData() {
		const data = super.getRollData();
	  
		this._getCharacterRollData(data);
		this._getNpcRollData(data);
	  
		return data;
	}

	_getCharacterRollData(data) {
		if (this.type !== 'character') return;
	}
	  
	_getNpcRollData(data) {
		if (this.type !== 'npc') return;
	}

	async fullRest() {
		this.update({ 'system.resources.hp.current': this.system.resources.hp.max });
		this.update({ 'system.resources.mp.current': this.system.resources.mp.max });
		if ( this.statuses.has( 'slow' ) === true ) this.toggleStatusEffect( 'slow' );
		if ( this.statuses.has( 'dazed' ) === true ) this.toggleStatusEffect( 'dazed' );
		if ( this.statuses.has( 'weak' ) === true ) this.toggleStatusEffect( 'weak' );
		if ( this.statuses.has( 'shaken' ) === true ) this.toggleStatusEffect( 'shaken' );
		if ( this.statuses.has( 'enraged' ) === true ) this.toggleStatusEffect( 'enraged' );
		if ( this.statuses.has( 'poisoned' ) === true ) this.toggleStatusEffect( 'poisoned' );
	}

}