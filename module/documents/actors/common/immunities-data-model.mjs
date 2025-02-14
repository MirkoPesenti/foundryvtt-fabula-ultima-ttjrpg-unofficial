
/**
 * @property {boolean} slow
 * @property {boolean} dazed
 * @property {boolean} weak
 * @property {boolean} shaken
 * @property {boolean} enraged
 * @property {boolean} poisoned
 */
export class ImmunitiesDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { BooleanField } = foundry.data.fields;
		return ({
			slow: new BooleanField({ initial: false, }),
			dazed: new BooleanField({ initial: false, }),
			weak: new BooleanField({ initial: false, }),
			shaken: new BooleanField({ initial: false, }),
			enraged: new BooleanField({ initial: false, }),
			poisoned: new BooleanField({ initial: false, }),
		});
	}
}