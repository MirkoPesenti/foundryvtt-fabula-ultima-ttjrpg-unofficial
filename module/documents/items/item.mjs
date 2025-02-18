/**
 * Extend basic Item
 * @extends {Item}
 */

import { slugify } from "../../utilities.mjs";

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

		this.overrides = foundry.utils.expandObject(overrides);
		this.render();
	}

	*allApplicableEffects() {
		for ( const effect of this.effects ) {
			if ( effect.target === this ) {
				yield effect;
			}
		}
	}

	async regenerateFabulaID() {

		if ( !await Dialog.confirm({
			title: game.i18n.localize('FU.fabulaID.regenerate'),
			content: `
				<div class="warning">
					<p>${game.i18n.localize('FU.fabulaID.regenerateWarning')}</p>
					<p>${game.i18n.localize('FU.fabulaID.proceed')}</p>
				</div>
			`,
			defaultYes: true,
			rejectClose: false,
		}) ) return;

		const id = slugify( this.name );
		await this.update({ 'system.fabulaID': id });

		return id;
	}

}