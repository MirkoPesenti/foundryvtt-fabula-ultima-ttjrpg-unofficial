import { FU } from "../../../helpers/config.mjs";

/**
 * @property {string} name
 * @property {string} bond1
 * @property {string} bond2
 * @property {string} bond3
 */
export class BondDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { StringField, BooleanField } = foundry.data.fields;
		return ({
			name: new StringField({ initial: '' }),
			bond1: new StringField({ initial: '', blank: true, choices: Object.keys(FU.bondType1) }),
			bond2: new StringField({ initial: '', blank: true, choices: Object.keys(FU.bondType2) }),
			bond3: new StringField({ initial: '', blank: true, choices: Object.keys(FU.bondType3) }),
		});
	}

	prepareData() {
		let bondStrength = 0;

		if ( this.bond1 != '' ) bondStrength++;
		if ( this.bond2 != '' ) bondStrength++;
		if ( this.bond3 != '' ) bondStrength++;

		this.strength = bondStrength;
	}
}