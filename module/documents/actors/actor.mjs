import { SYSTEM } from "../../helpers/config.mjs";

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

	applyActiveEffects() {
		if (this.system.prepareEmbeddedData instanceof Function) {
			this.system.prepareEmbeddedData();
		}
		return super.applyActiveEffects();
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

}