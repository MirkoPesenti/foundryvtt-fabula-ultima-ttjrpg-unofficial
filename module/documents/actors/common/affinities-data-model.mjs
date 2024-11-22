import { FU } from "../../../helpers/config.mjs";

/**
 * @property {string} physical
 * @property {string} air
 * @property {string} bolt
 * @property {string} dark
 * @property {string} earth
 * @property {string} fire
 * @property {string} ice
 * @property {string} light
 * @property {string} poison
 */
export class AffinitiesDataModel extends foundry.abstract.DataModel {
	static defineSchema() {
		const { StringField } = foundry.data.fields;
		return ({
			physical: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) }),
			air: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) }),
			bolt: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) }),
			dark: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) }),
			earth: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) }),
			fire: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) }),
			ice: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) }),
			light: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) }),
			poison: new StringField({ initial: '', blank: true, choices: Object.keys(FU.affinity) })
		});
	}
}