// Classes
import { FabulaActor } from './documents/actors/actor.mjs';
import { FabulaItem } from './documents/items/item.mjs';

// Sheets
import { FabulaActorSheet } from './sheets/actor-sheet.mjs';
import { FabulaItemSheet } from './sheets/item-sheet.mjs';

// Helpers
import { FU, SYSTEM } from './helpers/config.mjs';
import { preloadPartialTemplates } from './helpers/templates.mjs';
import { checkParams, addClassToActor } from './helpers/helpers.mjs';

// Actors Data Models
import { CharacterDataModel } from './documents/actors/character-data-model.mjs';
import { NpcDataModel } from './documents/actors/npc-data-model.mjs';

// Items Data Models
import { AccessoryDataModel } from './documents/items/accessory-data-model.mjs';
import { WeaponDataModel } from './documents/items/weapon-data-model.mjs';
import { ArmorDataModel } from './documents/items/armor-data-model.mjs';
import { ConsumableDataModel } from './documents/items/consumable-data-model.mjs';
import { SpellDataModel } from './documents/items/spell-data-model.mjs';
import { ProjectDataModel } from './documents/items/project-data-model.mjs';
import { RitualDataModel } from './documents/items/ritual-data-model.mjs';
import { ShieldDataModel } from './documents/items/shield-data-model.mjs';
import { CLassDataModel } from './documents/items/class-data-model .mjs';
import { CLassFeatureDataModel } from './documents/items/class-feature-model.mjs';
import { ArcanumDataModel } from './documents/items/arcanum-data-model.mjs';

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
		armor: ArmorDataModel,
		weapon: WeaponDataModel,
		consumable: ConsumableDataModel,
		spell: SpellDataModel,
		project: ProjectDataModel,
		ritual: RitualDataModel,
		shield: ShieldDataModel,
		class: CLassDataModel,
		classFeature: CLassFeatureDataModel,
		arcanum: ArcanumDataModel,
	};
	
	CONFIG.ActiveEffect.legacyTransferral = false;

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
});

let characterCreationOpen = false;

Hooks.on('renderActorSheet', (sheet, html, data)  => {
	const actor = sheet.actor;

	if ( characterCreationOpen ) return;

	characterCreationOpen = true;

	// Continue only if Actor is character
	if ( actor.type != 'character' ) return;

	// Continue only if Actor is level 5 or above
	if ( actor.system.level.value >= 5 ) return;

	let currentStep = 0;

	// Prepare classes options
	const pack = game.packs.get('fabula.classes');
	const sortedPack = pack.index.contents.sort( ( a, b ) => a.name.localeCompare(b.name) );
	const actorClasses = actor.getFlag('fabula', 'classes') || [];
	const actorClassFeatures = actor.getFlag('fabula', 'classFeatures') || [];
	let classOptions = '';
	sortedPack.forEach((value, key) => {
		classOptions += `
			<div class="form-group">
				<label for="class_${value.name}">${value.name}</label>
				<input type="radio" name="formClass" id="class_${value.name}" value="${value._id}" />
			</div>
		`;
	});

	const steps = [
		{
			title: 'Crea l\'Identità',
			content: `
				<p>Crea l'<strong>Identità</strong> del personaggio: una breve frase che descrive con poche parole come vede sé stesso in questo momento.</p>
				<input type="text" name="formIdentity" placeholder="Identità" value="${actor.system.features.identity}" />
			`,
			validate: async (html) => {
				const identity = html.find('[name="formIdentity"]').val();
				if ( !identity ) {
					ui.notifications.warn(`Devi inserire un'Identità`);
					return false;
				}
				await actor.update({ 'system.features.identity': identity });
				return true;
			}
		},
		{
			title: 'Scegli o crea il Tema',
			content: `
				<p>Scegli o crea il <strong>Tema</strong> del personaggio: un ideale, un'emozione o un sentimento che ne domina le azioni.</p>
				<input type="text" name="formTheme" placeholder="Tema" value="${actor.system.features.theme}" />
			`,
			validate: async (html) => {
				const theme = html.find('[name="formTheme"]').val();
				if ( !theme ) {
					ui.notifications.warn(`Devi inserire un Tema`);
					return false;
				}
				await actor.update({ 'system.features.theme': theme });
				return true;
			}
		},
		{
			title: 'Scegli o crea l\'Origine',
			content: `
				<p>Scegli o crea l'<strong>Origine</strong> del personaggio: il luogo da cui proviene. Puoi usare uno di quelli già presenti sulla <strong>scheda del mondo</strong> o crearne uno nuovo.</p>
				<input type="text" name="formOrigin" placeholder="Origine" value="${actor.system.features.origin}" />
				
			`,
			validate: async (html) => {
				const origin = html.find('[name="formOrigin"]').val();
				if ( !origin ) {
					ui.notifications.warn(`Devi inserire un'Origine`);
					return false;
				}
				await actor.update({ 'system.features.origin': origin });
				return true;
			}
		},
		{
			title: 'Opzione di livello 1 (1/5)',
			content: `
				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
				${classOptions}
			`,
			validate: async (html) => {
				const classID = html.find('[name="formClass"]:checked').val();
				if ( !classID ) {
					ui.notifications.warn('Devi scegliere una classe');
					return false;
				}
				actorClasses.splice( 0, actorClasses.length );
				if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
					actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
				else 
					actorClassFeatures.splice( 0, actorClassFeatures.length );
				return await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
			}
		},
		{
			title: 'Opzione di livello 2 (2/5)',
			content: `
				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
				${classOptions}
			`,
			validate: async (html) => {
				const classID = html.find('[name="formClass"]:checked').val();
				if ( !classID ) {
					ui.notifications.warn('Devi scegliere una classe');
					return false;
				}
				actorClasses.splice( 1, actorClasses.length - 1 );
				if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
					actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
				else 
					actorClassFeatures.splice( 1, actorClassFeatures.length - 1 );
				return await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
			}
		},
		{
			title: 'Opzione di livello 3 (3/5)',
			content: `
				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
				${classOptions}
			`,
			validate: async (html) => {
				const classID = html.find('[name="formClass"]:checked').val();
				if ( !classID ) {
					ui.notifications.warn('Devi scegliere una classe');
					return false;
				}
				actorClasses.splice( 2, actorClasses.length - 2 );
				if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
					actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
				else 
					actorClassFeatures.splice( 2, actorClassFeatures.length - 2 );
				return await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
			}
		},
		{
			title: 'Opzione di livello 4 (4/5)',
			content: `
				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
				${classOptions}
			`,
			validate: async (html) => {
				const classID = html.find('[name="formClass"]:checked').val();
				if ( !classID ) {
					ui.notifications.warn('Devi scegliere una classe');
					return false;
				}
				actorClasses.splice( 3, actorClasses.length - 3 );
				if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
					actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
				else 
					actorClassFeatures.splice( 3, actorClassFeatures.length - 3 );
				return await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
			}
		},
		{
			title: 'Opzione di livello 5 (5/5)',
			content: `
				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
				${classOptions}
			`,
			validate: async (html) => {
				const classID = html.find('[name="formClass"]:checked').val();
				if ( !classID ) {
					ui.notifications.warn('Devi scegliere una classe');
					return false;
				}
				actorClasses.splice( 4, actorClasses.length - 4 );
				if ( actorClassFeatures[actorClassFeatures.length - 1].system.level.current > 1 )
					actorClassFeatures[actorClassFeatures.length - 1].system.level.current--;
				else 
					actorClassFeatures.splice( 4, actorClassFeatures.length - 4 );
				let classResult = await addClassToActor( classID, actorClasses, actorClassFeatures, actor );
				if ( actorClasses.length < 2 ) {
					ui.notifications.warn('Devi scegliere almeno due classi');
					return false;
				}
				return classResult;
			}
		},
		{
			title: 'Determina la Taglia di Dado base delle caratteristiche',
			content: `
				<p>Determina la taglia di dado base delle quattro <strong>Caratteristiche</strong> del personaggio: <strong>Destrezza, Intuito, Vigore</strong> e <strong>Volontà</strong>.</p>
				<p>
					Taglie possibili: <br>
					Tuttofare - D8, D8, D8, D8 <br>
					Nemma media - D10, D8, D8, D6 <br>
					Specializzato - D10, D10, D6, D6
				</p>
				<div class="form-group">
					<label>Destrezza (DES)</label>
					<select id="dex">
						<option value="6" ${actor.system.resources.attributes.dex.value == 6 ? 'selected' : ''}>D6</option>
						<option value="8" ${actor.system.resources.attributes.dex.value == 8 ? 'selected' : ''}>D8</option>
						<option value="10" ${actor.system.resources.attributes.dex.value == 10 ? 'selected' : ''}>D10</option>
					</select>
				</div>
				<div class="form-group">
					<label>Intuito (INT)</label>
					<select id="ins">
						<option value="6" ${actor.system.resources.attributes.ins.value == 6 ? 'selected' : ''}>D6</option>
						<option value="8" ${actor.system.resources.attributes.ins.value == 8 ? 'selected' : ''}>D8</option>
						<option value="10" ${actor.system.resources.attributes.ins.value == 10 ? 'selected' : ''}>D10</option>
					</select>
				</div>
				<div class="form-group">
					<label>Vigore (VIG)</label>
					<select id="mig">
						<option value="6" ${actor.system.resources.attributes.mig.value == 6 ? 'selected' : ''}>D6</option>
						<option value="8" ${actor.system.resources.attributes.mig.value == 8 ? 'selected' : ''}>D8</option>
						<option value="10" ${actor.system.resources.attributes.mig.value == 10 ? 'selected' : ''}>D10</option>
					</select>
				</div>
				<div class="form-group">
					<label>Volontà (VOL)</label>
					<select id="wlp">
						<option value="6" ${actor.system.resources.attributes.wlp.value == 6 ? 'selected' : ''}>D6</option>
						<option value="8" ${actor.system.resources.attributes.wlp.value == 8 ? 'selected' : ''}>D8</option>
						<option value="10" ${actor.system.resources.attributes.wlp.value == 10 ? 'selected' : ''}>D10</option>
					</select>
				</div>
			`,
			validate: async (html) => {
				const params = { 
					dex: html.find('#dex').val(),
					ins: html.find('#ins').val(),
					mig: html.find('#mig').val(),
					wlp: html.find('#wlp').val(),
				};
				if ( checkParams( params ) ) {
					await actor.update({ 'system.resources.attributes.dex.value': params.dex });
					await actor.update({ 'system.resources.attributes.ins.value': params.ins });
					await actor.update({ 'system.resources.attributes.mig.value': params.mig });
					await actor.update({ 'system.resources.attributes.wlp.value': params.wlp });
					return true;
				} else {
					ui.notifications.warn('Devi selezionare una combinazione di attrivuti accettabili');
					return false;
				}
			}
		}
	];

	function updateDialog() {
		const step = steps[currentStep];
		new Dialog({
			title: step.title,
			content: step.content,
			buttons: {
				back: {
					label: currentStep === 0 ? 'Annulla' : 'Indietro',
					callback: () => {
						if ( currentStep > 0 ) {
							currentStep--;
							updateDialog();
						}
					},
				},
				next: {
					label: currentStep === steps.length - 1 ? 'Conferma' : 'Avanti',
					callback: async (html) => {
						const result = await step.validate(html);
						if ( result ) {
							if ( currentStep < steps.length - 1 ) {
								currentStep++;
								updateDialog();
							} else {
								characterCreationOpen = false;
								ui.notifications.info('Personaggio creato con successo');
							}
						} else {
							updateDialog();
						}
					},
				}
			},
			close: (html) => {
				if ( currentStep === steps.length ) {
					characterCreationOpen = false;
				} else {
					const isNext = html.find('.dialog-button.next').is(':focus');
					if ( !isNext )
						characterCreationOpen = false;
				}
			}
		}).render(true);
	}

	updateDialog();
});

Hooks.on('updateItem', async ( item, updateData, options, userId ) => {
	if ( item.type === 'project' && item.system.progress.current > item.system.progress.max ) {
		await item.update({ 'system.progress.current': item.system.progress.max });
	}
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

Handlebars.registerHelper('percentage', function( a, b ){
	return ( ( a / b ) * 100 );
});

Handlebars.registerHelper('multiply', function( a, b ){
	return ( a / b );
});

Handlebars.registerHelper('divide', function( a, b ){
	return ( a / b );
});

Handlebars.registerHelper("arrayLengthGt", function(array, length, options) {
	return Array.isArray(array) && array.length > length;
});

Handlebars.registerHelper('gt', function( a, b ){
	console.log(arguments);
	var next =  arguments[arguments.length-1];
	return (a > b) ? next.fn(this) : next.inverse(this);
});

Handlebars.registerHelper('gt_e', function( a, b ){
	var next =  arguments[arguments.length-1];
	return (a >= b) ? next.fn(this) : next.inverse(this);
});

Handlebars.registerHelper('sm', function( a, b ){
	var next =  arguments[arguments.length-1];
	return (a < b) ? next.fn(this) : next.inverse(this);
});

Handlebars.registerHelper('sm_e', function( a, b ){
	var next =  arguments[arguments.length-1];
	return (a <= b) ? next.fn(this) : next.inverse(this);
});