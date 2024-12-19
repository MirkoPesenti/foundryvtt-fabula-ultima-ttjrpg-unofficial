/**
 * Extend basic Item
 * @extends {Item}
 */

export class FabulaItem extends Item {

	overrides = this.overrides ?? {};

	/**
	 * Augment basic Item data model
	 */
	prepareData() {
		super.prepareData();
	}

	applyActiveEffects() {
		const overrides = {};

		const changes = [];
		for ( const effect of this.allApplicableEffects() ) {
			if ( !effect.active ) return;
			changes.push(...effect.changes.map((el) => {
				const change = foundry.utils.deepClone(el);
				change.effect = effect;
				change.order = change.priority ?? change.mode * 10;
				return change;
			}),);
		}

		changes.sort((a, b) => a.order - b.order);

		for ( let change of changes ) {
			if ( !change.key ) continue;
			const c = change.effect.apply(this, change);
			Object.assign(overrides, c);
		}

		this.overrides = foundry.utils.expandedObject(overrides);
		this.render();
	}

	*allApplicableEffects() {
		for ( const effect of this.effects ) {
			if ( effect.target === this ) {
				yield effect;
			}
		}
	}

}