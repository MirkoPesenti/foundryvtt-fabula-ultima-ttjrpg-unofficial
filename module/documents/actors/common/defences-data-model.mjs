/**
 * @property {number} def.current
 * @property {number} def.bonus
 * @property {number} mdef.current
 * @property {number} mdef.bonus
 * @property {number} init.current
 * @property {number} init.bonus
 */
export class DefencesDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { SchemaField, NumberField } = foundry.data.fields;
		return ({
			def: new SchemaField({
				fixed: new NumberField({ initial: null, integer: true, nullable: true }),
				bonus: new NumberField({ initial: 0, integer: true, nullable: false }),
			}),
			mdef: new SchemaField({
				fixed: new NumberField({ initial: null, integer: true, nullable: true }),
				bonus: new NumberField({ initial: 0, integer: true, nullable: false }),
			}),
			init: new SchemaField({
				fixed: new NumberField({ initial: null, integer: true, nullable: true }),
				bonus: new NumberField({ initial: 0, integer: true, nullable: false }),
			}),
		});
	}

	prepareData() {
		const actor = this.parent.actor;
		this.#prepareDefenses(actor);
		this.#prepareInitiative(actor);
	}

	#prepareDefenses(actor) {
		const attributes = actor.system.attributes;
		const data = this;
		const equippedData = actor.system.equip;
		let equipDefBonus = 0;
		let equipMDefBonus = 0;

		if ( equippedData.armor ) {
			const item = actor.items.get( equippedData.armor );
			if ( item && item.type == 'armor' ) {
				if ( item.system.defBonus.def.isFixed ) {
					data.def.fixed = item.system.defBonus.def.value;
				} else {
					equipDefBonus += item.system.defBonus.def.value;
				}

				if ( item.system.defBonus.mdef.isFixed ) {
					data.def.fixed = item.system.defBonus.mdef.value;
				} else {
					equipMDefBonus += item.system.defBonus.mdef.value;
				}
			}
		}

		if ( equippedData.mainHand ) {
			const item = actor.items.get( equippedData.mainHand );
			if ( item && item.type == 'shield' ) {
				if ( data.def.fixed ) {
					data.def.fixed += item.system.defenseBonus;
				} else {
					equipDefBonus += item.system.defenseBonus;
				}

				if ( data.mdef.fixed ) {
					data.mdef.fixed += item.system.magicDefenseBonus;
				} else {
					equipMDefBonus += item.system.magicDefenseBonus;
				}
			}
		}

		if ( equippedData.offHand ) {
			const item = actor.items.get( equippedData.offHand );
			if ( item && item.type == 'shield' ) {
				if ( data.def.fixed ) {
					data.def.fixed += item.system.defenseBonus;
				} else {
					equipDefBonus += item.system.defenseBonus;
				}

				if ( data.mdef.fixed ) {
					data.mdef.fixed += item.system.magicDefenseBonus;
				} else {
					equipMDefBonus += item.system.magicDefenseBonus;
				}
			}
		}

		let calculateDef = () => {
			return attributes.dex.current + data.def.bonus + equipDefBonus;
		}
		let calculateMDef = () => {
			return attributes.ins.current + data.mdef.bonus + equipMDefBonus;
		}

		Object.defineProperty(this.def, 'value', {
			configurable: true,
			enumerable: true,
			get: calculateDef,
			set( newVal ) {
				delete this.value;
				this.value = newVal;
			}
		});

		Object.defineProperty(this.mdef, 'value', {
			configurable: true,
			enumerable: true,
			get: calculateMDef,
			set( newVal ) {
				delete this.value;
				this.value = newVal;
			}
		});
	}

	#prepareInitiative(actor) {
		const data = this;
		const equippedData = actor.system.equip;
		let initBonus = 0;

		if ( equippedData.armor ) {
			const item = actor.items.get( equippedData.armor );
			if ( item && item.type == 'armor' ) {
				initBonus += item.system.initiativeMalus;
			}
		}

		Object.defineProperty(this.init, 'value', {
			configurable: true,
			enumerable: true,
			get() {
				let init = 0;
				if ( actor.type == 'npc' ) {
					const rankBonus = actor.system.rank.value != 'soldier' ? actor.system.rank.replacedSoldiers : 0;
					init += data.init.bonus + ( ( actor.system.attributes.dex.base + actor.system.attributes.ins.base ) / 2 ) + rankBonus + initBonus;
				} else {
					init += data.init.bonus + initBonus;
				}
				return init;
			},
			set(newVal) {
				delete this.value;
				this.value = newVal;
			}
		});
	}
}