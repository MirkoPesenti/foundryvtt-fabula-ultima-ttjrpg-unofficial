// Classes
import { FabulaActor } from './documents/actors/actor.mjs';
import { FabulaItem } from './documents/items/item.mjs';
import { FabulaCombat } from './ui/combat.mjs';

// Sheets
import { FabulaActorSheet } from './sheets/actor-sheet.mjs';
import { FabulaItemSheet } from './sheets/item-sheet.mjs';

// Helpers
import { FU, SYSTEM } from './helpers/config.mjs';
import { slugify } from './utilities.mjs';
import { awaitDialogSelect, generateDataLink } from './helpers/helpers.mjs';
import { preloadPartialTemplates } from './helpers/templates.mjs';
import { rollDiceToChat } from './helpers/roll-helpers.mjs';
import { openClockDialog, renderClock } from './helpers/clock-helpers.mjs';
import { addNewPageToJournal, initSessionJournal, incrementSessionResource } from './helpers/journal-helpers.mjs';
import { statusEffects } from './helpers/status-helpers.mjs';
import { checkParams, addClassToActor } from './helpers/class-helpers.mjs';

// Actors Data Models
import { CharacterDataModel } from './documents/actors/character-data-model.mjs';
import { NpcDataModel } from './documents/actors/npc-data-model.mjs';

// Items Data Models
import { AccessoryDataModel } from './documents/items/accessory-data-model.mjs';
import { ArcanumDataModel } from './documents/items/arcanum-data-model.mjs';
import { ArmorDataModel } from './documents/items/armor-data-model.mjs';
import { AttackDataModel } from './documents/items/attack-data-model.mjs';
import { BaseDataModel } from './documents/items/base-data-model.mjs';
import { CLassDataModel } from './documents/items/class-data-model .mjs';
import { CLassFeatureDataModel } from './documents/items/classFeatures/class-feature-model.mjs';
import { ConsumableDataModel } from './documents/items/consumable-data-model.mjs';
import { HeroicSkillDataModel } from './documents/items/heroicSkill-data-model.mjs';
import { ProjectDataModel } from './documents/items/project-data-model.mjs';
import { RitualDataModel } from './documents/items/ritual-data-model.mjs';
import { RuleDataModel } from './documents/items/rule-data-model.mjs';
import { ShieldDataModel } from './documents/items/shield-data-model.mjs';
import { SkillDataModel } from './documents/items/skill-data-model.mjs';
import { SpellDataModel } from './documents/items/spell-data-model.mjs';
import { WeaponDataModel } from './documents/items/weapon-data-model.mjs';

/* ============================= */
/* 			Init Hook			 */
/* ============================= */

Hooks.once('init', async () => {

	console.log(`${SYSTEM} | Initializing Fabula Ultima TTJRPG (Unofficial)`);
	
	// Custum const for config
	CONFIG.FU = FU;

	// Utilities classes to global game object
	game.fabula = {
		FabulaActor,
		FabulaItem,
		utils: {
			slugify,
		},
	};

	// Custom document classes
	CONFIG.Actor.documentClass = FabulaActor;
	CONFIG.Actor.dataModels = {
		character: CharacterDataModel,
		npc: NpcDataModel,
	};
	CONFIG.Item.documentClass = FabulaItem;
	CONFIG.Item.dataModels = {
		accessory: AccessoryDataModel,
		arcanum: ArcanumDataModel,
		armor: ArmorDataModel,
		attack: AttackDataModel,
		base: BaseDataModel,
		class: CLassDataModel,
		classFeature: CLassFeatureDataModel,
		consumable: ConsumableDataModel,
		heroicSkill: HeroicSkillDataModel,
		project: ProjectDataModel,
		ritual: RitualDataModel,
		rule: RuleDataModel,
		shield: ShieldDataModel,
		skill: SkillDataModel,
		spell: SpellDataModel,
		weapon: WeaponDataModel,
	};
	
	CONFIG.ActiveEffect.legacyTransferral = false;

	// Custom Combat classes
	CONFIG.Combat.documentClass = FabulaCombat;

	// Register status effects
	CONFIG.ActiveEffect.legacyTransferral = false;
	statusEffects.sort((a, b) => {
		if ( a.id < b.id ) return -1;
		if ( a.id > b.id ) return 1;
		return 0;
	});
	
	CONFIG.statusEffects = statusEffects;
	CONFIG.specialStatusEffects.DEFEATED = 'defeated';

	// Register Sheets
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('fabula', FabulaActorSheet, {
		makeDefault: true,
	});
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('fabula', FabulaItemSheet, {
		makeDefault: true,
	});

	return preloadPartialTemplates();

});

Hooks.once('setup', () => {});

Hooks.once('ready', async function () {

	// Check new session
	if ( game.user.isGM ) {
		const journal = await initSessionJournal();
	}

});

Hooks.on('renderPause', (app, [html]) => {
	// Change pause image
	html.classList.add("fabula");
	const img = html.querySelector("img");
	img.src = "systems/fabula/assets/icons/icon-fabula.svg";
	img.className = "";
});

Hooks.on('getSceneControlButtons', (controls) => {
	// Add clock button
	controls.push({
		name: 'clock',
		title: 'CONTROLS.GroupClock',
		icon: 'fa-solid fa-stopwatch',
		layer: 'controls',
		activeTool: 'create-clock',
		visible: true,
		tools: [
			{
				name: 'create-clock',
				title: 'CONTROLS.CreateClock',
				icon: 'fa-solid fa-plus-circle',
				button: true,
				onClick: () => openClockDialog(),
			}
		]
	});
});

Hooks.on('renderJournalPageSheet', async (app, html, data) => {

	// Render journal tracker
	const journal = await initSessionJournal();
	if ( journal._id === data.document.parent._id ) {
		html.on('click', '.js_giveExperienceSessionEnd', async (e) => {
			e.preventDefault();
			if ( game.user.isGM ) {

				if (
					await Dialog.confirm({
						title: `Stai per distribuire i Punti Esperienza`,
						content: `<p>Sei sicuro di voler continuare? Se lo fai, i dati raccolti durante questa sessione verranno archiviati</p>`,
						rejectClose: false,
					})
				) {

					const sessionDara = JSON.parse(data.data.text.content.split("<hr />")[0]) || {};
					let exp = 5;

					let playerNumber = 0;
					game.users.forEach(user => {
						if ( user.role == 1 || user.role == 2 )
							playerNumber++;
					});

					exp += sessionDara.resources.up || 0;
					exp += Math.floor( ( sessionDara.resources.fp || 0 ) / playerNumber );

					const chatData = {
						user: game.user.id,
						speaker: ChatMessage.getSpeaker({ actor: game.user.name }),
						flavor: `Punti esperienza di fine sessione`,
						content: `
							<p><strong>Punti Fabula</strong> spesi: ${sessionDara.resources.fp || 0}</p>
							<p><strong>Punti Ultima</strong> spesi: ${sessionDara.resources.up || 0}</p>
							<p><strong>PG</strong>: ${playerNumber}</p>
							<p><strong>Punti Esperienza</strong> totali: ${exp}</p>
							${generateDataLink( journal, `Apri ${journal.name}`, null, 'book-open' )}
							<button type="button" class="js_receiveSessionEndEXP" data-exp="${exp}">
								<i class="fa fa-fw fa-wand-magic-sparkles"></i>
								Ricevi i punti esperienza
							</button>
						`,
						flags: {
							customClass: 'fabula-point-check',
						},
					};
					ChatMessage.create(chatData);

					await addNewPageToJournal( journal, exp );

				}

			} else {
				ui.notifications.error('Solo il GM può distribuire i Punti Esperienza di fine sessione');
			}
		});
	}

});

Hooks.on('renderActiveEffectConfig', (app, html, data) => {
	const keys = [
		// Resources
		'system.resources.hp.bonus',
		'system.resources.mp.bonus',
		'system.resources.ip.bonus',

		// Attributes
		'system.attributes.dex.current',
		'system.attributes.ins.current',
		'system.attributes.mig.current',
		'system.attributes.wlp.current',
		
		// Defences
		'system.params.def.bonus',
		'system.params.mdef.bonus',
		'system.params.init.bonus',

		// Bonus to damages
		'system.bonus.damage.base',
		'system.bonus.damage.spell',
		'system.bonus.damage.type',

		// Bonus to rolls
		'system.bonus.checks.base',
		'system.bonus.checks.attack',
		'system.bonus.checks.spell',

		// Immunity to statusses
		'system.immunity.slow',
		'system.immunity.dazed',
		'system.immunity.weak',
		'system.immunity.shaken',
		'system.immunity.enraged',
		'system.immunity.poisoned',
		
		// Affinity to damages
		'system.affinity.physical',
		'system.affinity.air',
		'system.affinity.bolt',
		'system.affinity.dark',
		'system.affinity.earth',
		'system.affinity.fire',
		'system.affinity.ice',
		'system.affinity.light',
		'system.affinity.poison',
	];
	const values = [
		'true',
		'false',

		// Affinities
		'vulnerability',
		'resistance',
		'immunity',
		'absorption',
		'physical',

		// Damages
		'air',
		'bolt',
		'dark',
		'earth',
		'fire',
		'ice',
		'light',
		'poison',
	];

	const inputList = html.find('.changes-list .key input');
	inputList.each(function() {
		const inputField = $(this);
		inputField.on('input', function () {
			const input = this;
			const value = input.value.toLowerCase();
			const suggestions = keys.filter( key => key.toLowerCase().includes( value ) );

			html.find('.fabula-autocomplete-suggestions').remove();

			if ( suggestions.length > 0 ) {
				const suggestionList = $('<div class="fabula-autocomplete-suggestions"></div>');

				suggestions.forEach(sug => {
					const suggestionItem = $(`<div class="fabula-autocomplete-item">${sug}</div>`);
					suggestionItem.on('click', () => {
						$(input).val(sug);
						suggestionList.remove();
					});
					suggestionList.append(suggestionItem);
				});

				$(input).after(suggestionList);
			}
		});

		inputField.on('blur', () => {
			setTimeout(function() {
				html.find('.fabula-autocomplete-suggestions').remove();
			}, 200);
		});
	});

	const valueList = html.find('.changes-list .value input');
	valueList.each(function() {
		const inputField = $(this);
		inputField.on('input', function () {
			const input = this;
			const value = input.value.toLowerCase();
			const suggestions = values.filter( key => key.toLowerCase().includes( value ) );

			html.find('.fabula-autocomplete-suggestions').remove();

			if ( suggestions.length > 0 ) {
				const suggestionList = $('<div class="fabula-autocomplete-suggestions"></div>');
				suggestionList.css({'maxWidth': '130px'});

				suggestions.forEach(sug => {
					const suggestionItem = $(`<div class="fabula-autocomplete-item">${sug}</div>`);
					suggestionItem.on('click', () => {
						$(input).val(sug);
						suggestionList.remove();
					});
					suggestionList.append(suggestionItem);
				});

				$(input).after(suggestionList);
			}
		});

		inputField.on('blur', () => {
			setTimeout(function() {
				html.find('.fabula-autocomplete-suggestions').remove();
			}, 200);
		});
	});
});

Hooks.on("preCreateItem", async (item, options, userId) => {

	// Generate Fabula ID
	if ( !item.system.fabulaID && item.name )  {
		const id = game.fabula.utils.slugify( item.name );
		if ( id ) {
			item.updateSource({ 'system.fabulaID': id });
		} else {
			console.error(`Fabula ID generation failed on Item: ${item.name}`);
		}
	}

	// Set default image
	if ( !item.img || item.img === "icons/svg/item-bag.svg" ) {
		if ( item.type == 'rule' ) {
			item.updateSource({ img: 'systems/fabula/assets/icons/default-rule.png' });
		} else {
			item.updateSource({ img: `systems/fabula/assets/icons/default-${item.type}.svg` });
		}
	}

});

Hooks.on('preUpdateItem', async (item, updateData, options, userId) => {
	const updates = {};
	
	if ( item.type == 'classFeature' ) {
		const classOrigin = foundry.utils.getProperty(updateData, 'system.origin');
		const itemImage = foundry.utils.getProperty(updateData, 'img');
		if ( classOrigin && itemImage ) {	
			if ( itemImage == `systems/fabula/assets/icons/default-${item.type}.svg` || ( item.system?.origin != '' && itemImage == `systems/fabula/assets/icons/classes/${item.system.origin}.png` ) ) {
				updates['img'] = `systems/fabula/assets/icons/classes/${classOrigin}.png`;
			}
		}

		// Add Active Effects for level
		// const bonusKey = item.system.bonus.key;
		// if ( ( foundry.utils.hasProperty(updateData, 'system.level.current') || foundry.utils.hasProperty(updateData, 'system.bonus.key') || foundry.utils.hasProperty(updateData, 'system.bonus.modifier') || foundry.utils.hasProperty(updateData, 'system.bonus.temporary') ) && bonusKey ) {
		// 	if ( item.effects ) {
		// 		const effectToRemove = item.effects.find( effect => effect.name === `Bonus di ${item.name}` );
		// 		if ( effectToRemove ) {
		// 			await item.deleteEmbeddedDocuments("ActiveEffect", [effectToRemove.id]);
		// 		}
		// 	}
			
		// 	const newKey = foundry.utils.hasProperty(updateData, 'system.bonus.key') ? foundry.utils.getProperty(updateData, 'system.bonus.key') : bonusKey;

		// 	if ( newKey !== '' ) {
		// 		const modifier = foundry.utils.hasProperty(updateData, 'system.bonus.modifier') ? foundry.utils.getProperty(updateData, 'system.bonus.modifier') : item.system.bonus.modifier;
		// 		const newValue = foundry.utils.hasProperty(updateData, 'system.level.current') ? foundry.utils.getProperty(updateData, 'system.level.current') : item.system.level.current;
		// 		const isDisabled = foundry.utils.hasProperty(updateData, 'system.bonus.temporary') ? foundry.utils.getProperty(updateData, 'system.bonus.temporary') : item.system.bonus.temporary;

		// 		let changedValue = newValue;
		// 		if ( modifier[0] === '*' ) {
		// 			changedValue *= Number(modifier.substring(1));
		// 		} else if ( modifier[0] === '/' ) {
		// 			changedValue /= Number(modifier.substring(1));
		// 		} else if ( modifier[0] === '+' || modifier[0] === '-' || modifier !== '' ) {
		// 			changedValue += Number(modifier);
		// 		}

		// 		const existingEffect = item.effects.find((effect) => effect.name === `Bonus di ${item.name}`);
		// 		if ( !existingEffect ) {
		// 			await item.createEmbeddedDocuments('ActiveEffect', [{
		// 				label: `Bonus di ${item.name}`,
		// 				origin: item.uuid,
		// 				disabled: isDisabled,
		// 				changes: [
		// 					{
		// 						key: newKey,
		// 						mode: CONST.ACTIVE_EFFECT_MODES.ADD,
		// 						value: changedValue,
		// 					}
		// 				],
		// 			}]);
		// 		}
		// 	}
		// }
	}

	if ( Object.keys(updates).length > 0 ) {
		await item.update( updates );
	}
});

Hooks.on('renderItemSheet', (sheet, html, data) => {
	const item = sheet.item;

	// Change sheet theme based on sourcebook
	if ( item.system.sourcebook && sheet.options.classes ) {
		for ( const key in FU.sourcebook ) {
			html[0].classList.remove( key );
		}
		html[0].classList.add( item.system.sourcebook );
	}

});

Hooks.on('preUpdateActor', async (actor, updateData, options, userId) => {
	const equipped = foundry.utils.getProperty(updateData, 'system.equip');
	if ( !equipped ) return;

	const mainHandEquipped = equipped.mainHand === null;
	const offHandEquipped = equipped.offHand === null;
	if ( !mainHandEquipped && !offHandEquipped ) return;
	
	const unarmedStrike = actor.getItemByFabulaID('colpo-senz-armi');
	if ( !unarmedStrike ) return;

	const updates = {};
	if ( mainHandEquipped ) {
		updates['system.equip.mainHand'] = unarmedStrike._id;
	}
	if ( offHandEquipped ) {
		updates['system.equip.offHand'] = unarmedStrike._id;
	}

	if ( Object.keys(updates).length > 0 ) {
		await actor.update( updates );
	}
});

Hooks.on('preCreateActiveEffect', (effect, options, userId) => {
	// Check if actor is immune to status
	const actor = effect.parent;
	if ( !actor || !actor.system || !actor.system.immunity ) return;

	const statusID = CONFIG.statusEffects.find( (e) => effect.statuses.has( e.id ) )?.id;
	if ( statusID ) {

		const immunity = actor.system.immunity[statusID];
		if ( immunity ) {
			ui.notifications.info(`${actor.name} è immune allo status ${game.i18n.localize(`FU.Status.${statusID}`)}`);
			return false;		
		}
	}

	return true;
});

Hooks.on('renderChatMessage', (message, html, data) => {
	const customClass = message.flags.customClass;
	if ( customClass ) {
		html[0].classList.add(customClass);
	}

	// Full rest
	html.on('click', '.js_actorFullRest', async (e) => {
		e.preventDefault();
		const actor = game.user.character;
		if ( actor ) {
			await actor.fullRest();
		}
	});

	// Give exp for end of session
	html.on('click', '.js_receiveSessionEndEXP', async (e) => {
		e.preventDefault();
		const element = e.currentTarget;
		const exp = Number(element.dataset.exp) || 0;
		const actor = game.user.character;
		if ( actor ) {
			const currentExp = actor.system.level.exp;
			await actor.update({ 'system.level.exp': currentExp + exp });
			ui.notifications.info(`Hai ricevuto ${exp} Punti Esperienza.`);
			$(element).attr('disabled', true);
		}
	});

	// Add Bond bonus to Roll
	html.on('click', '.js_addRollBondBonus', async (e) => {
		e.preventDefault();
		const element = e.currentTarget;
		let rollFormula = element.dataset.formula;
		const rollResultPrimary = Number(element.dataset.primary);
		const rollResultSecondary = Number(element.dataset.secondary);
		const rollMode = element.dataset.mode;
		const itemID = element.dataset.item;
		const actorID = element.dataset.actor;
		const actor = game.actors.get( actorID );
		let item = null;
		if ( itemID != '' ) {
			item = actor.items.get( itemID );
		}

		if ( actor ) {
			if ( actor.type !== 'character' ) {
				ui.notifications.warn('Solo i personaggi possono invocare un legame');
				return false;
			}

			if ( actor.system.bond.length > 0 ) {

				let bondBonus = 0;
				let selectOptions = '';
				for ( const bond of actor.system.bond ) {
					selectOptions += `
						<option value="${bond.strength}">
							${bond.name}: +${bond.strength}
						</option>
					`;
				}

				bondBonus = await awaitDialogSelect({
					title: 'Stai invando un legame',
					optionsLabel: '<p>Scegli uno dei tuoi legami da invocare</p>',
					options: selectOptions,
				});

				if ( bondBonus === false ) return false;

				const currentFP = actor.system.resources.fp.current;
				if ( currentFP > 0 ) {
					const newFP = currentFP - 1;
					await actor.update({ 'system.resources.fp.current': newFP });

					const chatData = {
						actor: actor,
						currentResource: currentFP,
						newResource: newFP,
						bond: true,
					};
					const journal = await initSessionJournal();
					await incrementSessionResource( 'fp', journal, chatData );

					$(element).attr('disabled', true);
					rollFormula += `+${bondBonus}`;
					const roll = new Roll( rollFormula, actor.getRollData() );
					await roll.evaluate();
					roll.terms[0].results = [{ result: rollResultPrimary, active: true }];
					roll.terms[2].results = [{ result: rollResultSecondary, active: true }];
					roll._total = rollResultPrimary + rollResultSecondary;
					for ( const key in roll.terms ) {
						if ( key > 2 && typeof roll.terms[key].number !== 'undefined' ) {
							let bonus = Number(roll.terms[key].number);
							if ( typeof roll.terms[key - 1].operator !== 'undefined' && roll.terms[key - 1].operator == '-' )
								bonus *= -1;

							roll._total += bonus;
						}
					}
					
					await rollDiceToChat( actor, rollFormula, roll, rollMode, item );

				} else {
					ui.notifications.warn('Non puoi invocare un legame perché non hai abbastanza Punti Fabula');
				}

			} else {
				ui.notifications.warn('Non hai tratti da poter invocare');
			}
		}
	});

	// Reroll dice
	html.on('click', '.js_rerollDice', async (e) => {
		e.preventDefault();
		const element = e.currentTarget;
		const rollFormula = element.dataset.formula;
		const resultPrimary = element.dataset.resultPrimary;
		const rollPrimary = element.dataset.rollPrimary;
		const resultSecondary = element.dataset.resultSecondary;
		const rollSecondary = element.dataset.rollSecondary;
		const rollMode = element.dataset.mode;
		const itemID = element.dataset.item;
		const actorID = element.dataset.actor;
		const actor = game.actors.get( actorID );
		let item;
		let rollTemplate = 'systems/fabula/templates/chat/check-base.hbs';
		if ( itemID == '' ) {
			item = null;
		} else {
			item = actor.items.get( itemID );
			if ( item.type == 'weapon' )
				rollTemplate = 'systems/fabula/templates/chat/check-attack.hbs';
			else
				rollTemplate = `systems/fabula/templates/chat/check-${item.type}.hbs`;
		}

		if ( actor ) {
			const resource = actor.type == 'character' ? 'fp' : 'up';
			const currentResource = actor.system.resources[resource].current;
			if ( currentResource > 0 ) {

				let rerollDice = '';
				rerollDice = await awaitDialogSelect({
					title: `Stai invocando un tratto`,
					optionsLabel: '<p>Scegli il dado che vuoi ritirare</p>',
					options: `
						<option value="primary">
							${rollPrimary}: valore attuale - ${resultPrimary}
						</option>
						<option value="secondary">
							${rollSecondary}: valore attuale - ${resultSecondary}
						</option>
						<option value="all">
							Entrambi: ${rollPrimary} + ${rollSecondary}
						</option>
					`,
				});
				if ( rerollDice === false ) return false;

				let trait = '';
				if ( actor.type == 'character' ) {
					trait = await awaitDialogSelect({
						title: `Stai invocando un tratto`,
						optionsLabel: '<p>Scegli il tratto da invocare</p>',
						options: `
							<option value="identity">
								IDENTITÀ: ${actor.system.features.identity}
							</option>
							<option value="theme">
								TEMA: ${actor.system.features.theme}
							</option>
							<option value="origin">
								ORIGINE: ${actor.system.features.origin}
							</option>
						`,
					});
				} else {
					trait = actor.system.traits;
				}
				if ( trait === false ) return false;

				const newResource = currentResource - 1;
				const resourceKey = `system.resources.${resource}.current`;
				await actor.update({ [resourceKey]: newResource });

				const chatData = {
					actor: actor,
					currentResource: currentResource,
					newResource: newResource,
					trait: trait,
				};
				const journal = await initSessionJournal();
				await incrementSessionResource( resource, journal, chatData );

				const roll = new Roll( rollFormula, actor.getRollData() );
				await roll.evaluate();

				if ( rerollDice == 'primary' ) {
					roll.terms[2].results = [{ result: resultSecondary, active: true }];
				} else if ( rerollDice == 'secondary' ) {
					roll.terms[0].results = [{ result: resultPrimary, active: true }];
				}
				if ( rerollDice != 'all' ) {
					roll._total = Number(roll.terms[0].results[0].result) + Number(roll.terms[2].results[0].result);
					for ( const key in roll.terms ) {
						if ( key > 2 && typeof roll.terms[key].number !== 'undefined' ) {
							let bonus = Number(roll.terms[key].number);
							if ( typeof roll.terms[key - 1].operator !== 'undefined' && roll.terms[key - 1].operator == '-' )
								bonus *= -1;

							roll._total += bonus;
						}
					}
				}
				
				await rollDiceToChat( actor, rollFormula, roll, rollMode, item, rollTemplate );
			} else {
				ui.notifications.warn(`Non puoi ritirare i dadi perché non hai ${game.i18n.localize(`FU.${resource}`)} da spendere`);
			}
		}
	});

});

/* ============================= */
/* 		Handlebars Helpers		 */
/* ============================= */

Handlebars.registerHelper('or', function() {
	const args = Array.from(arguments).slice(0, -1);
	return args.some(arg => !!arg);
});

Handlebars.registerHelper('allTrue', function(...args) {
	const options = args.pop(); 
	return args.every(Boolean) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('atLeastTwoTrue', function(a, b, c, options) {
	const truthyCount = [a, b, c].filter(Boolean).length;
	return truthyCount >= 2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('getItemByID', function(items, itemID) {
	return items.find((item) => item._id === itemID);
});

Handlebars.registerHelper('getAttributeValue', function(resourcePath, attributeKey, options) {
    const value = resourcePath[attributeKey]?.value;
    return value !== undefined ? value : 0;
});

Handlebars.registerHelper("getProperty", function(obj, key) {
	return obj[key];
});  

Handlebars.registerHelper('concatPath', function (...args) {
	const options = args.pop();
	return args.join('');
}); 

Handlebars.registerHelper('percentage', function( a, b ){
	return ( ( a / b ) * 100 );
});

Handlebars.registerHelper('multiply', function( a, b ){
	return ( a * b );
});

Handlebars.registerHelper('divide', function( a, b ){
	return ( a / b );
});

Handlebars.registerHelper('add', function() {
    let args = Array.prototype.slice.call(arguments, 0, -1);
    return args.reduce((sum, value) => sum + ( Number(value) ? Number(value) : 0 ), 0);
});

Handlebars.registerHelper('reduce', function() {
    let args = Array.prototype.slice.call(arguments, 0, -1);
    return args.reduce((sum, value) => sum - ( Number(value) ? Number(value) : 0 ), 0);
});

Handlebars.registerHelper("arrayLength", function(array, length, options) {
	return Array.isArray(array) ? array.length : 0;
});

Handlebars.registerHelper("arrayLengthGt", function(array, length, options) {
	return Array.isArray(array) && array.length > length;
});

Handlebars.registerHelper("arrayLastIndex", function(index, array, options) {
	return Array.isArray(array) && (array.length - 1) == index;
});

Handlebars.registerHelper('gt', function( a, b ) {
	var next =  arguments[arguments.length-1];
	return (a > b) ? next.fn(this) : next.inverse(this);
});

Handlebars.registerHelper('gt_e', function( a, b ) {
	var next =  arguments[arguments.length-1];
	return (a >= b) ? next.fn(this) : next.inverse(this);
});

Handlebars.registerHelper('gte', function( a, b ) {
	var next =  arguments[arguments.length-1];
	return (a >= b);
});

Handlebars.registerHelper('sm', function( a, b ) {
	var next =  arguments[arguments.length-1];
	return (a < b);
});

Handlebars.registerHelper('sm_e', function( a, b ) {
	var next =  arguments[arguments.length-1];
	return (a <= b) ? next.fn(this) : next.inverse(this);
});

Handlebars.registerHelper("getItemsByFabulaID", function(array, options) {
	const items = array.map( id => game.items.get(id) );
	return Array.isArray(items) ? items : undefined;
});

Handlebars.registerHelper('selectGroupedOptions', function( groups, options ) {
	let html = '';
	if ( options.hash.blank ) html += `<option value="" ${options.hash.selected === '' ? 'selected' : ''}></option>`;
	
	for ( const group in groups )  {
		let label = group;
		let list = groups[group];

		if ( typeof list === 'object' ) {
			if ( options.hash.localize && groups[group].groupLabel ) label = game.i18n.localize(groups[group].groupLabel);
			html += `<optgroup label="${label}">`;

			if ( options.hash.sort ) list = Object.entries(list).sort((a, b) => {
				if ( options.hash.localize ) {
					const localizedA = game.i18n.localize(a[1]);
					const localizedB = game.i18n.localize(b[1]);
					return localizedA.localeCompare(localizedB);
				}
				return a[1].localeCompare(b[1]);
			});

			list.forEach(([key, value]) => {
				if ( key == 'groupLabel' ) return;

				let optLabel = value;
				if ( options.hash.localize ) optLabel = game.i18n.localize(value);
				html += `<option value="${key}" ${options.hash.selected == key ? 'selected' : ''}>${optLabel}</option>`;
			});
			html += '</optgroup>';
		} else if ( typeof list === 'string' ) {
			let optLabel = list;
			if ( options.hash.localize ) optLabel = game.i18n.localize(list);
			html += `<option value="${group}" ${options.hash.selected == group ? 'selected' : ''}>${optLabel}</option>`;
		}
	}

	return new Handlebars.SafeString(html);
});

Handlebars.registerHelper("renderItemList", function(obj, key) {

	const pack = obj[key];

	if ( pack.length < 1 ) {
		return new Handlebars.SafeString(`<div style="color:red">Error obj[key] not valid</div>`);
	} else {

		let template = `
			<table class="table-list ${key}">
				<tbody>
		`;

		if ( key == 'heroicSkill' ) {
			for ( const folder of pack ) {
				template += `
					<tr>
						<th colspan="3">${folder.folder}</th>
					</tr>
				`;
				for ( const item of folder.items ) {
					template += `
						<tr>
							<td>
								${generateDataLink( item )}
							</td>
							<td id="js_heroicSkillRequirements" data-uuid="${item.uuid}"></td>
							<td id="js_heroicSkillSummary" data-uuid="${item.uuid}"></td>
						</tr>
					`;
				}
			}
		} else if ( key == 'arcanum' ) {
			for ( const folder of pack ) {
				template += `
					<tr>
						<th colspan="2">${folder.folder}</th>
					</tr>
				`;
				for ( const item of folder.items ) {
					template += `
						<tr>
							<td>
								${generateDataLink( item )}
							</td>
							<td id="js_arcanumDomain" data-uuid="${item.uuid}"></td>
						</tr>
					`;
				}
			}
		}

		template += `
				</tbody>
			</table>
		`;

		return new Handlebars.SafeString(template);
	}

});
  