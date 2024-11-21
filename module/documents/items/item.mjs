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

}