import { FU } from "../helpers/config.mjs";

const NPCaccordions = {
	attack: false,
	spell: false,
	other: false,
	rule: false,
};

/**
 * Extend basic ActorSheet
 * @extends {ActorSheet}
 */

export class FabulaActorSheet extends ActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['fabula', 'sheet', 'actor', 'backgroundstyle'],
			width: 700,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'base', }],
		});
	}

	render( force = false, options = {} ) {
		if (  this.object.type == 'character' )
			options.height = 700;
		else if ( this.object.type == 'npc' )
			options.height = 700;

		super.render(force, options);
	}

	get template() {
		const path = 'systems/fabula/templates/actors';
		return `${path}/actor-${this.actor.type}-sheet.hbs`;
	}

	async getData() {
		const context = super.getData();
		const actorData = context.actor;

		context.system = actorData.system;
		context.flags = actorData.flags;

		await this._prepareItems(context);

		//Add required CONFIG data
		context.sourcebook = CONFIG.FU.sourcebook;
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
		context.villainTypes = CONFIG.FU.villainTypes;
		context.enemyRanks = CONFIG.FU.enemyRanks;
		context.species = CONFIG.FU.species;
		context.NPCactionTypes = CONFIG.FU.NPCactionTypes;

		context.enrichedHtml = {
			summary: await TextEditor.enrichHTML( context.system.summary ?? '' ),
			description: await TextEditor.enrichHTML( context.system.description ?? '' ),
		};
		
		context.rollData = context.actor.getRollData();

		context.FU = FU;

		return context;
	}

	async _onDrop(e) {
		e.preventDefault();
		const data = TextEditor.getDragEventData(e);
		const actor = this.actor;

		if ( data.type == 'Item' ) {
			const sourceItem = await fromUuid(data.uuid);

			if ( !sourceItem ) {
				ui.notifications.error('Impossibile trovare l\'Item');
				return false;
			}

			this._onDropNpc( actor, sourceItem );
			this._onDropCharacter( actor, sourceItem );
			
		} else {
			return super._onDrop(e);
		}
	}

	activateListeners( html ) {
		super.activateListeners( html );

		$(html).find('.content-collapse').each((index, element) => {
			for ( const key in NPCaccordions ) {
				const content = element;
				if ( $(content).hasClass(key) && NPCaccordions[key] == true ) {

					$(content).find('button[aria-expanded]').attr('aria-expanded', 'true');
					const contentChild = $(content).children('.collapse');
		
					$(content).addClass('open');
				}
			}
		});

		// Inner tabs
		html.on('click', '.tabs.inner-tabs > .item', (e) => {
			e.preventDefault();
			const element = e.currentTarget;
			const tabGroup = $(element).parent('.tabs').data('group');
			const tab = $(element).data('tab');

			if ( tab && tabGroup ) {

				$(element).siblings().each((index, el) => {
					$(el).removeClass('active');
				});
				$(element).addClass('active');

				const innerTabs = html.find(`.tab[data-group="${tabGroup}"]`);
				$(innerTabs).each((index, el) => {
					if ( $(el).is(`[data-tab="${tab}"]`) ) {
						$(el).addClass('active');
					} else {
						$(el).removeClass('active');
					}
				});

			}
		});

		html.on('click', '.removeFeature', this._removeClassFeature.bind(this));
		html.on('click', '.js_setFreeFeature', this._setFreeFeature.bind(this));

		// Roll a Test
		html.on('click', '.js_rollActorTest', this._rollActorTest.bind(this));

		// Roll for initiative
		html.on('click', '.js_rollInitiative', this._rollInitiative.bind(this));

		// Set Attributes values
		html.on('click', '.js_setAttrValue', this._setAttrValue.bind(this));

		// Equip Item
		html.on('click','.js_equipItem', async (e) => {
			e.preventDefault();
			const itemType = e.currentTarget.dataset.type;
			const itemID = e.currentTarget.dataset.id;

			if ( itemType == 'shield' || itemType == 'armor' || itemType == 'accessory' ) {
				
				const equipPlace = itemType == 'shield' ? 'offHand' : itemType;
				const prevItemId = this.actor.system.equip[equipPlace];
				const item = this.actor.items.find(i => i.id === itemID && i.type === itemType);
				if ( prevItemId ) {
					const prevItem = this.actor.items.find(i => i.id === prevItemId);

					if ( equipPlace == 'offHand' && this.actor.system.equip.mainHand == prevItem.id ) {
						ui.notifications.error(`L\'oggetto ${item.name} ha bisogno che la Mano Secondaria sia libera per essere equipaggiato!`);
						return;
					}

					await prevItem.update({ 'system.isEquipped': false });
				}
				await item.update({ 'system.isEquipped': true });
				const objAttr = 'system.equip.' + equipPlace;
				await this.actor.update({ [objAttr]: itemID });

			} else if ( itemType == 'weapon' ) {
				const item = this.actor.items.find(i => i.id === itemID && i.type === itemType);
				if ( item.system.needTwoHands && this.actor.system.equip.offHand ) {
					ui.notifications.error(`L\'oggetto ${item.name} ha bisogno di Due Mani per essere equipaggiato!`);
					return;
				}

				const prevItemId = this.actor.system.equip.mainHand;
				if ( prevItemId ) {
					const prevItem = this.actor.items.find(i => i.id === prevItemId);
					await prevItem.update({ 'system.isEquipped': false });
				}
				await item.update({ 'system.isEquipped': true });
				await this.actor.update({ 'system.equip.mainHand': itemID });
				if ( item.system.needTwoHands ) {
					await this.actor.update({ 'system.equip.offHand': itemID });
				}
			}
		});

		// Remove equipped Item
		html.on('click','.js_removeEquipItem', async (e) => {
			e.preventDefault();
			const itemType = e.currentTarget.dataset.type;
			const itemID = e.currentTarget.dataset.id;
			const item = this.actor.items.find(i => i.id === itemID);
			await item.update({ 'system.isEquipped': false });
			await this.actor.update({ [itemType]: null });
			if ( itemType == 'system.equip.mainHand' && item.system.needTwoHands ) {
				await this.actor.update({ 'system.equip.offHand': null });
			}
		});

		// Remove Item from Actor
		html.on('click','.js_removeItem', async (e) => {
			e.preventDefault();
			const itemID = e.currentTarget.dataset.id;
			await this.actor.deleteEmbeddedDocuments('Item', [itemID]);
		});

		// Toggle collapse elements
		html.on('click','.js_toggleCollapse', (e) => {
			e.preventDefault();
			let accordionOpen = false;
			if ( $(e.currentTarget).attr('aria-expanded') == 'false' ) {
				$(e.currentTarget).attr('aria-expanded', 'true');
			} else {
				$(e.currentTarget).attr('aria-expanded', 'false');
			}
			const content = $(e.currentTarget).closest('.content-collapse');
			const contentChild = $(e.currentTarget).closest('.content-collapse').children('.collapse');

			if ( content.hasClass('open') ) {
				contentChild.css('height', contentChild[0].scrollHeight + 'px')
				content.removeClass('open');
				setTimeout(() => {
					contentChild.css('height','0');
				}, 0);
			} else {
				content.addClass('open');
				contentChild.css('height', contentChild[0].scrollHeight + 'px');
				
				contentChild.on('transitionend', function() {
					if ( content.hasClass('open') )
						content.css('height', 'auto');
				});
				accordionOpen = true;
			}

			const classes = content.attr('class').split(' ');
			for ( const key in NPCaccordions ) {
				if ( classes.includes( key ) )
					NPCaccordions[key] = accordionOpen;
			}
			
		});

		// Set Affinity
		html.on('click','.js_setAffinity', this._setAffinity.bind(this));
		
		// Set Status
		html.on('click','.js_setStatus', this._setStatus.bind(this));

		// Create Item
		html.on('click','.js_createItem', this._createItem.bind(this));

		// Edit Item
		html.on('click','.js_editItem', this._editItem.bind(this));

		// Delete Item
		html.on('click','.js_deleteItem', this._deleteItem.bind(this));
		
		// Show Item in Chat
		html.on('click','.js_showItemInChat', this._showItemInChat.bind(this));

		// Roll spell test
		html.on('click','.js_rollActorItem', this._rollActorItem.bind(this));

		html.on('click','.getActor', () => console.log(this.actor));
		html.on('click','.addClass', () => {
			const pack = game.packs.get('fabula.classes');
			const sortedPack = pack.index.contents.sort( ( a, b ) => a.name.localeCompare(b.name) );
			let options = '';
			sortedPack.forEach((value, key) => {
				options += `<option value="${value.name}">${value.name}</option>`;
			})
			new Dialog({
				title: 'Seleziona Classe',
				content: `
					<form>
						<div class="form-group">
							<label>Classe:</label>
							<select id="formClass">
								${options}
							</select>
						</div>
					</form>
				`,
				buttons: {
					confirm: {
						label: 'Conferma',
						callback: async (html) => {
							const selectedClass = html.find('#formClass').val();
							const entry = pack.index.find(e => e.name === selectedClass);
							if (entry) {
								const actor = this;
								const document = await pack.getDocument(entry._id);
								if ( ( document.system.bonus.hp + document.system.bonus.mp + document.system.bonus.ip ) > 1 ) {
									let radios = '';
									if ( document.system.bonus.hp )
										radios += `<div class="form-group">
													<label for="formClassBenefit">Punti Ferita</label>
													<input type="radio" name="formClassBenefit" value="hp" />
												</div>`;
									if ( document.system.bonus.mp )
										radios += `<div class="form-group">
													<label for="formClassBenefit">Punti Mente</label>
													<input type="radio" name="formClassBenefit" value="mp" />
												</div>`;
									if ( document.system.bonus.ip )
										radios += `<div class="form-group">
													<label for="formClassBenefit">Punti Inventario</label>
													<input type="radio" name="formClassBenefit" value="ip" />
												</div>`;
									new Dialog({
										title: 'Scegli beneficio',
										content: `<form>${radios}</form>`,
										buttons: {
											confirm: {
												label: 'Conferma',
												callback: async (html) => {
													const radio = html.find('[name="formClassBenefit"]:checked').val();
													let clonedDocument = document.toObject()
													clonedDocument.system.bonus = {
														hp: false,
														mp: false,
														ip: false,
													}
													clonedDocument.system.bonus[radio] = true;
													await actor._addClass( clonedDocument );
												}
											},
											cancel: {
												label: 'Annulla',
											},
										},
									}).render(true);
								} else {
									await actor._addClass( document.toObject() );
								}
							}
							return null;
						}
					},
					cancel: {
						label: 'Annulla',
					},
				},
			}).render(true);
		});

		if (!this.isEditable) return;
	}

	async _prepareItems(context) {
		const weapons = [];
		const armors = [];
		const shields = [];
		const accessories = [];
		const classes = [];
		const spells = [];
		const consumables = [];
		const projects = [];
		const rituals = [];
		const baseItems = [];
		const attacks = [];

		for (let i of context.items) {
			i.img = i.img || CONST.DEFAULT_TOKEN;

			if (i.type === 'weapon') {
				weapons.push(i);
			} else if (i.type === 'armor') {
				armors.push(i);
			} else if (i.type === 'shield') {
				shields.push(i);
			} else if (i.type === 'accessory') {
				accessories.push(i);
			} else if (i.type === 'class') {
				classes.push(i);
			} else if (i.type === 'spell') {
				spells.push(i);
			} else if (i.type === 'consumable') {
				consumables.push(i);
			} else if (i.type === 'project') {
				projects.push(i);
			} else if (i.type === 'ritual') {
				rituals.push(i);
			} else if (i.type === 'baseItem') {
				baseItems.push(i);
			} else if (i.type === 'attack') {
				attacks.push(i);
			}
		}

		context.weapons = weapons;
		context.armors = armors;
		context.shields = shields;
		context.accessories = accessories;
		context.classes = classes;
		context.spells = spells;
		context.consumables = consumables;
		context.projects = projects;
		context.rituals = rituals;
		context.baseItems = baseItems;
		context.attacks = attacks;
		context.classFeature = {};

		for (const item of this.actor.itemTypes.classFeature) {
			const featureType = (context.classFeature[item.system.featureType] ??= {
				feature: item.system.data?.constructor,
				items: {},
			});
			featureType.items[item.id] = { item, additionalData: await featureType.feature?.getAdditionalData(item.system.data) };
		}
	}

	async _setAttrValue(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const actor = this.actor;
		const attribute = element.dataset.attr;
		const value = element.dataset.value;

		if ( attribute ) {
			const updateObj = `system.resources.${attribute}.current`;
			const newVal = value ? Number(value) : actor.system.resources[attribute].max;
			
			await actor.update({ [updateObj]: newVal });
		}
	}

	async _removeClassFeature(event) {
		event.preventDefault();
		const actor = this.actor;
		if ( actor.type == 'character' ) return;

		const classFeatures = actor.getFlag('fabula', 'classFeatures') || [];
		const itemToBeRemoved = event.currentTarget.getAttribute('data-id');
		let removed = false;
		for (let i = 0; i < classFeatures.length; i++) {
			if ( classFeatures[i]._id == itemToBeRemoved ) {
				classFeatures.splice(i, 1);
				removed = true;
				break;
			}
		}
		
		await actor.setFlag('fabula', 'classFeatures', classFeatures);

		if ( removed ) {
			const skillCount = actor.system.skills.current - 1;
			await actor.update({ 'system.skills.current': skillCount });
			ui.notifications.info(`L'elemento è stato eliminato.`);
		} else {
			ui.notifications.error(`Non è stato possibili completare l'azione.`);
		}
	}

	async _setFreeFeature(event) {
		event.preventDefault();
		const actor = this.actor;
		if ( actor.type == 'character' ) return;

		let skillCount = actor.system.skills.current;
		const classFeatures = actor.getFlag('fabula', 'classFeatures') || [];
		const itemID = event.currentTarget.getAttribute('data-id');
		let skillLevel = 1;

		for (let i = 0; i < classFeatures.length; i++) {
			if ( classFeatures[i]._id == itemID ) {
				classFeatures[i].system.isFree = !classFeatures[i].system.isFree;
				if ( classFeatures[i].system.level.current > 1 ) skillLevel = classFeatures[i].system.level.current;
				break;
			}
		}

		if ( $(event.currentTarget).hasClass('active') ) {
			skillCount += skillLevel;
			$(event.currentTarget).removeClass('active');
		} else {
			skillCount -= skillLevel;
			$(event.currentTarget).addClass('active');
		}
		
		await actor.setFlag('fabula', 'classFeatures', classFeatures);
		await actor.update({ 'system.skills.current': skillCount });
	}

	async _rollActorTest(event) {
		event.preventDefault();
		const actor = this.actor;

		new Dialog({
			title: 'Effettua un test',
			content: `
				<div class="skill-test">
					<div class="flexrow">
						<h4>Scegli le caratteristiche</h4>
						<div class="flexcolumn">
							<div class="title">Primaria</div>
							<div class="form-group">
								<input type="radio" name="formCheckPrimary" id="attrPrimary_dex" value="dex" />
								<label for="attrPrimary_dex">Destrezza</label>
							</div>
							<div class="form-group">
								<input type="radio" name="formCheckPrimary" id="attrPrimary_ins" value="ins" />
								<label for="attrPrimary_ins">Intuito</label>
							</div>
							<div class="form-group">
								<input type="radio" name="formCheckPrimary" id="attrPrimary_mig" value="mig" />
								<label for="attrPrimary_mig">Vigore</label>
							</div>
							<div class="form-group">
								<input type="radio" name="formCheckPrimary" id="attrPrimary_wlp" value="wlp" />
								<label for="attrPrimary_wlp">Volontà</label>
							</div>
						</div>
						<div class="flexcolumn">
							<div class="title">Secondaria</div>
							<div class="form-group">
								<input type="radio" name="formCheckSecondary" id="attrSecondary_dex" value="dex" />
								<label for="attrSecondary_dex">Destrezza</label>
							</div>
							<div class="form-group">
								<input type="radio" name="formCheckSecondary" id="attrSecondary_ins" value="ins" />
								<label for="attrSecondary_ins">Intuito</label>
							</div>
							<div class="form-group">
								<input type="radio" name="formCheckSecondary" id="attrSecondary_mig" value="mig" />
								<label for="attrSecondary_mig">Vigore</label>
							</div>
							<div class="form-group">
								<input type="radio" name="formCheckSecondary" id="attrSecondary_wlp" value="wlp" />
								<label for="attrSecondary_wlp">Volontà</label>
							</div>
						</div>
						<div class="form-group">
							<input type="checkbox" name="formBonusCheck" id="formBonusCheck" ${actor.system.level.checkBonus.checks <= 0 ? 'disabled' : ''} />
							<label for="formBonusCheck">Applicare bonus ai Test Contrapposti? ${actor.system.level.checkBonus.checks > 0 ? '(+' + actor.system.level.checkBonus.checks + ')' : ''}</label>
						</div>
					</div>
				</div>
			`,
			buttons: {
				cancel: {
					label: 'Annulla',
				},
				confirm: {
					label: 'Conferma',
					callback: async (html) => {
						const attrPrimary = html.find('[name="formCheckPrimary"]:checked').val();
						const attrSecondary = html.find('[name="formCheckSecondary"]:checked').val();
						const bonusCheck = html.find('[name="formBonusCheck"]').is(':checked');

						if ( attrPrimary && attrSecondary ) {

							let rollString = '';
							const primary = actor.system.attributes[attrPrimary].value;
							const secondary = actor.system.attributes[attrSecondary].value;
							rollString += `d${primary}+d${secondary}`;
							
							if ( bonusCheck ) {
								rollString += `+${actor.system.level.checkBonus.checks}`;
							}

							const template = `systems/fabula/templates/chat/check-base.hbs`;

							const roll = new Roll( rollString, actor.getRollData() );
							await roll.evaluate();

							const results = [];
							for ( let i = 0; i < roll.dice.length; i++ ) {
								for ( let x = 0; x < roll.dice[i].results.length; x++ ) {
									results.push( roll.dice[i].results[x].result );
								}
							}

							// Check High Roll
							let highRoll = Math.max(...results);

							// Check Critical Success
							let critSuccess = results.every( val => val === results[0] && val >= 6 && val <= 12 );
							
							// Check Critical Failure
							let critFailure = results.every( val => val === 1 );
							
							const checkData = {
								roll: roll,
								highRoll: highRoll,
								crit: {
									success: critSuccess,
									failure: critFailure,
								},

							};

							renderTemplate( template, checkData ).then(content => {
								roll.toMessage({
									user: game.user.id,
									speaker: ChatMessage.getSpeaker({ actor: actor }),
									flavor: 'Test di caratteristica',
									content: content,
									rollMode: game.settings.get( 'core', 'rollMode' ),
								}).then(chatMessage => {
									setTimeout(() => {
										const message = document.querySelector(`.message[data-message-id="${chatMessage.id}"]`);
										const buttons = message.querySelectorAll(".js_rerollDice");
					
										buttons.forEach(btn => {
											btn.addEventListener('click', (ev) => {
												const reRoll = ev.currentTarget.dataset.roll;
												new Roll( reRoll, actor.getRollData() ).toMessage({
													user: game.user.id,
													speaker: ChatMessage.getSpeaker({ actor: actor }),
													flavor: 'Hai ritirato il dado',
													rollMode: game.settings.get( 'core', 'rollMode' ),
												});
												// $(ev.currentTarget).attr('disabled','true');
											});
										});
									}, 100);
								});
							});

							return true;

						} else {
							ui.notifications.warn('Devi scegliere una caratteristica primaria e una secondaria');
							return false;
						}
					}
				},
			},
		}).render(true);
	}

	async _rollInitiative(event) {
		event.preventDefault();
		const actor = this.actor;
		let rollString = `d${actor.system.attributes.dex.value}+d${actor.system.attributes.ins.value}`;
		if ( actor.resources.params.init.current != 0 )
			rollString += `+${actor.resources.params.init.current}`;

		const roll = new Roll( rollString, actor.getRollData() );
		await roll.evaluate();
	}

	async _createItem(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const type = element.dataset.type;

		const data = foundry.utils.duplicate(element.dataset);
		const localizedKey = CONFIG.FU.ItemTypes[type] || `TYPES.Item.${type}`;
		const name = game.i18n.localize(localizedKey);
		const itemData = {
			name: name,
			type: type,
			system: data,
		};
		delete itemData.system['type'];

		return await Item.create(itemData, { parent: this.actor });
	}

	async _editItem(event) {
		const element = event.currentTarget;
		const itemID = element.dataset.itemid;

		const item = this.actor.items.get( itemID );
		if ( item ) item.sheet.render(true);
	}

	async _deleteItem(event) {
		const element = event.currentTarget;
		const itemID = element.dataset.itemid;

		const item = this.actor.items.get( itemID );
		if (
			await Dialog.confirm({
				title: `Stai eliminando ${item.name}`,
				content: `<p>Sei sicuro di volere eliminare ${item.name}?</p>`,
				rejectClose: false,
			})
		) {
			await item.delete();
		}
	}

	_showItemInChat(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const messageClass = element.dataset.class || 'item-description';
		const itemID = element.dataset.itemid;
		const item = this.actor.items.get( itemID );

		let messageTitle = item.name;
		let messageContent = item.system.description;

		if ( item.type == 'spell' ) {
			if ( item.system.isOffensive.value )
				messageTitle += '<div class="icon icon-offensive"></div>';

			let MPCost = '';
			if ( item.system.MPCost.upTo ) MPCost += 'Fino a ';
			MPCost += `${item.system.MPCost.value}`;
			if ( item.system.target.number > 1 ) MPCost += ' x B';

			messageContent = `
				<table>
					<thead>
						<tr>
							<th>PM</th>
							<th>Bersaglio</th>
							<th>Durata</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>${MPCost}</td>
							<td>${item.system.target.value}</td>
							<td>${game.i18n.localize( FU.SpellDurations[item.system.duration.value] )}</td>
						</tr>
					</tbody>
				</table>
				${messageContent}
			`;
		}
		
		const chatData = {
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: this.name }),
			flavor: messageTitle,
			content: messageContent,
			flags: {
				customClass: messageClass,
			},
		};
		ChatMessage.create(chatData);
	}

	async _rollActorItem(event) {
		event.preventDefault();
		const actor = this.actor;
		const element = event.currentTarget;
		const itemID = element.dataset.itemid;
		const attrPrimary = element.dataset.primary;
		const attrSecondary = element.dataset.secondary;

		const item = actor.items.get( itemID );
		let templateType = item.type;
		if ( item.type == 'weapon' ) templateType = 'attack';
		const template = `systems/fabula/templates/chat/check-${templateType}.hbs`;

		let rollString = '';
		if ( attrPrimary ) {
			rollString += `d${actor.system.attributes[attrPrimary].value}`;
		}
		if ( attrPrimary && attrSecondary ) rollString += '+';
		if ( attrSecondary ) {
			rollString += `d${actor.system.attributes[attrSecondary].value}`;
		}
		if (item.type == 'attack' || item.type == 'weapon' ) {
			if ( item.system.precisionBonus != 0 ) {
				rollString += `+${item.system.precisionBonus}`;
			}

			if ( actor.system.level.checkBonus.test > 0 ) {
				rollString += `+${actor.system.level.checkBonus.test}`;
			}
		}
		if ( item.type == 'spell' && actor.system.level.checkBonus.spell > 0 ) {
			rollString += `+${actor.system.level.checkBonus.spell}`;
		}

		const roll = new Roll( rollString, actor.getRollData() );
		await roll.evaluate();

		const results = [];
		for ( let i = 0; i < roll.dice.length; i++ ) {
			for ( let x = 0; x < roll.dice[i].results.length; x++ ) {
				results.push( roll.dice[i].results[x].result );
			}
		}
		
		// Check High Roll
		let highRoll = Math.max(...results);

		// Check Critical Success
		let critSuccess = results.every( val => val === results[0] && val >= 6 && val <= 12 );
		
		// Check Critical Failure
		let critFailure = results.every( val => val === 1 );
		
		const checkData = {
			item: item,
			roll: roll,
			highRoll: highRoll,
			crit: {
				success: critSuccess,
				failure: critFailure,
			},

		};

		renderTemplate( template, checkData ).then(content => {
			roll.toMessage({
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({ actor: actor }),
				flavor: game.i18n.localize( FU.ItemTypes[item.type] ),
				content: content,
				flags: {
					customClass: `${item.type}-check`,
				},
				rollMode: game.settings.get( 'core', 'rollMode' ),
			}).then(chatMessage => {
				setTimeout(() => {
					const message = document.querySelector(`.message[data-message-id="${chatMessage.id}"]`);
					const buttons = message.querySelectorAll(".js_rerollDice");

					buttons.forEach(btn => {
						btn.addEventListener('click', (ev) => {
							const reRoll = ev.currentTarget.dataset.roll;
							new Roll( reRoll, actor.getRollData() ).toMessage({
								user: game.user.id,
								speaker: ChatMessage.getSpeaker({ actor: actor }),
								flavor: 'Hai ritirato il dado',
								flags: {
									customClass: `${item.type}-check`,
								},
								rollMode: game.settings.get( 'core', 'rollMode' ),
							});
							// $(ev.currentTarget).attr('disabled','true');
						});
					});
				}, 100);
			});
		});
	}

	async _setAffinity(event) {
		event.preventDefault();
		const actor = this.actor;
		const element = event.currentTarget;
		const affinity = element.dataset.affinity;
		if ( affinity ) {

			const property = `system.affinity.${affinity}`;
			let affinityVal = '';

			if ( actor.system.affinity[affinity] == '' )
				affinityVal = 'vulnerability';
			else if ( actor.system.affinity[affinity] == 'vulnerability' )
				affinityVal = 'resistance';
			else if ( actor.system.affinity[affinity] == 'resistance' )
				affinityVal = 'immunity';
			else if ( actor.system.affinity[affinity] == 'immunity' )
				affinityVal = 'absorption';

			await actor.update({ [property]: affinityVal });

		}
	}

	async _setStatus(event) {
		event.preventDefault();
		const actor = this.actor;
		const element = event.currentTarget;
		const status = element.dataset.status;
		if ( status ) {

			const property = `system.status.${status}.active`;
			const currentStatus = actor.system.status[status].active;

			if ( currentStatus !== true ) {

				// Check immunity
				if ( actor.system.status[status].immunity === true ) {
					if (
						!await Dialog.confirm({
							title: `Sei immune allo status ${game.i18n.localize(`FU.Status.${status}`)}!`,
							content: `<p>Sei sicuro di volere continuare?</p>`,
							rejectClose: false,
						})
					) {
						return;
					}
				}
			}

			await actor.update({ [property]: !currentStatus });
		}
	}

	async _onDropNpc( actor, sourceItem ) {

		if ( actor.type != 'npc' ) return;
		
		if ( sourceItem.type == 'classFeature' ) {
			let maxxedSkill = false;
			let levelUpSkill = false;
			const classFeatures = actor.getFlag('fabula', 'classFeatures') || [];

			for (let i = 0; i < classFeatures.length; i++) {
				if ( classFeatures[i]._id == sourceItem._id ) {
					if ( classFeatures[i].system.level.current == classFeatures[i].system.level.max ) {
						maxxedSkill = true;
					} else {
						classFeatures[i].system.level.current++;
						levelUpSkill = true;
					}
					break;
				}
			}
			
			if ( maxxedSkill ) {
				ui.notifications.error(`${actor.name} non può potenziare oltre l'abilità ${sourceItem.name}!`);
				return false;
			}

			if ( levelUpSkill ) {
				await actor.setFlag('fabula', 'classFeatures', classFeatures);
				ui.notifications.info(`${actor.name} ha aumentato il livello dell'abilità ${sourceItem.name}!`);
				return true;
			}

			if ( sourceItem.system.isLimited ) {
				new Dialog({
					title: `Stai aggiungendo l'abilità ${sourceItem.name}`,
					content: `
						<p>L'abilità <strong>${sourceItem.name}</strong> è limitiata! Sei sicuro di volerla aggiungere?</p>
					`,
					buttons: {
						no: {
							label: 'No',
						},
						yes: {
							label: 'Si',
							callback: async () => {
								const skillCount = actor.system.skills.current + 1;

								if ( skillCount <= actor.system.skills.max ) {
									await actor.update({ 'system.skills.current': skillCount });
									const newItemData = sourceItem.toObject();
									newItemData.system.level.current++;
									const flags = actor.getFlag('fabula', 'classFeatures') || [];
									flags.push(newItemData);
									await actor.setFlag('fabula', 'classFeatures', flags);
									return true;
								} else {
									ui.notifications.warn('Hai raggiunto il limite di abilità acquistabili!');
									return false;
								}
							},
						},
					}
				}).render(true);
			} else {
				const skillCount = actor.system.skills.current + 1;

				if ( skillCount <= actor.system.skills.max ) {
					await actor.update({ 'system.skills.current': skillCount });
					const newItemData = sourceItem.toObject();
					newItemData.system.level.current++;
					const flags = actor.getFlag('fabula', 'classFeatures') || [];
					flags.push(newItemData);
					await actor.setFlag('fabula', 'classFeatures', flags);
					return true;
				} else {
					ui.notifications.warn('Hai raggiunto il limite di abilità acquistabili!');
					return false;
				}
			}
		} else {
			actor.createEmbeddedDocuments( 'Item', [sourceItem] );
			ui.notifications.info(`${sourceItem.name} aggiunto all'Actor ${actor.name}`);
		}

	}

	async _onDropCharacter( actor, sourceItem ) {

		if ( actor.type != 'character' ) return;

		if ( sourceItem.type == 'accessory' || sourceItem.type == 'armor' || sourceItem.type == 'shield' || sourceItem.type == 'weapon' ) {

			new Dialog({
				title: `Stai aggiungendo l'oggetto ${sourceItem.name}`,
				content: `
					<p>L'oggetto ${sourceItem.name} costa ${sourceItem.system.cost}z, vuoi pagarne il costo?</p>
				`,
				buttons: {
					no: {
						label: 'No',
						callback: async () => {
							const newItemData = sourceItem.toObject();
							await actor.createEmbeddedDocuments("Item", [newItemData]);
							ui.notifications.info(`Oggetto ${sourceItem.name} aggiunto all'equipaggiamento!`);
						},
					},
					yes: {
						label: 'Si',
						callback: async () => {
							const actorZenits = actor.system.resources.zenit;
							if ( actorZenits < sourceItem.system.cost ) {
								ui.notifications.error(`Non hai abbastanza Zenit per comprare l'oggetto ${sourceItem.name}`);
							} else {
								actor.update({ 'system.resources.zenit': actorZenits - sourceItem.system.cost });
								const newItemData = sourceItem.toObject();
								await actor.createEmbeddedDocuments("Item", [newItemData]);
								ui.notifications.info(`Oggetto ${sourceItem.name} acquistato al costo di ${sourceItem.system.cost}z`);
							}
						},
					},
				}
			}).render(true);
		
			return true;
		} else {
			actor.createEmbeddedDocuments( 'Item', [sourceItem] );
		}

	}

	async _addClass( classItem ) {
		const actorClasses = this.actor.getFlag('fabula', 'classes') || [];
		actorClasses.push(classItem);
		await this.actor.setFlag('fabula', 'classes', actorClasses);
	}
}