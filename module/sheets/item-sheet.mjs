import { FU } from "../helpers/config.mjs";

/**
 * Extend basic ItemSheet
 * @extends {ItemSheet}
 */

export class FabulaItemSheet extends ItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['fabula', 'sheet', 'item', 'backgroundstyle'],
			width: 700,
			height: 700,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description', }],
		});
	}

	get template() {
		const path = 'systems/fabula/templates/item';
		return `${path}/item-${this.item.type}-sheet.hbs`;
	}

	async getData() {
		const context = super.getData();
		const itemData = context.item;

		context.system = itemData.system;
		context.flags = itemData.flags;

		//Add required CONFIG data
		context.attrAbbr = CONFIG.FU.attributeAbbreviations;
		context.damageTypes = CONFIG.FU.damageTypes;
		context.weaponTypes = CONFIG.FU.weaponTypes;
		context.miscCategories = CONFIG.FU.miscCategories;

		context.enrichedHtml = {
			description: await TextEditor.enrichHTML( context.system.description ?? '' )
		};

		context.FU = FU;

		return context;
	}

	activateListeners( html ) {
		super.activateListeners( html );

		if (!this.isEditable) return;
	}

	_getSubmitData( updateData = {} ) {
		const data = super._getSubmitData( updateData );
		const overrides = foundry.utils.flattenObject( this.item.overrides );

		for ( let key of Object.keys(overrides) ) {
			if ( key.startsWith('system.') )
				delete data[`data.${key.slice(7)}`];
			delete data[key];
		}

		return data;
	}

}