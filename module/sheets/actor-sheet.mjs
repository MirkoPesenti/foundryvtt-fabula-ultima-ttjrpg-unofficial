import { prepareActiveEffect, manageActiveEffect } from "../helpers/effects.mjs";
import { addClassToActor } from "../helpers/class-helpers.mjs";
import { rollDiceToChat } from "../helpers/roll-helpers.mjs";
import { awaitDialogSelect, generateDataLink, returnSortedPack } from "../helpers/helpers.mjs";
import { incrementSessionResource, initSessionJournal } from "../helpers/journal-helpers.mjs";
import { FU } from "../helpers/config.mjs";

const NPCaccordions = {
	attack: false,
	spell: false,
	other: false,
	rule: false,
};

let lastOpennedInnerTab = 'base';

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
			options.height = 900;
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
		const actorData = this.actor;

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

		// Add list of items sorted by packs to CONFIG data
		context.itemLists = {
			class: returnSortedPack( 'fabula.classes', 'class' ),
			spell: returnSortedPack( 'fabula.spells', 'spell' ),
			heroicSkill: returnSortedPack( 'fabula.heroicskill', 'heroicSkill' ),
			arcanum: returnSortedPack( 'fabula.arcanum', 'arcanum' ),
		}

		context.enrichedHtml = {
			summary: await TextEditor.enrichHTML( context.system.summary ?? '' ),
			description: await TextEditor.enrichHTML( context.system.description ?? '' ),
		};
		
		context.rollData = context.actor.getRollData();

		context.effects = prepareActiveEffect(Array.from(this.actor.allApplicableEffects()));
		context.allEffects = [...context.effects.temporary.effects, ...context.effects.passive.effects, ...context.effects.inactive.effects];

		for ( const effect of context.allEffects ) {
			effect.enrichedDescription = effect.description ? await TextEditor.enrichHTML(effect.description) : '';
		}

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

			if ( sourceItem.type == 'rule' ) {
				ui.notifications.warn('Non puoi equipaggiare una regola');
				return false;
			}

			if ( sourceItem.name == FU.UnarmedStrike.name ) {
				ui.notifications.warn(`Non puoi equipaggiare ${FU.UnarmedStrike.name} perché lo possiedi già`);
				return false;
			}

			this._onDropNpc( actor, sourceItem );
			this._onDropCharacter( actor, sourceItem );
			
		} else {
			return super._onDrop(e);
		}
	}

	async _onDropNpc( actor, sourceItem ) {

		if ( actor.type != 'npc' ) return;
		
		if ( sourceItem.type == 'class' || sourceItem.type == 'heroicSkill' | sourceItem.type == 'consumable' ) {
			ui.notifications.warn(`Non puoi aggiungere gli oggetti come ${sourceItem.name} ad un NPC`); 
		} else if ( sourceItem.type == 'classFeature' ) {
			let maxxedSkill = false;
			let levelUpSkill = false;
			const classFeatures = actor.items.filter( item => item.type === 'classFeature' ) || [];

			for ( const feature of classFeatures ) {
				if ( feature.name == sourceItem.name ) {
					if ( feature.system.level.current == feature.system.level.max && !feature.system.isUnlimited ) {
						maxxedSkill = true;
					} else if ( actor.system.skills.current < actor.system.skills.max ) {
						const levelUp = feature.system.level.current + 1;
						await feature.update({ 'system.level.current': levelUp});
						levelUpSkill = true;
					}
					break;
				}
			}
			
			if ( maxxedSkill ) {
				ui.notifications.error(`${actor.name} non può potenziare oltre l'abilità ${sourceItem.name}!`);
				return false;
			}

			if ( levelUpSkill && actor.system.skills.current <= actor.system.skills.max ) {
				ui.notifications.info(`${actor.name} ha aumentato il livello dell'abilità ${sourceItem.name}!`);
				return true;
			}

			if ( actor.system.skills.current <= actor.system.skills.max ) {
				const newItemData = sourceItem.toObject();
				newItemData.system.level.current++;
				await actor.createEmbeddedDocuments("Item", [newItemData]);
				return true;
			} else {
				ui.notifications.warn('Hai raggiunto il limite di abilità acquistabili!');
				return false;
			}
		} else if ( sourceItem.type == 'weapon' || sourceItem.type == 'armor' || sourceItem.type == 'accessory' || sourceItem.type == 'shield' ) {
			if ( actor.system.equippable ) {
				const newItem = await actor.createEmbeddedDocuments( 'Item', [sourceItem] );

				const equippedData = foundry.utils.deepClone(actor.system.equip);
				let slot;
				if ( newItem[0].type == 'weapon' ) {
					slot = 'mainHand';
				} else if ( newItem[0].type == 'shield' ) {
					slot = 'offHand';
				} else if ( newItem[0].type == 'armor' ) {
					slot = 'armor';
				} else if ( newItem[0].type == 'accessory' ) {
					slot = 'accessory';
				}

				if ( equippedData[slot] !== null && equippedData[slot] !== newItem[0]._id ) {
					const equippedItem = actor.items.get( equippedData[slot] );
					if ( equippedItem ) {
						await equippedItem.update({ 'system.isEquipped': false });
					}
				}

				if ( ( slot == 'offHand' || slot == 'mainHand' ) && equippedData.mainHand === equippedData.offHand ) {
					equippedData.mainHand = null;
					equippedData.offHand = null;
				}
				equippedData[slot] = equippedData[slot] == newItem[0]._id ? null : newItem[0]._id;
				
				const embeddedItem = actor.items.find( item => item.name == FU.UnarmedStrike.name );
				if ( embeddedItem ) {
					if ( !equippedData.mainHand ) {
						equippedData.mainHand = embeddedItem._id;
						await embeddedItem.update({ 'system.isEquipped': true });
					} else if ( !equippedData.offHand ) {
						equippedData.offHand = embeddedItem._id;
						await embeddedItem.update({ 'system.isEquipped': true });
					}
				}

				if ( newItem[0].name !== embeddedItem.name ) {
					await newItem[0].update({ 'system.isEquipped': !newItem[0].system.isEquipped});
				}
				await actor.update({ 'system.equip': equippedData });
				ui.notifications.info(`${sourceItem.name} aggiunto all'Actor ${actor.name}`);

			} else {
				ui.notifications.warn(`${actor.name} non ha l'abilità di equipaggiare oggetti`);
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
					<p>L'oggetto ${sourceItem.name} costa ${sourceItem.system.cost} Zenit <i class="fa fa-fw fa-coins"></i></p>
				`,
				buttons: {
					no: {
						label: 'Aggiungi gratuitamente',
						callback: async () => {
							const newItemData = sourceItem.toObject();
							await actor.createEmbeddedDocuments("Item", [newItemData]);
							ui.notifications.info(`Oggetto ${sourceItem.name} aggiunto all'equipaggiamento!`);
						},
					},
					yes: {
						label: 'Paga il costo',
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

		} else if ( sourceItem.type == 'consumable' ) {

			if ( actor.system.resources.ip.current >= sourceItem.system.IPCost ) {

				let messageTitle = `Ha usato ${generateDataLink( soruceItem, null, null, null, 'ml-05 mr-05' )}`;
				let messageContent = '';

				// Recover HP or MP
				if ( sourceItem.system.recover.hasRecover ) {
					const recoverResource = sourceItem.system.recover.recoverResource;
					const currentReskey = `system.resources.${recoverResource}.current`;
					const currentRes = actor.system.resources[recoverResource].current;

					if ( currentRes == actor.system.resources[recoverResource].max ) {
						ui.notifications.warn(`I tuoi ${game.i18n.localize(FU.recoverResources[recoverResource])} sono già al massimo`);
						return false;
					}

					const newRes = currentRes + sourceItem.system.recover.recoverValue;
					await actor.update({ [currentReskey]: newRes });

					messageTitle += `per recuperare ${sourceItem.system.recover.recoverValue} ${game.i18n.localize(FU.recoverResources[recoverResource])}`;
					messageContent = `
						<div class="flexrow">
							<div>${currentRes}</div>
							<i class="fa fa-fw fa-right-long"></i>
							<div>${actor.system.resources[recoverResource].current}</div>
						</div>
					`;
				}

				// Full rest
				if ( sourceItem.system.rest ) {
					actor.fullRest();

					messageTitle += `per effettuare un riposo`;
					messageContent = `
						<button type="button" class="js_actorFullRest">
							<i class="fa fa-fw fa-bed"></i>
							Fai un riposo
						</button>
					`;
				}

				// Remove status
				if ( sourceItem.system.status.hasRecover ) {

					let status = '';
					if ( sourceItem.system.status.value == '' ) {

						status = await awaitDialogSelect({
							title: `Stai usando ${sourceItem.name}`,
							optionsLabel: 'Scegli da quale status vuoi essere guarito',
							options: `
								<option value="slow">${game.i18n.localize(FU.statusses['slow'])}</option>
								<option value="dazed">${game.i18n.localize(FU.statusses['dazed'])}</option>
								<option value="weak">${game.i18n.localize(FU.statusses['weak'])}</option>
								<option value="shaken">${game.i18n.localize(FU.statusses['shaken'])}</option>
								<option value="enraged">${game.i18n.localize(FU.statusses['enraged'])}</option>
								<option value="poisoned">${game.i18n.localize(FU.statusses['poisoned'])}</option>
							`,
						});

						if ( status == false ) return false;

					} else {
						status = sourceItem.system.status.value;
					}

					const recoverKey = `system.status.${status}.active`;

					if ( !actor.system.status[status].active ) {
						ui.notifications.warn(`Non sei afflitto dallo status ${game.i18n.localize(FU.statusses[status])}!`);
						return false;
					}

					await actor.update({ [recoverKey]: false });
					messageTitle += `per guarire dallo status <strong>${game.i18n.localize(FU.statusses[status])}</strong>`;
				}

				// Inflict damage
				if ( sourceItem.system.damage.hasDamage ) {

					let damageType = '';
					if ( sourceItem.system.status.value == '' ) {

						damageType = await awaitDialogSelect({
							title: `Stai usando ${sourceItem.name}`,
							optionsLabel: 'Scegli da il tipo di danno:',
							options: `
								<option value="air">${game.i18n.localize(FU.DamageTypes['air'])}</option>
								<option value="bolt">${game.i18n.localize(FU.DamageTypes['bolt'])}</option>
								<option value="fire">${game.i18n.localize(FU.DamageTypes['fire'])}</option>
								<option value="ice">${game.i18n.localize(FU.DamageTypes['ice'])}</option>
								<option value="earth">${game.i18n.localize(FU.DamageTypes['earth'])}</option>
							`,
						});

						if ( damageType == false ) return false;

					} else {
						damageType = sourceItem.system.damage.type.value;
					}
					
					messageTitle += `per infliggere:`;
					messageContent = `
						<div class="flexrow">
							<div>${sourceItem.system.damage.value}</div>
							<div>danni da ${game.i18n.localize(FU.DamageTypes[damageType])}</div>
						</div>
					`;
				}

				const reducedIP = actor.system.resources.ip.current - sourceItem.system.IPCost;
				await actor.update({ 'system.resources.ip.current': reducedIP });

				const chatData = {
					user: game.user.id,
					speaker: ChatMessage.getSpeaker({ actor: this.name }),
					flavor: messageTitle,
					content: messageContent,
					flags: {
						customClass: 'consumable-check',
					},
				};
				ChatMessage.create(chatData);

			} else {
				ui.notifications.warn(`Non hai abbastanza Punti Inventario per utilizzare ${sourceItem.name}`);
			}

		} else if ( sourceItem.type == 'class' ) {

			if (
				await Dialog.confirm({
					title: `Stai acquisendo un livello nella classe ${sourceItem.name}`,
					content: `<p>Sei sicuro di voler acquisire un livello nella classe ${sourceItem.name}?</p>`,
					rejectClose: false,
				})
			) {
				await addClassToActor( actor, sourceItem );
			}

		} else if ( sourceItem.type == 'classFeature' ) {
			
			if (
				await Dialog.confirm({
					title: `Stai acquisendo l'abilità ${sourceItem.name}`,
					content: `<p>Sei sicuro di voler acquisire un livello nella classe ${sourceItem.folder.name} per ottenere l'abilità ${sourceItem.name}?</p>`,
					rejectClose: false,
				})
			) {
				await addClassToActor( actor, sourceItem, true );
			}

		} else if ( sourceItem.type == 'heroicSkill' ) {

			const classes = actor.items.filter( item => item.type == 'class' && item.system.level.value == 10 );
			const heroics = actor.items.filter( item => item.type == 'heroicSkill' );
			if ( classes.length - heroics.length > 0) {

				let obtainSkill = false;

				// Check Class
				if ( sourceItem.system.requirements.class.length > 0 ) {
					
					if ( sourceItem.system.requirements.multiClass ) {
						const checkClasses = classes.filter( item => item.type == 'class' && sourceItem.system.requirements.class.includes( item.name ) );
						if ( checkClasses.length >= 2 )
							obtainSkill = true;
						else
							obtainSkill = false;
					} else {
						if ( classes.some( item => sourceItem.system.requirements.class.includes( item.name ) ) )
							obtainSkill = true;
						else
							obtainSkill = false;
					}
				}

				// Check Class Feature
				if ( sourceItem.system.requirements.classFeature.length > 0 ) {
					const allClasses = actor.items.filter( item => item.type == 'class' );
					if ( !(allClasses.some( (item) => {
						let checked = false;
						if ( item.flags?.fabula?.subItems ) {
							if ( sourceItem.system.requirements.multiClassFeature ) {
								// const checkFeature = subItem.filter( item => item.type == 'class' && sourceItem.system.requirements.class.includes( item.name ) );
								if ( sourceItem.system.requirements.classFeature.every( str => item.flags.fabula.subItems.some( item => item.name == str ) ) )
									checked = true;
							} else {
								for ( const subItem of item.flags?.fabula?.subItems ) {
									if ( sourceItem.system.requirements.classFeature.includes( subItem.name )  ) {
										if ( sourceItem.system.requirements.classFeatureLevel > 0 ) {
											if ( subItem.system.level.current >= sourceItem.system.requirements.classFeatureLevel )
												checked = true;
										} else {
											checked = true;
										}
									}
								}
							}
						}

						return checked;
					})) ) obtainSkill = false;
				}

				// Check Actor level
				if ( sourceItem.system.requirements.level > 0 ) {
					if ( !(actor.system.level.value >= sourceItem.system.requirements.level) ) obtainSkill = false;
				}

				// Check Spells
				if ( sourceItem.system.requirements.spell.length > 0 ) {
					const spells = actor.items.filter( item => item.type == 'spell' );
					if ( !(sourceItem.system.requirements.spell.every( str => spells.some( item => item.name == str ) )) ) obtainSkill = false;
				}

				// Check Offensive Spells
				if ( sourceItem.system.requirements.offensiveSpells > 0 ) {
					const offensiveSpells = actor.items.filter( item => item.type == 'spell' && item.system.isOffensive.value === true );
					if ( !(offensiveSpells.length >= sourceItem.system.requirements.offensiveSpells) ) obtainSkill = false;
				}

				if ( obtainSkill ) {
					actor.createEmbeddedDocuments( 'Item', [sourceItem] );
					ui.notifications.info(`Abilità Eroica ${sourceItem.name} aggiunta!`);
				} else {
					ui.notifications.warn(`Non possiedi i requisiti necessari per ottenere l'Abilità Eroica ${sourceItem.name}!`);
				}

			} else {
				ui.notifications.warn(`Non puoi acquisire l'Abilità Eroica ${sourceItem.name} finché non padroneggi un'altra classe!`);
			}

		} else {
			actor.createEmbeddedDocuments( 'Item', [sourceItem] );
		}

	}

	activateListeners( html ) {
		super.activateListeners( html );

		// Debug Actor
		html.on('click','.getActor', () => console.log(this.actor));

		// Abilitate operations inside HP / MP / IP inputs
		html.on('change',"input[name='system.resources.hp.current']", async (event) => {
			const operators = [ '-', '+' ];
			const currentHP = this.actor.system.resources.hp.current;
			const stringVal = $(event.currentTarget).val();
			const inputVal = parseFloat( $(event.currentTarget).val() );
			
			if ( operators.includes( stringVal[0] ) ) {
				if ( !isNaN(inputVal) ) {
					const newHP = currentHP + inputVal;
					await this.actor.update({ 'system.resources.hp.current': newHP });
				}
			} else if ( isNaN(inputVal) ) {
				await this.actor.update({ 'system.resources.hp.current': currentHP });
			}
		});
		html.on('change',"input[name='system.resources.mp.current']", async (event) => {
			const operators = [ '-', '+' ];
			const currentMP = this.actor.system.resources.mp.current;
			const stringVal = $(event.currentTarget).val();
			const inputVal = parseFloat( $(event.currentTarget).val() );
			
			if ( operators.includes( stringVal[0] ) ) {
				if ( !isNaN(inputVal) ) {
					const newMP = currentMP + inputVal;
					await this.actor.update({ 'system.resources.mp.current': newMP });
				}
			} else if ( isNaN(inputVal) ) {
				await this.actor.update({ 'system.resources.mp.current': currentMP });
			}
		});
		html.on('change',"input[name='system.resources.ip.current']", async (event) => {
			const operators = [ '-', '+' ];
			const currentIP = this.actor.system.resources.ip.current;
			const stringVal = $(event.currentTarget).val();
			const inputVal = parseFloat( $(event.currentTarget).val() );
			
			if ( operators.includes( stringVal[0] ) ) {
				if ( !isNaN(inputVal) ) {
					const newIP = currentIP + inputVal;
					await this.actor.update({ 'system.resources.ip.current': newIP });
				}
			} else if ( isNaN(inputVal) ) {
				await this.actor.update({ 'system.resources.ip.current': currentIP });
			}
		});

		// Toggle collapse on Sheet open
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

		// Toggle inner tabs on Sheet open
		$(html).find('.tabs.inner-tabs[data-group="secondary"] > .item').each((index, element) => {
			if ( $(element).is(`[data-tab="${lastOpennedInnerTab}"]`) ) {
				$(element).addClass('active');
				$(html).find(`.tab.inner-tab[data-group="secondary"][data-tab="${lastOpennedInnerTab}"]`).addClass('active');
			} else {
				$(element).removeClass('active');
				$(html).find(`.tab.inner-tab[data-group="secondary"][data-tab="${$(element).data('tab')}"]`).removeClass('active');
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
						lastOpennedInnerTab = tab;
					} else {
						$(el).removeClass('active');
					}
				});

			}
		});

		// Open Compendium
		html.on('click', '.js_openCompendium', this._openCompendium.bind(this));

		// Roll a Test
		html.on('click', '.js_rollActorTest', this._rollActorTest.bind(this));

		// Roll for initiative
		html.on('click', '.js_rollInitiative', this._rollInitiative.bind(this));

		// Use Fabula Points or Ultima Points
		html.on('click', '.js_useFUPoint', this._useFUPoint.bind(this));

		// Set Attributes values
		html.on('click', '.js_setAttrValue', this._setAttrValue.bind(this));

		// Equip Item
		html.on('click','.js_equipItem', this._equipItem.bind(this));

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

		// Set NPC skill as free
		html.on('click', '.js_setFreeFeature', this._setFreeFeature.bind(this));

		// Manage Active Effects
		html.on('click','.js_manageActiveEffect', async (e) => manageActiveEffect(e, this.actor));

		// Add new bond
		html.on('click', '.js_addNewBond', async (ev) => {
			ev.preventDefault();
			const array = this.actor.system.bond;
			const bonds = [...array];
			bonds.push({});
			await this.actor.update({ 'system.bond': bonds });
		});

		// Remove bond by index
		html.on('click', '.js_deleteBond', async (ev) => {
			ev.preventDefault();
			const index = ev.currentTarget.dataset.index;
			const array = this.actor.system.bond;
			const bonds = [...array];
			if ( index ) {
				bonds.splice( index, 1 );
				await this.actor.update({ 'system.bond': bonds });
			}
		});

		// Level up Character
		html.on('click', '.js_levelUpCharacter', this._levelUpCharacter.bind(this));

		if (!this.isEditable) return;
	}

	_getSubmitData( updateData = {} ) {
		const data = super._getSubmitData( updateData );
		
		if ( this.actor.type == 'npc' ) {
			const defaultPath = 'systems/fabula/assets/img/npc/default';
			if ( data['img'] == 'icons/svg/mystery-man.svg' || data['img'].includes(defaultPath) ) {
				data['img'] = `${defaultPath}/${data['system.species.value']}.png`;
			}
		}
		data['token.texture.src'] = data['img'];

		return data;
	}

	async _prepareItems(context) {
		const weapons = [];
		const armors = [];
		const shields = [];
		const accessories = [];
		const classes = [];
		const heroicSkills = [];
		const spells = [];
		const projects = [];
		const rituals = [];
		const baseItems = [];
		const attacks = [];
		const effects = [];

		for ( let i of context.items ) {

			// Enriches description fields
			for ( let item of context.items ) {
				item.enrichedHtml = {
					description: await TextEditor.enrichHTML( item.system?.description ?? '' ),
					opportunity: await TextEditor.enrichHTML( item.system?.opportunityEffect ?? '' ),
				};
			}

			// Enriches flags description fields
			if ( i.flags?.fabula ) {
				for ( let [namespace, values] of Object.entries(i.flags.fabula) ) {
					for ( let [key, value] of Object.entries(values) ) {
						value.enrichedHtml = {
							description: await TextEditor.enrichHTML( value.system?.description ?? '' ),
						}
					}
				}
			}

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
			} else if (i.type === 'heroicSkill') {
				heroicSkills.push(i);
			} else if (i.type === 'spell') {
				spells.push(i);
			} else if (i.type === 'project') {
				projects.push(i);
			} else if (i.type === 'ritual') {
				rituals.push(i);
			} else if (i.type === 'baseItem') {
				baseItems.push(i);
			} else if (i.type === 'attack') {
				attacks.push(i);
			} else if (i.type === 'effect') {
				effects.push(i);
			}
		}

		// Sort Weapons and Attacks by range
		weapons.sort((a, b) => {
			if ( a.system.range == 'melee' && b.system.range == 'ranged' ) return -1;
			if ( a.system.range == 'ranged' && b.system.range == 'melee' ) return 1;
			return a.name.localeCompare( b.name );
		});
		attacks.sort((a, b) => {
			if ( a.system.range == 'melee' && b.system.range == 'ranged' ) return -1;
			if ( a.system.range == 'ranged' && b.system.range == 'melee' ) return 1;
			return a.name.localeCompare( b.name );
		});

		context.weapons = weapons;
		context.armors = armors;
		context.shields = shields;
		context.accessories = accessories;
		context.classes = classes;
		context.heroicSkills = heroicSkills;
		context.spells = spells;
		context.projects = projects;
		context.rituals = rituals;
		context.baseItems = baseItems;
		context.attacks = attacks;
		context.effects = effects;
		context.classFeature = {};

		for (const item of this.actor.itemTypes.classFeature) {
			const featureType = (context.classFeature[item.system.featureType] ??= {
				feature: item.system.data?.constructor,
				items: {},
			});
			featureType.items[item.id] = { item, additionalData: await featureType.feature?.getAdditionalData(item.system.data) };
		}
	}

	async _levelUpCharacter(event) {
		event.preventDefault();
		const actor = this.actor;
		const context = await this.getData();
		const compendium = game.packs.get('fabula.classes');

		let content = `<div class="folders-tabs">`;
		let counter = 0;
		for ( const folder of context.itemLists.class ) {

			const folderID = folder.folder.toLowerCase().replace(/[^a-z]/g, '');
			content += `<button type="button" class="folder-tab ${folderID} ${counter == 0 ? 'active' : ''}" data-dialog-tab="${folderID}">${folder.folder}</button>`;
			counter++;

		}
		content += `</div>`;
		content += `<div class="folders-content">`;
		counter = 0;
		for ( const folder of context.itemLists.class ) {

			const folderID = folder.folder.toLowerCase().replace(/[^a-z]/g, '');
			content += `<div class="folder-list ${folderID} ${counter == 0 ? 'active' : ''}" data-dialog-tab="${folderID}">`;
			for ( const item of folder.items ) {

				const itemClass = await compendium.getDocument( item._id );
				content += `
					<div class="form-class-group">
						<label>
							<input type="radio" name="formClass" value="${itemClass.name}" />
							<div class="class-icon">
								<img src="${itemClass.img}" alt="${itemClass.name}" />
							</div>
							<div class="class-name">
								${generateDataLink( itemClass, itemClass.name, `Apri classe ${itemClass.name}` )}
							</div>
						</label>
					</div>
				`;
				
			}
			content += `</div>`;
			counter++;

		}
		content += `</div>`;

		new Dialog({
			title: 'Seleziona Classe',
			content: `
				<form class="form-choose-class">
					${content}
				</form>
			`,
			buttons: {
				cancel: {
					label: 'Annulla',
				},
				confirm: {
					label: 'Conferma',
					callback: async (html) => {
						const selectedClass = html.find('[name="formClass"]:checked').val();
						if ( selectedClass != '' ) {
							const entry = compendium.index.find(e => e.name === selectedClass);
							if (entry) {
								const soruceItem = await compendium.getDocument(entry._id);
								await addClassToActor( actor, soruceItem );
								return true;
							}
						} else {
							ui.notifications.error('Devi selezionare una classe');
							return false;
						}
					}
				},
			},
			render: (html) => {
				const folders = html.find('.folders-tabs .folder-tab');
				folders.each((index, folder) => {
					$(folder).on('click', (e) => {
						e.preventDefault();
						const element = e.currentTarget;
						const tab = $(element).data('dialog-tab');
						$(element).siblings().each((i, list) => {
							$(list).removeClass('active');
						});
						$(element).addClass('active');

						html.find('.folders-content .folder-list').each((i, list) => {
							$(list).removeClass('active');
							if ( $(list).is(`[data-dialog-tab="${tab}"]`) ) {
								$(list).addClass('active');
							}
						});
					});
				});
			},
		}, {
			width: 500,
			height: 400,
		}).render(true);

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

	async _setFreeFeature(event) {
		event.preventDefault();
		if ( this.actor.type != 'npc' ) return;

		const element = event.currentTarget;
		const itemID = element.dataset.itemid;
		console.log(itemID);
		const item = this.actor.items.get( itemID );

		if ( item ) {
			await item.update({ 'system.isFree': !item.system.isFree });
		}
	}

	async _rollActorTest(event) {
		event.preventDefault();
		const actor = this.actor;

		let contentString = `
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
		`;
		if ( actor.system.bonus?.checks?.base > 0 ) {
			contentString += `
				<div class="form-group">
					<input type="checkbox" name="formBonusCheck" id="formBonusCheck" />
					<label for="formBonusCheck">Applicare bonus ai Test Contrapposti? (+${actor.system.bonus?.checks?.base})</label>
				</div>
			`;
		}

		new Dialog({
			title: 'Effettua un test',
			content: `
				<div class="skill-test">
					<div class="flexrow">
						<h4>Scegli le caratteristiche</h4>
						${contentString}
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
							const primary = actor.system.attributes[attrPrimary].current;
							const secondary = actor.system.attributes[attrSecondary].current;
							rollString += `d${primary}+d${secondary}`;
							
							if ( bonusCheck ) {
								rollString += `+${actor.system.bonus.checks.base}`;
							}

							await rollDiceToChat( actor, rollString );

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

		const createdItem = await Item.create(itemData, { parent: this.actor });
		createdItem.sheet.render(true);
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

		if ( item.name == FU.UnarmedStrike.name ) {
			ui.notifications.warn(`Non puoi eliminare l'Item ${FU.UnarmedStrike.name}`);
			return;
		}

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
		const flag = element.dataset.flag || false;
		const item = this.actor.items.get( itemID );		

		let messageTitle;
		let messageContent;
		
		if ( flag && item.flags?.fabula?.subItems[flag] ) {
			const subItem = item.flags?.fabula?.subItems[flag];
			messageTitle = subItem.name;
			messageContent = subItem.system.description;
		} else {
			messageTitle = item.name;
			messageContent = item.system.description;
		}

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

	async _rollInitiative(event) {
		event.preventDefault();
		const actor = this.actor;
		let rollString = `d${actor.system.attributes.dex.current}+d${actor.system.attributes.ins.current}`;
		if ( actor.system.params.init.value != 0 )
			rollString += `+${actor.system.params.init.value}`;

		await rollDiceToChat( actor, rollString, null, 'init' );
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
			rollString += `d${actor.system.attributes[attrPrimary].current}`;
		}
		if ( attrPrimary && attrSecondary ) rollString += '+';
		if ( attrSecondary ) {
			rollString += `d${actor.system.attributes[attrSecondary].current}`;
		}
		if (item.type == 'attack' || item.type == 'weapon' ) {
			if ( item.system.precisionBonus != 0 ) {
				rollString += `+${item.system.precisionBonus}`;
			}

			if ( actor.system.bonus?.checks?.attack > 0 ) {
				rollString += `+${actor.system.bonus.checks.attack}`;
			}
		}
		if ( item.type == 'spell' && actor.system.bonus?.checks?.spell > 0 ) {
			rollString += `+${actor.system.bonus.checks.spell}`;
		}

		await rollDiceToChat( actor, rollString, null, templateType, item, template );
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

	async _equipItem(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const itemID = element.dataset.itemid;

		const item = this.actor.items.get( itemID );

		if ( item ) {

			const equippedData = foundry.utils.deepClone(this.actor.system.equip);
			let slot;
			if ( item.type == 'weapon' ) {
				slot = 'mainHand';
			} else if ( item.type == 'shield' ) {
				slot = 'offHand';
			} else if ( item.type == 'armor' ) {
				slot = 'armor';
			} else if ( item.type == 'accessory' ) {
				slot = 'accessory';
			}

			if ( this.actor.type == 'character' && item.system.isMartial.value ) {
				let martialSlot = slot;
				if ( item.type == 'weapon' ) {
					martialSlot = item.system.range;
				}

				if ( !this.actor.system.useMartial[martialSlot] ) {
					ui.notifications.warn(`Non puoi equipaggiare ${item.name} perché è un'equipaggiamento Marziale`);
					return false;
				}
			}

			if ( equippedData[slot] !== null && equippedData[slot] !== item._id ) {
				const equippedItem = this.actor.items.get( equippedData[slot] );
				if ( equippedItem ) {
					await equippedItem.update({ 'system.isEquipped': false });
				}
			}

			if ( item.system.needTwoHands ) {
				if ( equippedData.mainHand !== null && equippedData.mainHand !== itemID ) {
					const mainHandItem = this.actor.items.find( item => item._id == equippedData.mainHand );
					if ( mainHandItem.system.isEquipped ) {
						await mainHandItem.update({ 'system.isEquipped': false });
					}
				}
				if ( equippedData.offHand !== null && equippedData.offHand !== itemID ) {
					const offHandItem = this.actor.items.find( item => item._id == equippedData.offHand );
					if ( offHandItem.system.isEquipped ) {
						await offHandItem.update({ 'system.isEquipped': false });
					}
				}

				equippedData.mainHand = equippedData.mainHand == itemID ? null : itemID;
				equippedData.offHand = equippedData.offHand == itemID ? null : itemID;
			} else {
				if ( ( slot == 'offHand' || slot == 'mainHand' ) && equippedData.mainHand === equippedData.offHand ) {
					equippedData.mainHand = null;
					equippedData.offHand = null;
				}
				equippedData[slot] = equippedData[slot] == itemID ? null : itemID;
			}
			
			const embeddedItem = this.actor.items.find( item => item.name == FU.UnarmedStrike.name );
			if ( embeddedItem ) {
				if ( !equippedData.mainHand ) {
					equippedData.mainHand = embeddedItem._id;
					await embeddedItem.update({ 'system.isEquipped': true });
				} else if ( !equippedData.offHand ) {
					equippedData.offHand = embeddedItem._id;
					await embeddedItem.update({ 'system.isEquipped': true });
				}
			}

			if ( item.name !== embeddedItem.name ) {
				await item.update({ 'system.isEquipped': !item.system.isEquipped});
			}
			await this.actor.update({ 'system.equip': equippedData });

		}
	}

	_openCompendium(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const compendiumID = element.dataset.compendium;

		if ( compendiumID ) {
			const compendium = game.packs.get( compendiumID );
			if ( compendium )
				compendium.render(true);
			else
				ui.notifications.error(`Il compendio ${compendiumID} non è stato trovato!`);
		}
	}

	async _useFUPoint(event) {
		event.preventDefault();
		const actor = this.actor;
		const resource = actor.type == 'character' ? 'fp' : 'up';
		const currentResource = actor.system.resources[resource].current;
		if ( currentResource > 0 ) {

			const newResource = currentResource - 1;
			const journal = await initSessionJournal();
			const chatData = {
				actor: actor,
				currentResource: currentResource,
				newResource: newResource,
			};
			await incrementSessionResource( resource, journal, chatData );
			await actor.update({ 'system.resources.fp.current': newResource });

		}
	}
}