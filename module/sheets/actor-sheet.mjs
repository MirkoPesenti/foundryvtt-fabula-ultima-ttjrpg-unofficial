import { FU } from "../helpers/config.mjs";
import { showItemInChat } from "../helpers/helpers.mjs";

/**
 * Extend basic ActorSheet
 * @extends {ActorSheet}
 */

export class FabulaActorSheet extends ActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['fabula', 'sheet', 'actor', 'backgroundstyle'],
			width: 700,
			height: 700,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description', }],
		});
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
		
		context.rollData = context.actor.getRollData();

		context.FU = FU;

		// if ( actorData.type == 'character' && actorData.system.level.value < 5 )
		// 	await this._characterCreation( actorData );

		return context;
	}

	async _onDrop(e) {
		e.preventDefault();
		const data = TextEditor.getDragEventData(e);
		const actor = this.actor;

		if ( data.type == 'Item' ) {
			const sourceItem = await fromUuid(data.uuid);

			if ( sourceItem.type == 'consumable' ) return;

			if ( !sourceItem ) {
				ui.notifications.error('Impossibile trovare l\'Item');
				return false;
			}

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
		}

		return super._onDrop(e);
	}

	activateListeners( html ) {
		super.activateListeners( html );

		// Show Actor's Item in chat
		html.on('click', '.js_showInChat', (e) => {
			e.preventDefault();
			const data = e.currentTarget.dataset;
			showItemInChat( data, this.actor );
		});

		// Roll Spell magic test
		html.on('click','.js_rollSpellTest', async (e) => {
			e.preventDefault();
			const actor = this.actor;
			const data = e.currentTarget.dataset;
			const spell = actor.items.get( data.id );
			const roll = new Roll( data.roll, actor.getRollData() );
			const template = 'systems/fabula/templates/chat/chat-check.hbs';

			await roll.evaluate();
			const checkData = {
				spell: spell,
				spellTest: `【${game.i18n.localize(FU.attributesAbbr[spell.system.attributes.primary.value])} + ${game.i18n.localize(FU.attributesAbbr[spell.system.attributes.secondary.value])}】`,
				roll: roll,
			};

			renderTemplate( template, checkData ).then(content => {
				roll.toMessage({
					flavor: null,
					content: content,
					speaker: ChatMessage.getSpeaker({ actor: actor }),
					rollMode: game.settings.get( 'core', 'rollMode' ),
				}).then(chatMessage => {
					setTimeout(() => {
						const message = document.querySelector(`.message[data-message-id="${chatMessage.id}"]`);
						const buttons = message.querySelectorAll(".js_rerollDice");

						buttons.forEach(btn => {
							btn.addEventListener('click', (ev) => {
								const reRoll = ev.currentTarget.dataset.roll;
								new Roll( reRoll, actor.getRollData() ).toMessage({
									flavor: 'Hai ritirato il dado',
									speaker: ChatMessage.getSpeaker({ actor: actor }),
									rollMode: game.settings.get( 'core', 'rollMode' ),
								});
								$(ev.currentTarget).addClass('disabled');
							});
						});
					}, 100);
				});
			});
		});

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

		html.on('click','.roll', this._onRoll.bind(this));
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
		const armor = [];
		const shields = [];
		const accessories = [];
		const classes = [];
		const spells = [];
		const consumables = [];
		const projects = [];
		const rituals = [];

		for (let i of context.items) {
			i.img = i.img || CONST.DEFAULT_TOKEN;

			if (i.type === 'weapon') {
				weapons.push(i);
			} else if (i.type === 'armor') {
				armor.push(i);
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
			}
		}

		context.weapons = weapons;
		context.armor = armor;
		context.shields = shields;
		context.accessories = accessories;
		context.classes = classes;
		context.spells = spells;
		context.consumables = consumables;
		context.projects = projects;
		context.rituals = rituals;
		context.classFeature = {};

		for (const item of this.actor.itemTypes.classFeature) {
			const featureType = (context.classFeature[item.system.featureType] ??= {
				feature: item.system.data?.constructor,
				items: {},
			});
			featureType.items[item.id] = { item, additionalData: await featureType.feature?.getAdditionalData(item.system.data) };
		}
	}

	_onRoll(e) {
		e.preventDefault();
		const element = e.currentTarget;
		const data = element.dataset;

		if ( data.rollType ) {
			if ( data.rollType == 'item' ) {
				const itemId = element.closest('.item').dataset.itemId;
				const item = this.actor.items.get(itemId);
				if ( item ) return item.roll();
			}
		}

		if ( data.roll ) {
			let label = data.label ? `[ability] ${data.label}` : '';
			let roll = new Roll( data.roll, this.actor.getRollData() );
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: label,
				rollMode: game.settings.get( 'core', 'rollMode' ),
			});
			return roll;
		}
	}

	async _addClass( classItem ) {
		const actorClasses = this.actor.getFlag('fabula', 'classes') || [];
		actorClasses.push(classItem);
		await this.actor.setFlag('fabula', 'classes', actorClasses);
	}
}