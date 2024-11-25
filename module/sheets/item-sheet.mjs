import { FU } from "../helpers/config.mjs";
import { changeProjectProgress } from "../helpers/effects.mjs";

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
		context.attributes = CONFIG.FU.attributes;
		context.attributesAbbr = CONFIG.FU.attributesAbbr;
		context.DamageTypes = CONFIG.FU.DamageTypes;
		context.WeaponRanges = CONFIG.FU.WeaponRanges;
		context.weaponCategories = CONFIG.FU.weaponCategories;
		context.SpellDurations = CONFIG.FU.SpellDurations;
		context.SpellDisciplines = CONFIG.FU.SpellDisciplines;
		context.potencyList = CONFIG.FU.potencyList;
		context.areaList = CONFIG.FU.areaList;
		context.usesList = CONFIG.FU.usesList;
		context.rarityList = CONFIG.FU.rarityList;
		context.martialItems = CONFIG.FU.martialItems;

		context.enrichedHtml = {
			description: await TextEditor.enrichHTML( context.system.description ?? '' ),
			opportunity: await TextEditor.enrichHTML( context.system.opportunityEffect ?? '' ),
		};

		context.FU = FU;

		return context;
	}

	activateListeners( html ) {
		super.activateListeners( html );

		html.on('click', '.projectProgressBtnMinus', (e) => changeProjectProgress( e, this.object, false ));
		html.on('click', '.projectProgressBtnPlus', (e) => changeProjectProgress( e, this.object ));

		html.on('drop', this._onDropItem.bind(this));
		html.on('click', '.removeFeature', this._removeClassFeature.bind(this));

		html.on('click', '.add-ritualType', async (ev) => {
			ev.preventDefault();
			const ritualType = this.item.system.bonus.ritualType;
			const newRitualTypes = [...ritualType];
			newRitualTypes.push('');
			await this.item.update({ 'system.bonus.ritualType': newRitualTypes });
		});

		html.on('click', '.add-weaponType', async (ev) => {
			ev.preventDefault();
			const weaponType = this.item.system.bonus.weaponType;
			const newWeaponTypes = [...weaponType];
			newWeaponTypes.push('');
			await this.item.update({ 'system.bonus.weaponType': newWeaponTypes });
		});

		html.on('click', '.add-question', async (ev) => {
			ev.preventDefault();
			const questions = this.item.system.questions;
			const newQuestionss = [...questions];
			newQuestionss.push('');
			await this.item.update({ 'system.questions': newQuestionss });
		});

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

	async _onDropItem(event) {
		event.preventDefault();
		const data = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));
		const targetItem = this.item;

		if ( targetItem.type == 'class' ) {
			// Check if dropped element is Item
			if ( data.type !== 'Item' ) {
				ui.notifications.warn('Puoi trascinare solo oggetti.');
				return;
			}

			// Check if Item is found
			const sourceItem = await fromUuid(data.uuid);
			if ( !sourceItem ) {
				ui.notifications.error("Impossibile trovare l'oggetto trascinato.");
				return;
			}

			// Check if item is a Class Feature
			if ( sourceItem.type != 'classFeature' ) {
				ui.notifications.error("Puoi trascinare solo Abilità di classe.");
				return;
			}

			// Check if Class has already 5 features
			const subItems = targetItem.getFlag('fabula', 'subItems') || [];
			if ( subItems.length == 5 ) {
				ui.notifications.warn('Il numero massimo è già stato raggiunto.');
				return;
			}

			// Check if Class featured is duplicated
			let alreadyExist = false;
			for (let i = 0; i < subItems.length; i++) {
				if ( subItems[i]._id == sourceItem._id ) {
					alreadyExist = true;
					break;
				}
			}
			if ( alreadyExist ) {
				ui.notifications.error(`L'item ${sourceItem.name} è già allegato all'item ${targetItem.name}!`);
				return;
			}

			// Update Class
			subItems.push(sourceItem.toObject());
			await targetItem.setFlag('fabula', 'subItems', subItems);
			ui.notifications.info(`Oggetto ${sourceItem.name} aggiunto a ${targetItem.name}.`);
		}
	}

	async _removeClassFeature(event) {
		event.preventDefault();
		const targetItem = this.item;
		const subItems = targetItem.getFlag('fabula', 'subItems') || [];
		const itemToBeRemoved = event.currentTarget.getAttribute('data-id');
		let removed = false;
		for (let i = 0; i < subItems.length; i++) {
			if ( subItems[i]._id == itemToBeRemoved ) {
				subItems.splice(i, 1);
				removed = true;
				break;
			}
		}
		
		await targetItem.setFlag('fabula', 'subItems', subItems);

		if ( removed ) 
			ui.notifications.info(`L'elemento è stato eliminato.`);
		else
			ui.notifications.error(`Non è stato possibili completare l'azione.`);
	}

}