// Classes
import { FabulaActor } from './documents/actors/actor.mjs';
import { FabulaItem } from './documents/items/item.mjs';

// Sheets
import { FabulaActorSheet } from './sheets/actor-sheet.mjs';
import { FabulaItemSheet } from './sheets/item-sheet.mjs';

// Helpers
import { FU, SYSTEM } from './helpers/config.mjs';
import { preloadPartialTemplates } from './helpers/templates.mjs';

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
		classFeature: CLassFeatureDataModel
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
	let classOptions = '';
	sortedPack.forEach((value, key) => {
		classOptions += `
			<div class="form-group">
				<label for="class_${value.name}">${value.name}</label>
				<input type="checkbox" id="class_${value.name}" value="${value._id}" />
			</div>
		`;
	});

	const steps = [
		{
			title: 'Crea l\'Identità',
			content: `
				<p>Crea l'<strong>Identità</strong> del personaggio: una breve frase che descrive con poche parole come vede sé stesso in questo momento.</p>
				<input type="text" name="formIdentity" placeholder="Identità" />
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
				<input type="text" name="formTheme" placeholder="Tema" />
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
				<input type="text" name="formOrigin" placeholder="Origine" />
				
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
			title: 'Scegli due o tre Classi iniziali',
			content: `
				<p>Scegli due o tre <strong>Classi</strong> e distribuisci tra loro i cinque livelli iniziali. Annota i <strong>benefici gratuiti</strong> e le <strong>Abilità</strong> così ottenuti.</p>
				${classOptions}
			`,
			validate: (html) => {
				const classes = html.find('input[type="checkbox"]').val() || [];
				console.log(classes);
				if ( classes.length > 3 ) {
					ui.notifications.warn(`Non puoi scegliere più di 3 classi`);
					return false;
				}
				classes.forEach((id) => {
					const entry = pack.index.find(e => e._id === id);
					console.log(entry);
				});
				return true;
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
						<option value="6">D6</option>
						<option value="8" selected>D8</option>
						<option value="10">D10</option>
					</select>
				</div>
				<div class="form-group">
					<label>Intuito (INT)</label>
					<select id="ins">
						<option value="6">D6</option>
						<option value="8" selected>D8</option>
						<option value="10">D10</option>
					</select>
				</div>
				<div class="form-group">
					<label>Vigore (VIG)</label>
					<select id="mig">
						<option value="6">D6</option>
						<option value="8" selected>D8</option>
						<option value="10">D10</option>
					</select>
				</div>
				<div class="form-group">
					<label>Volontà (VOL)</label>
					<select id="wlp">
						<option value="6">D6</option>
						<option value="8" selected>D8</option>
						<option value="10">D10</option>
					</select>
				</div>
			`,
			validate: (html) => {
				const params = { 
					dex: html.find('#dex').val(),
					ins: html.find('#ins').val(),
					mig: html.find('#mig').val(),
					wlp: html.find('#wlp').val(),
				};
				console.log(checkParams( params ));
				return false;
			}
		}
	];

	function updateDialog() {
		const step = steps[currentStep];
		return new Dialog({
			title: step.title,
			content: step.content,
			buttons: {
				back: {
					label: 'Indietro',
					callback: () => {
						if ( currentStep > 0 ) {
							currentStep--;
							updateDialog();
						}
					},
				},
				next: {
					label: currentStep === steps.length ? 'Conferma' : 'Avanti',
					callback: (html) => {
						if ( step.validate(html) ) {
							if ( currentStep < steps.length - 1 ) {
								currentStep++;
								updateDialog();
							} else {
								characterCreationOpen = false;
								ui.notifications.info('Personaggio creato con successo');
							}
						}
					},
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

Handlebars.registerHelper('percentage', function( a, b ){
	return ( ( a / b ) * 100 );
});


Handlebars.registerHelper('multiply', function( a, b ){
	return ( a / b );
});

Handlebars.registerHelper('divide', function( a, b ){
	return ( a / b );
});

Handlebars.registerHelper('gt', function( a, b ){
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