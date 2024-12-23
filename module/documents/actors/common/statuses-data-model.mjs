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

		// Status slow
		if ( this.slow.active && actor.system.attributes.dex.current > 6 ) {
			actor.system.attributes.dex.current -= 2;
		}

		// Status dazed
		if ( this.dazed.active && actor.system.attributes.ins.current > 6 ) {
			actor.system.attributes.ins.current -= 2;
		}

		// Status weak
		if ( this.weak.active && actor.system.attributes.mig.current > 6 ) {
			actor.system.attributes.mig.current -= 2;
		}

		// Status shaken
		if ( this.shaken.active && actor.system.attributes.wlp.current > 6 ) {
			actor.system.attributes.wlp.current -= 2;
		}

		// Status enraged
		if ( this.enraged.active ) {
			if ( actor.system.attributes.dex.current > 6 )
				actor.system.attributes.dex.current -= 2;

			if ( actor.system.attributes.ins.current > 6 )
			actor.system.attributes.ins.current -= 2;
		}

		// Status poisoned
		if ( this.poisoned.active ) {
			if ( actor.system.attributes.wlp.current > 6 )
				actor.system.attributes.wlp.current -= 2;

			if ( actor.system.attributes.mig.current > 6 )
				actor.system.attributes.mig.current -= 2;
		}

	}
}