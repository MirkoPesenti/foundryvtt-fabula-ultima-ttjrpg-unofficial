import { FU } from "../helpers/config.mjs";
import { returnSortedPack, setProgress } from "../helpers/helpers.mjs";
import { prepareActiveEffect, manageActiveEffect } from "../helpers/effects.mjs";
import { AlchemyListeners } from "../documents/items/classFeatures/tinkerer/alchemy-data-model.mjs";

/**
 * Extend basic ItemSheet
 * @extends {ItemSheet}
 */

export class FabulaItemSheet extends ItemSheet {

	static MODES = {
		PLAY: 1,
		EDIT: 2,
	};
	_mode = null;

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

	async _render( force = false, { mode, ...options } = {} ) {
		if ( mode === undefined && options.renderContext === 'createItem' ) {
			mode = this.constructor.MODES.EDIT;
		}
		// this._mode = mode ?? this._mode ?? this.constructor.MODES.PLAY;
		this._mode = mode ?? this._mode ?? this.constructor.MODES.EDIT
		if ( this.rendered ) {
			const toggler = this.element[0].querySelector('.window-header .editable-slider');
			toggler.checked = this._mode === this.constructor.MODES.EDIT;
		}

		// Set the default sheet height
		if ( 
			this.object.type == 'class' || 
			this.object.type == 'rule' || 
			this.object.type == 'alchemy'
		)
			options.height = 700;
		else if (
			this.object.type == 'arcanum'
		)
			options.height = 600;
		else if ( 
			this.object.type == 'classFeature' || 
			this.object.type == 'heroicSkill' || 
			this.object.type == 'spell' ||
			this.object.type == 'baseItem' ||
			this.object.type == 'attack' ||
			this.object.type == 'weapon' ||
			this.object.type == 'artifact' ||
			this.object.type == 'shield' ||
			this.object.type == 'armor' ||
			this.object.type == 'accessory' ||
			this.object.type == 'consumable' ||
			this.object.type == 'ritual' ||
			this.object.type == 'skill' 
		)
			options.height = 500;
		else
			options.height = 300;

		return super._render(force, options);
	}

	async _renderOuter() {
		const html = await super._renderOuter();
		const header = html[0].querySelector('.window-header');

		// Edit header buttons
		header.querySelectorAll('.header-button').forEach(button => {
			const label = button.querySelector(':scope > i').nextSibling;
			button.dataset.tooltip = label.textContent;
			button.setAttribute('aria-label', label.textContent);
			button.addEventListener('dblclick', e => e.stopPropagation());
			label.remove();
		});

		// Add edit toggle
		if ( this.isEditable ) {
			const toggler = document.createElement('input');
			toggler.type = 'checkbox';
			toggler.checked = this._mode === this.constructor.MODES.EDIT;
			toggler.classList.add('editable-slider');
			toggler.dataset.tooltip = 'FU.SheetModePlay';
			toggler.setAttribute('aria-label', game.i18n.localize('FU.SheetModePlay'));
			toggler.addEventListener('click', this._onToggleEditable.bind(this));
			toggler.addEventListener('dblclick', e => e.stopPropagation());
			header.insertAdjacentElement('afterbegin', toggler);
		}
		

		// Add UUID Link
		const firstButton = header.querySelector('.header-button');
		const UUIDlink = header.querySelector('.document-id-link');
		if (  UUIDlink ) {
			firstButton?.insertAdjacentElement('beforebegin', UUIDlink);
			UUIDlink.classList.add('pseudo-header-button');
			UUIDlink.dataset.tooltipDirection = 'DOWN';
		}
		
		return html;
	}

	async _onToggleEditable(event) {
		const { MODES } = this.constructor;
		const toggler = event.currentTarget;
		const label = game.i18n.localize('FU.SheetModeEdit');
		toggler.dataset.tooltip = label;
		toggler.setAttribute('aria-label', label);
		this._mode = toggler.checked ? MODES.EDIT : MODES.PLAY;

		await this.submit();
		this.render();
	}

	get template() {
		const path = 'systems/fabula/templates/item';
		return `${path}/item-${this.item.type}-sheet.hbs`;
	}

	async getData() {
		const context = super.getData();
		const itemData = context.item;

		context.editable = this.isEditable && this._mode === this.constructor.MODES.EDIT;
		context.cssClass = context.editable ? 'editable' : ( this.editable ? 'interactable' : 'locked' );

		context.system = itemData.system;
		context.flags = itemData.flags;

		await this._prepareFlags(context);
		
		// Add required CONFIG data
		context.sourcebook = CONFIG.FU.sourcebook;
		context.ItemTypes = CONFIG.FU.ItemTypes;
		context.attributes = CONFIG.FU.attributes;
		context.attributesAbbr = CONFIG.FU.attributesAbbr;
		context.attributesAbbrRitualChimerism = CONFIG.FU.attributesAbbrRitualChimerism;
		context.DamageTypes = CONFIG.FU.DamageTypes;
		context.WeaponRanges = CONFIG.FU.WeaponRanges;
		context.weaponCategories = CONFIG.FU.weaponCategories;
		context.SpellDurations = CONFIG.FU.SpellDurations;
		context.SpellDisciplines = CONFIG.FU.SpellDisciplines;
		context.MagicDisciplines = CONFIG.FU.MagicDisciplines;
		context.potencyList = CONFIG.FU.potencyList;
		context.areaList = CONFIG.FU.areaList;
		context.usesList = CONFIG.FU.usesList;
		context.rarityList = CONFIG.FU.rarityList;
		context.consumableType = CONFIG.FU.consumableType;
		context.recoverResources = CONFIG.FU.recoverResources;
		context.statusses = CONFIG.FU.statusses;
		context.groupedClasses = CONFIG.FU.groupedClasses;
		context.featureSubtype = CONFIG.FU.featureSubtype;
		context.groupedFeatureSubtype = CONFIG.FU.groupedFeatureSubtype;
		context.statusEffects = CONFIG.FU.statusEffects;
		context.technologiesRank = CONFIG.FU.technologiesRank;

		// Add listed features to context
		if ( context.system?.features?.length > 0 ) {
			let features = [];
			for ( const id of context.system.features ) {
				let item = game.items.get( id );
				if ( item ) {
					features.push( item );
					continue;
				}

				for ( const pack of game.packs ) {
					if ( pack.documentName === 'Item' ) {
						item = await pack.getDocument( id );
						if ( item ) {
							features.push( item );
							break;
						}
					}
				}
			}
			context.embeddedFeatures = features;
			for ( const feature of context.embeddedFeatures ) {
				feature.enrichedHtml = {
					description: await TextEditor.enrichHTML( feature.system.description ?? '' ),
				};
			}
		}

		// Enrich HTML fields
		context.enrichedHtml = {};
		async function enrichHtmlFields( obj, path = [] ) {
			for ( const [key, field] of Object.entries(obj) ) {
				const currentPath = [...path, key];

				if ( field instanceof foundry.data.fields.HTMLField ) {

					// HTMLField
					const propertyPath = currentPath.join('.');
					const value = foundry.utils.getProperty(context.system, propertyPath);
					context.enrichedHtml[propertyPath] = await TextEditor.enrichHTML( value ?? '' );

				} else if ( field instanceof foundry.data.fields.SchemaField ) {

					// SchemaField
					await enrichHtmlFields( field.fields, currentPath );

				} else if ( field instanceof foundry.data.fields.ArrayField && field.element instanceof foundry.data.fields.SchemaField ) {

					// ArrayField
					const arrayData = foundry.utils.getProperty(context.system, currentPath.join('.'));
					if ( Array.isArray( arrayData ) ) {
						for ( let i = 0; i < arrayData.length; i++ ) {
							await enrichHtmlFields( field.element.fields, [...currentPath, i.toString()] );
						}
					}

				}
			}
		}
		const itemType = this.item.type;
		const dataModelClass = CONFIG.Item.dataModels?.[itemType];
		const schema = dataModelClass?.defineSchema?.();
		await enrichHtmlFields( schema );
		
		// Add list of items sorted by packs to CONFIG data
		context.itemLists = {
			class: returnSortedPack( 'fabula.classes', 'class' ),
			spell: returnSortedPack( 'fabula.spells', 'spell' ),
			heroicSkill: returnSortedPack( 'fabula.heroicskill', 'heroicSkill' ),
			arcanum: returnSortedPack( 'fabula.arcanum', 'arcanum' ),
		}

		context.effects = await prepareActiveEffect(this.item.effects);
		context.allEffects = [...context.effects.temporary.effects, ...context.effects.passive.effects, ...context.effects.inactive.effects];

		for ( const effect of context.allEffects ) {
			effect.enrichedDescription = effect.description ? await TextEditor.enrichHTML(effect.description) : '';
		}

		context.FU = FU;

		return context;
	}

	activateListeners( html ) {
		super.activateListeners( html );

		// Debug Item
		html.on('click','.getItem', async (ev) => {
		// 	ev.preventDefault();
		// 	const flags = this.item.flags;
        // for (const scope in flags) {
        //     for (const key in flags[scope]) {
        //         await this.item.unsetFlag(scope, key);
        //     }
        // }
			console.log(this.item)
		});

		// Regenerate Fabula ID
		html.on('click', '.js_regenerateFabulaID', async (ev) => {
			ev.preventDefault();
			const newID = await this.item.regenerateFabulaID();
			if ( newID ) {
				this.render();
			}
		});

		// Manage Active Effects
		html.on('click','.js_manageActiveEffect', (e) => manageActiveEffect(e, this.item));

		// Remove element from array by index
		html.on('click', '.js_removeFromArray', async (ev) => {
			ev.preventDefault();
			const item = this.item;
			const index = ev.currentTarget.dataset.index;
			const property = ev.currentTarget.dataset.prop;
			
			if ( index && property ) {
				const array = foundry.utils.getProperty( item, property );
				const newArray = [...array];
				newArray.splice( index, 1 );
				await item.update({ [property]: newArray });
			}
		});

		html.on('drop', this._onDropItem.bind(this));
		html.on('click', '.removeFeature', this._removeClassFeature.bind(this));

		// Set Progress current value
		html.on('click','.js_setProgress', async (e) => {
			e.preventDefault();
			const increase = e.currentTarget.dataset.increase;
			const value = e.currentTarget.dataset.value;
			if ( value ) {
				await setProgress( this.item, Number(value) );
			}
			if ( increase ) {
				await setProgress( this.item, null, Number(increase) );
			}
		});

		html.on('click', '.js_newEntryToArray', async (ev) => {
			ev.preventDefault();
			const string = $(ev.currentTarget).data('target'); 
			const array = string.split('.').reduce((obj, key) => obj?.[key], this.item);
			const newArray = [...array];
			newArray.push('');
			await this.item.update({ [string]: newArray });
			this.item.render();
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

		html.on('click', '.js_removeFromArray', async (ev) => {
			ev.preventDefault();
			const item = this.item;
			const index = ev.currentTarget.dataset.index;
			const arrayProp = ev.currentTarget.dataset.target;

			if ( index && arrayProp ) {
				const updateObj = `system.${arrayProp}`;
				const array = updateObj.split('.').reduce((obj, key) => obj?.[key], item);
				const newArray = [...array];
				
				newArray.splice( index, 1 );
				await item.update({ [updateObj]: newArray });
			}
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
								const document = await pack.getDocument( $(inputs[i]).attr('id') );
								const features = document.flags.fabula.subItems;
								
								featureOptions += `<optgroup label="${document.name}">`;
								for ( let a = 0; a < features.length; a++ ) {
									const selected = context.item.system.requirements.classFeature.includes( features[a].name );
									featureOptions += `<option value="${features[a].name}" ${selected ? 'selected' : ''}>${features[a].name}</option>`;
								}
								featureOptions += '</optgroup>';
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

		// Add Alchemy listeners
		AlchemyListeners(html, this.item);

		if (!this.isEditable) return;
	}

	_getSubmitData( updateData = {} ) {
		const data = super._getSubmitData( updateData );
		
		if ( data['system.type.value'] ) {
			const typeImages = {
				"": 'systems/fabula/assets/icons/default-spell.png',
				chimerism: 'systems/fabula/assets/icons/classes/chimerist.png',
				elementalism: 'systems/fabula/assets/icons/classes/elementalist.png',
				entropism: 'systems/fabula/assets/icons/classes/entropist.png',
				spiritism: 'systems/fabula/assets/icons/classes/spiritist.png'
			};
			data['img'] = typeImages[data['system.type.value']];
		} else if ( data['img'] == 'icons/svg/item-bag.svg' ) {
			data['img'] = `systems/fabula/assets/icons/default-${this.item.type}.svg`;
		}
		const overrides = foundry.utils.flattenObject( this.item.overrides );

		for ( let key of Object.keys(overrides) ) {
			if ( key.startsWith('system.') )
				delete data[`data.${key.slice(7)}`];
			delete data[key];
		}

		return data;
	}

	async _prepareFlags(context) {

		const features = [];
		const spells = [];
		const subItems = [];

		if ( context.flags.fabula?.subItems ) {
			for ( let i of context.flags.fabula.subItems ) {

				// Enriches description fields
				for ( let item of context.flags.fabula.subItems ) {
					item.enrichedHtml = {
						description: await TextEditor.enrichHTML( item.system?.description ?? '' ),
						opportunity: await TextEditor.enrichHTML( item.system?.opportunityEffect ?? '' ),
					};
				}

				if (i.type === 'spell') {
					spells.push(i);
				} else if (i.type === 'classFeature') {
					features.push(i);
				} else {
					subItems.push(i);
				}

			}

			context.features = features;
			context.spells = spells;
			context.subItems = subItems;
		}
	}

	async _onDropItem(event) {
		event.preventDefault();
		const data = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));
		const targetItem = this.item;

		if ( targetItem.type == 'class' || targetItem.type == 'classFeature' ) {

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
			
			// Check if Class Feature has subfeatures
			if ( targetItem.type == 'classFeature' && targetItem.system?.advancement?.value === false ) {
				ui.notifications.warn(`L'abilità ${targetItem.name} non può avere abilità secondarie.`);
				return;
			}

			// Check if Class has already 5 features
			if ( targetItem.type == 'class' && targetItem.system.features.length == 5 ) {
				ui.notifications.warn('Il numero massimo è già stato raggiunto.');
				return;
			}

			// Check if Class Feature is duplicated
			let alreadyExist = false;
			const compendium = game.packs.get('fabula.classfeatures');
			for (let i = 0; i < targetItem.system.features.length; i++) {
				const item = await compendium.getDocument( targetItem.system.features[i] );
				if ( item.system.fabulaID == sourceItem.system.fabulaID ) {
					alreadyExist = true;
					break;
				}
			}

			if ( alreadyExist ) {
				ui.notifications.error(`L'abilità ${sourceItem.name} ha lo stesso Fabula ID di un'altra abilità già allegata a ${targetItem.name}!`);
				return;
			}

			const newFeatures = targetItem.system.features || [];
			newFeatures.push( sourceItem._id );

			await targetItem.update({ 'system.features': newFeatures });
			ui.notifications.info(`Abilità ${sourceItem.name} aggiunta a: ${targetItem.name}.`);

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