import { StatusDataModel } from "./status-data-model.mjs";

/**
 * @property {StatusDataModel} slow
 * @property {StatusDataModel} dazed
 * @property {StatusDataModel} weak
 * @property {StatusDataModel} shaken
 * @property {StatusDataModel} enraged
 * @property {StatusDataModel} poisoned
 */
export class StatusesDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { EmbeddedDataField } = foundry.data.fields;
		return ({
			slow: new EmbeddedDataField(StatusDataModel, {}),
			dazed: new EmbeddedDataField(StatusDataModel, {}),
			weak: new EmbeddedDataField(StatusDataModel, {}),
			shaken: new EmbeddedDataField(StatusDataModel, {}),
			enraged: new EmbeddedDataField(StatusDataModel, {}),
			poisoned: new EmbeddedDataField(StatusDataModel, {}),
		});
	}

	prepareData() {
		const actor = this.parent.actor;
		this.#prepareStatus(actor);
	}

	#prepareStatus(actor) {
		
		const dex = actor.system.resources.attributes.dex.value;
		const ins = actor.system.resources.attributes.ins.value;
		const mig = actor.system.resources.attributes.mig.value;
		const wlp = actor.system.resources.attributes.wlp.value;

		console.log( dex, ins, mig, wlp );
		console.log( this );

		// Status slow
		if ( this.slow.active && dex > 6 ) {
			actor.system.resources.attributes.dex.value -= 2;
		} else {
			this.slow.active = false;
		}

		// Status dazed
		if ( this.dazed.active && ins > 6 ) {
			actor.system.resources.attributes.ins.value -= 2;
		} else {
			this.dazed.active = false;
		}

		// Status weak
		if ( this.weak.active && mig > 6 ) {
			actor.system.resources.attributes.mig.value -= 2;
		} else {
			this.weak.active = false;
		}

		// Status shaken
		if ( this.shaken.active && wlp > 6 ) {
			actor.system.resources.attributes.wlp.value -= 2;
		} else {
			this.shaken.active = false;
		}

		// Status enraged
		if ( this.enraged.active && dex > 6 && ins > 6 ) {
			actor.system.resources.attributes.dex.value -= 2;
			actor.system.resources.attributes.ins.value -= 2;
		} else {
			this.enraged.active = false;
		}

		// Status poisoned
		if ( this.poisoned.active && wlp > 6 && mig > 6 ) {
			actor.system.resources.attributes.wlp.value -= 2;
			actor.system.resources.attributes.mig.value -= 2;
		} else {
			this.poisoned.active = false;
		}

		console.log( dex, ins, mig, wlp );
		console.log( this );

	}
}