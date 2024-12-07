import { FU } from "../helpers/config.mjs";
import { changeProjectProgress } from "../helpers/effects.mjs";

function returnSortedPack( packId, itemType ) {
	const pack = game.packs.get( packId );
	const sortedPack = pack.index.contents.sort( ( a, b ) => a.name.localeCompare(b.name) );

	const items = Array.from(
		sortedPack.reduce((acc, item) => {
			if ( item.type == itemType ) {
				if ( !acc.has( item.folder ) ) {
					const foundFolder = pack.folders.find( folder => folder._id === item.folder );
					acc.set( item.folder, { folder: foundFolder.name, items: [] } );
				}

				acc.get( item.folder ).items.push( item );
			}
			return acc;
		}, new Map()).values()
	);

	const sortedItemsList = items.sort((a, b) => {
		if ( a.folder === game.i18n.localize('FU.sourcebook.base') ) return -1;
		if ( b.folder === game.i18n.localize('FU.sourcebook.base') ) return 1;

		return a.folder.localeCompare(b.folder);
	});

	return sortedItemsList;
}

/**
 * Extend basic ItemSheet
 * @extends {ItemSheet}
 */

export class FabulaItemSheet extends ItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['fabula', 'sheet', 'item'],
			width: 700,
			tabs: [{ 
				navSelector: '.sheet-tabs', 
				contentSelector: '.sheet-body', 
				initial: 'description', 
			}],
		});
	}

	render( force = false, options = {} ) {
		if ( 
			this.object.type == 'class' || 
			this.object.type == 'rule' 
		)
			options.height = 700;
		else if ( 
			this.object.type == 'classFeature' || 
			this.object.type == 'arcanum' || 
			this.object.type == 'heroicSkill' || 
			this.object.type == 'spell' 
		)
			options.height = 500;
		else if ( 
			this.object.type == 'shield' ||
			this.object.type == 'armor'
		)
			options.height = 300;

		super.render(force, options);
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

		// Add required CONFIG data
		context.sourcebook = CONFIG.FU.sourcebook;
		context.ItemTypes = CONFIG.FU.ItemTypes;
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

		context.enrichedHtml = {
			summary: await TextEditor.enrichHTML( context.system.summary ?? '' ),
			description: await TextEditor.enrichHTML( context.system.description ?? '' ),
			opportunity: await TextEditor.enrichHTML( context.system.opportunityEffect ?? '' ),
			projectCondition: await TextEditor.enrichHTML( context.system.bonus?.projects?.condition ?? '' ),
		};
		
		// Add list of items sorted by packs to CONFIG data
		context.itemLists = {
			class: returnSortedPack( 'fabula.classes', 'class' ),
			spell: returnSortedPack( 'fabula.spells', 'spell' ),
			heroicSkill: returnSortedPack( 'fabula.heroicskill', 'heroicSkill' ),
		}

		context.FU = FU;

		// Add class to Sheet based of Item sourcebook
		const sourcebookClass = context.item.system.sourcebook;
		if ( sourcebookClass ) {
			itemData._sheet.options.classes.splice(-1);
			itemData._sheet.options.classes.push(sourcebookClass);
			itemData._sheet.render(true);
		}

		return context;
	}

	activateListeners( html ) {
		super.activateListeners( html );

		// html.on('click', '.projectProgressBtnMinus', (e) => changeProjectProgress( e, this.object, false ));
		// html.on('click', '.projectProgressBtnPlus', (e) => changeProjectProgress( e, this.object ));

		html.on('drop', this._onDropItem.bind(this));
		html.on('click', '.removeFeature', this._removeClassFeature.bind(this));

		html.on('click', '.js_newEntryToArray', async (ev) => {
			ev.preventDefault();
			const string = $(ev.currentTarget).data('target'); 
			const array = string.split('.').reduce((obj, key) => obj?.[key], this.item);
			const newArray = [...array];
			newArray.push('');
			await this.item.update({ [string]: newArray });
		});
		html.on('click', '.js_removeLastToArray', async (ev) => {
			ev.preventDefault();
			const string = $(ev.currentTarget).data('target'); 
			const array = string.split('.').reduce((obj, key) => obj?.[key], this.item);
			const newArray = [...array];
			newArray.splice( newArray.length - 1 ,1 );
			await this.item.update({ [string]: newArray });
		});

		html.on('click', '.js_changeImage', async (ev) => {
			const input = ev.currentTarget.previousElementSibling;
			new FilePicker({
				type: 'image',
				callback: async (path) => {
					input.value = path;
					input.dispatchEvent( new Event('change') );
					await this.item.update({ "system.art.src": path });
				},
				current: input.value,
			}).render(true);
		});

		html.on('click', '.js_editHeroicSkillReq', async (ev) => {
			const context = await this.getData();
			let options = '';
			if ( context.itemLists.class.length > 0 ) {
				const twoOrMoreChecked = context.item.system.requirements.multiClass ? true : false;
				options += `
					<div class="flexrow">
						<div class="form-group w-100">
							<input type="checkbox" name="formHeroicSkill_twoOrMore" id="twoOrMore" ${twoOrMoreChecked ? 'checked' : ''} />
							<label for="twoOrMore">Devi padroneggiare <strong>due o più</strong> Classi</label>
						</div>
						<div class="form-group w-100">
							<label for="heroicSkill_level">Livello minimo da raggiungere</label>
							<input type="number" name="formHeroicSkill_level" id="heroicSkill_level" value="${context.item.system.requirements.level}" />
						</div>
					</div>
				`;
				for ( let i = 0; i < context.itemLists.class.length; i++ ) {
					options += `<div class="title">${context.itemLists.class[i].folder}</div>`;
					if ( context.itemLists.class[i].items.length > 0 ) {
						options += '<div class="flexrow">';
						for ( let a = 0; a < context.itemLists.class[i].items.length; a++ ) {
							const checked = context.item.system.requirements.class.includes( context.itemLists.class[i].items[a].name );
							options += `
								<div class="form-group">
									<input type="checkbox" name="formHeroicSkill_Class" id="${context.itemLists.class[i].items[a]._id}" value="${context.itemLists.class[i].items[a].name}" ${checked ? 'checked' : ''} />
									<label for="${context.itemLists.class[i].items[a]._id}">${context.itemLists.class[i].items[a].name}</label>
								</div>
							`;
						}
						options += '</div>';
					}
				}
			}
			new Dialog({
				title: 'Scegli i prerequisiti',
				content: `
					<div class="form-checks">
						${options}
					</div>
				`,
				buttons: {
					cancel: {
						label: 'Annulla',
					},
					confirm: {
						label: 'Conferma',
						callback: async (dialogHtml) => {
							const multiClass = dialogHtml.find('input[name="formHeroicSkill_twoOrMore"]:checked');
							if ( multiClass.length > 0 ) {
								await context.item.update({ 'system.requirements.multiClass': true });
							} else {
								await context.item.update({ 'system.requirements.multiClass': false });
							}
							
							const level = dialogHtml.find('input[name="formHeroicSkill_level"]').val();
							if ( level >= 0 ) {
								await context.item.update({ 'system.requirements.level': level });
							}

							const inputs = dialogHtml.find('input[name="formHeroicSkill_Class"]:checked');
							const classes = [];
							for ( let i = 0; i < inputs.length; i++ ) {
								classes.push( $(inputs[i]).val() );
							}
							await context.item.update({ 'system.requirements.class': classes });

							const pack = game.packs.get('fabula.classes');
							let featureOptions = `
								<div class="form-group">
									<select name="formHeroicSkill_ClassFeature" multiple>
										<option value="">Nessuna</option>`;
							
							for ( let i = 0; i < inputs.length; i++ ) {
								featureOptions += '<option disabled>──────────</option>';
								const document = await pack.getDocument( $(inputs[i]).attr('id') );
								const features = document.flags.fabula.subItems;

								for ( let a = 0; a < features.length; a++ ) {
									const selected = context.item.system.requirements.classFeature.includes( features[a].name );
									featureOptions += `<option value="${features[a].name}" ${selected ? 'selected' : ''}>${features[a].name}</option>`;
								}
							}
							featureOptions += `
									</select>
								</div>`;
							const allClassFeatures = context.item.system.requirements.multiClassFeature ? true : false;

							new Dialog({
								title: 'Scegli un eventuale abilità presequisita',
								content: `
									<div class="flexrow">
										<div class="form-group">
											<input type="checkbox" name="formHeroicSkill_classFeatureMultiple" id="classFeatureMultiple" ${allClassFeatures ? 'checked' : ''} />
											<label for="classFeatureMultiple">Devi aver acquisito tutte le abilità selezionate</label>
										</div>
										<div class="form-group w-100">
											<label for="heroicSkill_featureLevel">Livello minimo da raggiungere</label>
											<input type="number" name="formHeroicSkill_featureLevel" id="heroicSkill_featureLevel" value="${context.item.system.requirements.classFeatureLevel}" />
										</div>
										<div class="form-group form-checks w-100">
											${featureOptions}
										</div>
									</div>
								`,
								buttons: {
									calcel: {
										label: 'Annulla',
									},
									confirm: {
										label: 'Conferma',
										callback: async (dialogChildHtml) => {
											const choosedFeature = dialogChildHtml.find('[name="formHeroicSkill_ClassFeature"]').val() ? dialogChildHtml.find('[name="formHeroicSkill_ClassFeature"]').val() : [];
											await context.item.update({ 'system.requirements.classFeature': choosedFeature });

											const featureLevel = dialogChildHtml.find('input[name="formHeroicSkill_featureLevel"]').val();
											if ( featureLevel >= 0 ) {
												await context.item.update({ 'system.requirements.classFeatureLevel': featureLevel });
											}

											const multiClassFeature = dialogChildHtml.find('input[name="formHeroicSkill_classFeatureMultiple"]:checked');
											if ( multiClassFeature.length > 0 ) {
												await context.item.update({ 'system.requirements.multiClassFeature': true });
											} else {
												await context.item.update({ 'system.requirements.multiClassFeature': false });
											}

											let spellOptions = '';
											if ( context.itemLists.spell.length > 0 ) {
												for ( let i = 0; i < context.itemLists.spell.length; i++ ) {
													spellOptions += `<div class="title">${context.itemLists.spell[i].folder}</div>`;
													if ( context.itemLists.spell[i].items.length > 0 ) {
														spellOptions += '<div class="flexrow">';
														for ( let a = 0; a < context.itemLists.spell[i].items.length; a++ ) {
															const checked = context.item.system.requirements.spell.includes( context.itemLists.spell[i].items[a].name );
															spellOptions += `
																<div class="form-group">
																	<input type="checkbox" name="formHeroicSkill_singleSpell" id="${context.itemLists.spell[i].items[a]._id}" value="${context.itemLists.spell[i].items[a].name}" ${checked ? 'checked' : ''} />
																	<label for="${context.itemLists.spell[i].items[a]._id}">${context.itemLists.spell[i].items[a].name}</label>
																</div>
															`;
														}
														spellOptions += '</div>';
													}
												}
											}

											new Dialog({
												title: 'Scegli un eventuale incantesimo presequisito',
												content: `
													<div class="flexrow">
														<div class="form-group w-100">
															<label for="heroicSkill_spells">Numero minimo di incantesimi offensivi</label>
															<input type="number" name="formHeroicSkill_spells" id="heroicSkill_spells" value="${context.item.system.requirements.offensiveSpells}" />
														</div>
													</div>
													<div class="form-checks">
														${spellOptions}
													</div>
												`,
												buttons: {
													cancel: {
														label: 'Annulla',
													},
													confirm: {
														label: 'Conferma',
														callback: async (dialogSpellHtml) => {
															const offensiveSpells = dialogSpellHtml.find('input[name="formHeroicSkill_spells"]').val();
															if ( offensiveSpells >= 0 ) {
																await context.item.update({ 'system.requirements.offensiveSpells': offensiveSpells });
															}

															const inputs = dialogSpellHtml.find('input[name="formHeroicSkill_singleSpell"]:checked');
															const spells = [];
															for ( let i = 0; i < inputs.length; i++ ) {
																spells.push( $(inputs[i]).val() );
															}
															await context.item.update({ 'system.requirements.spell': spells });
														},
													},
												},
											}).render(true);
										}
									},
								},
							}).render(true);
						},
					},
				},
			}).render(true);
		});

		if (!this.isEditable) return;
	}

	_getSubmitData( updateData = {} ) {
		const data = super._getSubmitData( updateData );
		
		if ( data['system.type.value'] ) {
			const typeImages = {
				chimerism: 'systems/fabula/assets/icons/classes/chimerist.png',
				elementalism: 'systems/fabula/assets/icons/classes/elementalist.png',
				entropism: 'systems/fabula/assets/icons/classes/entropist.png',
				spiritism: 'systems/fabula/assets/icons/classes/spiritist.png'
			};
			data['img'] = typeImages[data['system.type.value']];
		}
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

			await sourceItem.update({ 'system.origin': targetItem._id });

			// Update Class
			subItems.push(sourceItem.toObject());
			subItems.sort((a, b) => {
				return a.name.localeCompare(b.name);
			});

			await targetItem.setFlag('fabula', 'subItems', subItems);
			ui.notifications.info(`Oggetto ${sourceItem.name} aggiunto a ${targetItem.name}.`);

		} else if ( targetItem.type == 'heroicSkill' ) {

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

			// Check if item is a Spell
			if ( sourceItem.type != 'spell' ) {
				ui.notifications.error("Puoi trascinare solo Incantesimi.");
				return;
			}

			const spells = [];
			await sourceItem.update({ 'system.origin': targetItem._id });

			// Update Heroic Skill
			spells.push(sourceItem.toObject());
			spells.sort((a, b) => {
				return a.name.localeCompare(b.name);
			});

			await targetItem.setFlag('fabula', 'spells', spells);
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