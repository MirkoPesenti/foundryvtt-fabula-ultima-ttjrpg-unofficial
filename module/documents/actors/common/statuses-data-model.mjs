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
}