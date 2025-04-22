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

	async _preUpdate( changed, options, userId ) {
		
		if ( changed.system?.resources ) {
			// Handling of simple operations
			const operators = [ '-', '+' ];

			const newHP = changed.system?.resources?.hp;
			const currentHP = this.system.resources.hp;
			if ( currentHP && 'hp' in changed.system?.resources ) {
				if ( typeof newHP?.current === 'string' ) {
					const HPvalue = parseInt( newHP.current, 10 );
					if ( !isNaN( HPvalue ) ) {
						if ( operators.includes( newHP.current[0] ) ) newHP.current = currentHP.current + HPvalue;
					} else {
						newHP.current = null;
					}
				}

				// Setup damage taken
				const HPdifference = newHP.current - currentHP.current;
				const isLevelUp = !!changed.system && !changed.system?.level?.value === undefined;
				
				if ( HPdifference !== 0 && !isLevelUp ) {
					options.damageTaken = HPdifference;
				}
			}

			const newMP = changed.system?.resources?.mp;
			const currentMP = this.system.resources.mp;
			if ( currentMP && 'mp' in changed.system?.resources ) {
				if ( typeof newMP?.current === 'string' ) {
					const MPvalue = parseInt( newMP.current, 10 );
					if ( !isNaN( MPvalue ) ) {
						if ( operators.includes( newMP.current[0] ) ) newMP.current = currentMP.current + MPvalue;
					} else {
						newMP.current = null;
					}
				}
			}

			const newIP = changed.system?.resources?.ip;
			const currentIP = this.system.resources.ip;
			if ( currentIP && 'ip' in changed.system?.resources ) {
				if ( typeof newIP?.current === 'string' ) {
					const IPvalue = parseInt( newIP.current, 10 );
					if ( !isNaN( IPvalue ) ) {
						if ( operators.includes( newIP.current[0] ) ) newIP.current = currentMP.current + currentIP;
					} else {
						newIP.current = null;
					}
				}
			}
		}

		await super._preUpdate( changed, options, userId );
	}

	async _onUpdate( changed, options, userId ) {
		
		if ( 'damageTaken' in options ) {
			this.showTokenDamage( options.damageTaken );
		}

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

	async showTokenDamage( value ) {
		if ( !canvas.scene ) return;

		const [ token ] = this.getActiveTokens();
		if ( token ) {
			const gridSize = canvas.scene.grid.size;
			const scrollingTextOptions = [
				{
					x: token.x + gridSize / 2,
					y: token.y + gridSize / 2,
				},
				value.signedString(),
				{
					anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
					fill: value > 0 ? '0x00FF00' : '0xFF0000',
					// Font size relative to damage taken
					fontSize: 16 + ( 32 * Math.clamp( Math.abs( value ) / this.system.resources.hp.max, 0.5, 1 ) ),
					stroke: 0x000000,
					strokeThickness: 4,
					jitter: 0.25,
				}
			];
			await token._animation;
			await canvas.interface?.createScrollingText( ...scrollingTextOptions );
		}
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

	async applyDamage( baseDamage, damageType = 'physical', ignoreResistances = false ) {
		const hp = this.system.resources?.hp;
		const affinity = this.system?.affinity?.[damageType];
		let multiplier = 1;
		
		if ( hp !== undefined && affinity !== undefined ) {
			if ( ignoreResistances === false ) {
				if ( affinity == 'vulnerability' ) multiplier = 2;
				if ( affinity == 'resistance' ) multiplier = .5;
				if ( affinity == 'immunity' ) multiplier = 0;
				if ( affinity == 'absorption' ) multiplier = -1;

				// Show NPC affinity in chat
				if ( this.type === 'npc' && affinity !== '' ) {
					const chatData = {
						user: game.user.id,
						speaker: ChatMessage.getSpeaker({ actor: chat.actor }),
						flavor: `Ha rivelato l'affinità a un tipo di danno: `,
						content: `${game.i18n.localize(`FU.DamageTypes.${damageType}`)} <i class="fa fa-fw fa-right-long"></i> ${game.i18n.localize(`FU.affinity.${affinity}`)}`,
					};
					ChatMessage.create(chatData);
				}
			}

			const newHp = hp.current - ( baseDamage * multiplier );
			await this.update({ 'system.resources.hp.current': newHp });
		}
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

	getAllItemsByFabulaID( id, type ) {
		const idFilter = (i) => i.system.fabulaID === id;
		if ( !type ) return this.items.filter( idFilter );
		const itemTypes = FU.ItemTypes;
		if ( !Object.prototype.hasOwnProperty.call( itemTypes, type ) ) {
			throw new Error( `Invalid item type: ${type}!` );
		}
		return ItemTypes[type].filter( idFilter );
	}

	getItemByFabulaID( id, type ) {
		return this.getAllItemsByFabulaID( id, type )[0];
	}

}