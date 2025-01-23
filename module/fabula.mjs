// Classes
import { FabulaActor } from './documents/actors/actor.mjs';
import { FabulaItem } from './documents/items/item.mjs';
import { FabulaCombat } from './ui/combat.mjs';

// Sheets
import { FabulaActorSheet } from './sheets/actor-sheet.mjs';
import { FabulaItemSheet } from './sheets/item-sheet.mjs';

// Helpers
import { FU, SYSTEM } from './helpers/config.mjs';
import { awaitDialogSelect, generateDataLink } from './helpers/helpers.mjs';
import { preloadPartialTemplates } from './helpers/templates.mjs';
import { rollDiceToChat } from './helpers/roll-helpers.mjs';
import { openClockDialog, renderClock } from './helpers/clock-helpers.mjs';
import { addNewPageToJournal, initSessionJournal, incrementSessionResource } from './helpers/journal-helpers.mjs';
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
import { CLassFeatureDataModel } from './documents/items/class-feature-model.mjs';
import { ConsumableDataModel } from './documents/items/consumable-data-model.mjs';
import { HeroicSkillDataModel } from './documents/items/heroicSkill-data-model.mjs';
import { ProjectDataModel } from './documents/items/project-data-model.mjs';
import { RitualDataModel } from './documents/items/ritual-data-model.mjs';
import { RuleDataModel } from './documents/items/rule-data-model.mjs';
import { ShieldDataModel } from './documents/items/shield-data-model.mjs';
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
		spell: SpellDataModel,
		weapon: WeaponDataModel,
	};
	
	CONFIG.ActiveEffect.legacyTransferral = false;

	// Custom Combat classes
	CONFIG.Combat.documentClass = FabulaCombat;

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
	
	// Get Unarmed Strike
	const pack = game.packs.get('fabula.equipment');
	const itemUnarmedStrike = await pack.getDocument( 'ULPXVZ44g7h3Wkw1' );
	FU.UnarmedStrike = itemUnarmedStrike.toObject();

	// Check new session
	if ( game.user.isGM ) {
		const journal = await initSessionJournal();
	}

});

Hooks.on("renderPause", (app, [html]) => {
	html.classList.add("fabula");
	const img = html.querySelector("img");
	img.src = "systems/fabula/assets/icons/icon-fabula.svg";
	img.className = "";
});

Hooks.on('getSceneControlButtons', (controls) => {
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
		'system.status.slow.immunity',
		'system.status.dazed.immunity',
		'system.status.weak.immunity',
		'system.status.shaken.immunity',
		'system.status.enraged.immunity',
		'system.status.poisoned.immunity',
		
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

Hooks.on("preCreateItem", (item, options, userId) => {
	if ( item.type == "rule" ) {
		if (!item.img || item.img === "icons/svg/item-bag.svg") {
			item.updateSource({ img: "systems/fabula/assets/icons/default-rule.png" });
		}
	} else if ( item.type == "heroicSkill" ) {
		if (!item.img || item.img === "icons/svg/item-bag.svg") {
			item.updateSource({ img: "systems/fabula/assets/icons/default-skill.png" });
		}
	}
});

Hooks.on('updateItem', async ( item, updateData, options, userId ) => {
	if ( item.type === 'project' && item.system.progress.current > item.system.progress.max ) {
		await item.update({ 'system.progress.current': item.system.progress.max });
	}
});

Hooks.on('renderItemSheet', (sheet, html, data) => {
	const item = sheet.item;

	if ( item.type == 'rule' ) {
		const heroicSkillReq = document.querySelectorAll('#js_heroicSkillRequirements');
		heroicSkillReq.forEach(async element => {

			const uuid = $(element).data('uuid');
			if ( uuid ) {
				const itemData = await fromUuid( uuid );
				if ( itemData.system.requirements.class.length > 0 ) {

					let template = '<strong>';
					if ( itemData.system.requirements.multiClass )
						template += 'Due tra ';

					for ( let i = 0; i < itemData.system.requirements.class.length; i++ ) {
						if ( i > 0 ) {
							if ( i == itemData.system.requirements.class.length - 1 ) {
								if ( itemData.system.requirements.multiClass )
									template += ' e ';
								else
									template += ' o ';
							} else {
								template += ', ';
							}
						}
						template += itemData.system.requirements.class[i];
					}
					template += '</strong>';
					$(element).html( template );

				}
			}

		});

		const heroicSkillSum = document.querySelectorAll('#js_heroicSkillSummary');
		heroicSkillSum.forEach(async element => {

			const uuid = $(element).data('uuid');
			if ( uuid ) {
				const itemData = await fromUuid( uuid );
				if ( itemData.system.summary ) {
					$(element).html( itemData.system.summary );
				} else {
					$(element).prev().attr('colspan','2');
					$(element).remove();
				}
			}

		});

		const arcanumDomain = document.querySelectorAll('#js_arcanumDomain');
		arcanumDomain.forEach(async element => {

			const uuid = $(element).data('uuid');
			if ( uuid ) {
				const itemData = await fromUuid( uuid );
				if ( itemData.system.domain ) {
					$(element).attr('style','text-align:center');
					$(element).html( '<strong>Domini:</strong> ' + itemData.system.domain );
				}
			}

		});
	}

});

Hooks.on('preUpdateActor', async (actor, updateData, options, userId) => {
	const equipped = foundry.utils.getProperty(updateData, 'system.equip');
	if ( !equipped ) return;

	const mainHandEquipped = equipped.mainHand === null;
	const offHandEquipped = equipped.offHand === null;
	if ( !mainHandEquipped && !offHandEquipped ) return;
	
	const embeddedUnarmedStrike = actor.items.find( item => item.name == FU.UnarmedStrike.name );
	if ( !embeddedUnarmedStrike ) return;

	const updates = {};
	if ( mainHandEquipped ) {
		updates['system.equip.mainHand'] = embeddedUnarmedStrike._id;
	}
	if ( offHandEquipped ) {
		updates['system.equip.offHand'] = embeddedUnarmedStrike._id;
	}

	if ( Object.keys(updates).length > 0 ) {
		await actor.update( updates );
	}
});

// let characterCreationOpen = false;
// Hooks.on('renderActorSheet', (sheet, html, data)  => {
// 	const actor = sheet.actor;

// 	if ( characterCreationOpen ) return;

// 	characterCreationOpen = true;

// 	// Continue only if Actor is character
// 	if ( actor.type != 'character' ) return;

// 	// Continue only if Actor is level 5 or above
// 	if ( actor.system.level.value >= 5 ) return;

// 	let currentStep = 0;

// 	// Prepare classes options
// 	const pack = game.packs.get('fabula.classes');
// 	const sortedPack = pack.index.contents.sort( ( a, b ) => a.name.localeCompare(b.name) );
// 	const actorClasses = actor.getFlag('fabula', 'classes') || [];
// 	const actorClassFeatures = actor.getFlag('fabula', 'classFeatures') || [];
// 	let classOptions = '';
// 	sortedPack.forEach((value, key) => {
// 		classOptions += `
// 			<div class="form-group">
// 				<label for="class_${value.name}">${value.name}</label>
// 				<input type="radio" name="formClass" id="class_${value.name}" value="${value._id}" />
// 			</div>
// 		`;
// 	});

// 	const steps = [
// 		{
// 			title: 'Crea l\'Identità',
// 			content: `
// 				<p>Crea l'<strong>Identità</strong> del personaggio: una breve frase che descrive con poche parole come vede sé stesso in questo momento.</p>
// 				<input type="text" name="formIdentity" placeholder="Identità" value="${actor.system.features.identity}" />
// 			`,
// 			validate: async (html) => {
// 				const identity = html.find('[name="formIdentity"]').val();
// 				if ( !identity ) {
// 					ui.notifications.warn(`Devi inserire un'Identità`);
// 					return false;
// 				}
// 				await actor.update({ 'system.features.identity': identity });
// 				return true;
// 			}
// 		},
// 		{
// 			title: 'Scegli o crea il Tema',
// 			content: `
// 				<p>Scegli o crea il <strong>Tema</strong> del personaggio: un ideale, un'emozione o un sentimento che ne domina le azioni.</p>
// 				<input type="text" name="formTheme" placeholder="Tema" value="${actor.system.features.theme}" />
// 			`,
// 			validate: async (html) => {
// 				const theme = html.find('[name="formTheme"]').val();
// 				if ( !theme ) {
// 					ui.notifications.warn(`Devi inserire un Tema`);
// 					return false;
// 				}
// 				await actor.update({ 'system.features.theme': theme });
// 				return true;
// 			}
// 		},
// 		{
// 			title: 'Scegli o crea l\'Origine',
// 			content: `
// 				<p>Scegli o crea l'<strong>Origine</strong> del personaggio: il luogo da cui proviene. Puoi usare uno di quelli già presenti sulla <strong>scheda del mondo</strong> o crearne uno nuovo.</p>
// 				<input type="text" name="formOrigin" placeholder="Origine" value="${actor.system.features.origin}" />
				
// 			`,
// 			validate: async (html) => {
// 				const origin = html.find('[name="formOrigin"]').val();
// 				if ( !origin ) {
// 					ui.notifications.warn(`Devi inserire un'Origine`);
// 					return false;
// 				}
// 				await actor.update({ 'system.features.origin': origin });
// 				return true;
// 			}
// 		},
// 		{
// 			title: 'Opzione di livello 1 (1/5)',
// 			content: `
// 				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
// 				${classOptions}
// 			`,
// 			validate: async (html) => {
// 				const classID = html.find('[name="formClass"]:checked').val();
// 				if ( !classID ) {
// 					ui.notifications.warn('Devi scegliere una classe');
// 					return false;
// 				}
// 				actorClasses.splice( 0, actorClasses.length );
// 				if ( actorClassFeatures.length > 0 ) {
// 					if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
// 						actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
// 					else 
// 						actorClassFeatures.splice( 0, actorClassFeatures.length );
// 				}
// 				return await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
// 			}
// 		},
// 		{
// 			title: 'Opzione di livello 2 (2/5)',
// 			content: `
// 				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
// 				${classOptions}
// 			`,
// 			validate: async (html) => {
// 				const classID = html.find('[name="formClass"]:checked').val();
// 				if ( !classID ) {
// 					ui.notifications.warn('Devi scegliere una classe');
// 					return false;
// 				}
// 				actorClasses.splice( 1, actorClasses.length - 1 );
// 				if ( actorClassFeatures.length > 0 ) {
// 					if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
// 						actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
// 					else 
// 						actorClassFeatures.splice( 1, actorClassFeatures.length - 1 );
// 				}
// 				return await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
// 			}
// 		},
// 		{
// 			title: 'Opzione di livello 3 (3/5)',
// 			content: `
// 				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
// 				${classOptions}
// 			`,
// 			validate: async (html) => {
// 				const classID = html.find('[name="formClass"]:checked').val();
// 				if ( !classID ) {
// 					ui.notifications.warn('Devi scegliere una classe');
// 					return false;
// 				}
// 				actorClasses.splice( 2, actorClasses.length - 2 );
// 				if ( actorClassFeatures.length > 0 ) {
// 					if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
// 						actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
// 					else 
// 						actorClassFeatures.splice( 2, actorClassFeatures.length - 2 );
// 				}
// 				return await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
// 			}
// 		},
// 		{
// 			title: 'Opzione di livello 4 (4/5)',
// 			content: `
// 				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
// 				${classOptions}
// 			`,
// 			validate: async (html) => {
// 				const classID = html.find('[name="formClass"]:checked').val();
// 				if ( !classID ) {
// 					ui.notifications.warn('Devi scegliere una classe');
// 					return false;
// 				}
// 				actorClasses.splice( 3, actorClasses.length - 3 );
// 				if ( actorClassFeatures.length > 0 ) {
// 					if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
// 						actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
// 					else 
// 						actorClassFeatures.splice( 3, actorClassFeatures.length - 3 );
// 				}
// 				return await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
// 			}
// 		},
// 		{
// 			title: 'Opzione di livello 5 (5/5)',
// 			content: `
// 				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
// 				${classOptions}
// 			`,
// 			validate: async (html) => {
// 				const classID = html.find('[name="formClass"]:checked').val();
// 				if ( !classID ) {
// 					ui.notifications.warn('Devi scegliere una classe');
// 					return false;
// 				}
// 				actorClasses.splice( 4, actorClasses.length - 4 );
// 				if ( actorClassFeatures.length > 0 ) {
// 					if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
// 						actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
// 					else 
// 						actorClassFeatures.splice( 4, actorClassFeatures.length - 4 );
// 				}
// 				let classResult = await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
// 				if ( actorClasses.length < 2 ) {
// 					ui.notifications.warn('Devi scegliere almeno due classi');
// 					return false;
// 				}
// 				return classResult;
// 			}
// 		},
// 		{
// 			title: 'Determina la Taglia di Dado base delle caratteristiche',
// 			content: `
// 				<p>Determina la taglia di dado base delle quattro <strong>Caratteristiche</strong> del personaggio: <strong>Destrezza, Intuito, Vigore</strong> e <strong>Volontà</strong>.</p>
// 				<p>
// 					Taglie possibili: <br>
// 					Tuttofare - D8, D8, D8, D8 <br>
// 					Nemma media - D10, D8, D8, D6 <br>
// 					Specializzato - D10, D10, D6, D6
// 				</p>
// 				<div class="form-group">
// 					<label>Destrezza (DES)</label>
// 					<select id="dex">
// 						<option value="6" ${actor.system.attributes.dex.value == 6 ? 'selected' : ''}>D6</option>
// 						<option value="8" ${actor.system.attributes.dex.value == 8 ? 'selected' : ''}>D8</option>
// 						<option value="10" ${actor.system.attributes.dex.value == 10 ? 'selected' : ''}>D10</option>
// 					</select>
// 				</div>
// 				<div class="form-group">
// 					<label>Intuito (INT)</label>
// 					<select id="ins">
// 						<option value="6" ${actor.system.attributes.ins.value == 6 ? 'selected' : ''}>D6</option>
// 						<option value="8" ${actor.system.attributes.ins.value == 8 ? 'selected' : ''}>D8</option>
// 						<option value="10" ${actor.system.attributes.ins.value == 10 ? 'selected' : ''}>D10</option>
// 					</select>
// 				</div>
// 				<div class="form-group">
// 					<label>Vigore (VIG)</label>
// 					<select id="mig">
// 						<option value="6" ${actor.system.attributes.mig.value == 6 ? 'selected' : ''}>D6</option>
// 						<option value="8" ${actor.system.attributes.mig.value == 8 ? 'selected' : ''}>D8</option>
// 						<option value="10" ${actor.system.attributes.mig.value == 10 ? 'selected' : ''}>D10</option>
// 					</select>
// 				</div>
// 				<div class="form-group">
// 					<label>Volontà (VOL)</label>
// 					<select id="wlp">
// 						<option value="6" ${actor.system.attributes.wlp.value == 6 ? 'selected' : ''}>D6</option>
// 						<option value="8" ${actor.system.attributes.wlp.value == 8 ? 'selected' : ''}>D8</option>
// 						<option value="10" ${actor.system.attributes.wlp.value == 10 ? 'selected' : ''}>D10</option>
// 					</select>
// 				</div>
// 			`,
// 			validate: async (html) => {
// 				const params = { 
// 					dex: html.find('#dex').val(),
// 					ins: html.find('#ins').val(),
// 					mig: html.find('#mig').val(),
// 					wlp: html.find('#wlp').val(),
// 				};
// 				if ( checkParams( params ) ) {
// 					await actor.update({ 'system.attributes.dex.value': params.dex });
// 					await actor.update({ 'system.attributes.ins.value': params.ins });
// 					await actor.update({ 'system.attributes.mig.value': params.mig });
// 					await actor.update({ 'system.attributes.wlp.value': params.wlp });
// 					return true;
// 				} else {
// 					ui.notifications.warn('Devi selezionare una combinazione di attrivuti accettabili');
// 					return false;
// 				}
// 			}
// 		}
// 	];

// 	function updateDialog() {
// 		const step = steps[currentStep];
// 		new Dialog({
// 			title: step.title,
// 			content: step.content,
// 			buttons: {
// 				back: {
// 					label: currentStep === 0 ? 'Annulla' : 'Indietro',
// 					callback: () => {
// 						if ( currentStep > 0 ) {
// 							currentStep--;
// 							updateDialog();
// 						}
// 					},
// 				},
// 				next: {
// 					label: currentStep === steps.length - 1 ? 'Conferma' : 'Avanti',
// 					callback: async (html) => {
// 						const result = await step.validate(html);
// 						if ( result ) {
// 							if ( currentStep < steps.length - 1 ) {
// 								currentStep++;
// 								updateDialog();
// 							} else {
// 								characterCreationOpen = false;
// 								ui.notifications.info('Personaggio creato con successo');
// 							}
// 						} else {
// 							updateDialog();
// 						}
// 					},
// 				}
// 			},
// 			close: (html) => {
// 				if ( currentStep === steps.length ) {
// 					characterCreationOpen = false;
// 				} else {
// 					const isNext = html.find('.dialog-button.next').is(':focus');
// 					if ( !isNext )
// 						characterCreationOpen = false;
// 				}
// 			}
// 		}).render(true);
// 	}

// 	updateDialog();
// });

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
		let item;
		let rollTemplate = 'systems/fabula/templates/chat/check-base.hbs';
		if ( itemID == '' ) {
			item = null;
		} else {
			item = actor.items.get( itemID );
			if ( item.type == 'weapon' )
				rollTemplate = 'systems/fabula/templates/chat/check-attack.hbs';
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
					optionsLabel: 'Scegli uno dei tuoi legami da invocare',
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
					
					await rollDiceToChat( actor, rollFormula, roll, rollMode, item, rollTemplate );

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
					optionsLabel: 'Scegli il dado che vuoi ritirare',
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
						optionsLabel: 'Scegli il tratto da invocare',
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
	return ( a / b );
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
  