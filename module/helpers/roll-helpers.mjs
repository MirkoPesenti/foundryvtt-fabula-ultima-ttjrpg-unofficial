import { awaitDialogSelect } from "./helpers.mjs";
import { FU } from "./config.mjs";

export async function rollDiceToChat( actor, rollString, asyncRoll = null, mode = 'base', item = null ) {

	// Set template
	let templateType = 'base';
	let template;
	if ( item !== null ) {
		templateType = item.type;
		if ( item.type == 'weapon' ) templateType = 'attack';
		template = `systems/fabula/templates/chat/check-${templateType}.hbs`;
	}

	// Check infusions
	const actorTechnologies = actor.getFlag('fabula', 'technologies') || [];
	let infusion = undefined;
	if ( templateType == 'attack' && actorTechnologies.includes('infusions') ) {
		infusion = await addInfusion( actor );
	}

	let roll;
	let reroll = false;
	if ( asyncRoll === null ) {
		if ( infusion ) {
			if ( infusion != 'vampire' ) rollString += '+5';
		}
		roll = new Roll( rollString, actor.getRollData() );
		await roll.evaluate();
	} else {
		roll = asyncRoll;
		reroll = true;
	}

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
		item: item || null,
		roll: roll,
		checkMode: mode,
		highRoll: highRoll,
		reroll: reroll,
		crit: {
			success: critSuccess,
			failure: critFailure,
		},

	};

	let [flavorText, customClass] = '';

	if ( mode == 'base' ) {
		flavorText = 'Test di caratteristica';
	} else if ( mode == 'init' ) {
		flavorText = 'Tiro di iniziativa';
		customClass = 'init-check';
	} else if ( item !== null ) {
		flavorText = game.i18n.localize( FU.ItemTypes[item.type] );
		customClass = `${item.type}-check`;
	}

	if ( reroll ) {
		flavorText += ' (Tiro aggiornato)';
	}

	renderTemplate( template, checkData ).then(content => {
		roll.toMessage({
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			flavor: flavorText,
			content: content,
			rollMode: game.settings.get( 'core', 'rollMode' ),
			flags: {
				customClass: customClass,
			},
		});
	});

	if ( asyncRoll === null && infusion ) {
		const chatData = {
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({ actor: chat.actor }),
			flavor: `Ha applicato l'infusione <strong>${game.i18n.localize(`FU.infusions.${infusion}`)}</strong> all'attacco`,
			content: `<p>${game.i18n.localize(`FU.infusionsEffects.${infusion}`)}</p>`,
		};
		ChatMessage.create(chatData);
	}
}

async function addInfusion( actor ) {
	let effect = undefined;
	
	if (
		await Dialog.confirm({
			title: `Usare un'infusione nell'attacco?`,
			content: `<p>Se colpisci uno o più bersagli con un attacco, puoi spendere 2 Punti Inventario per creare un'<strong>infusione</strong>.</p>`,
			rejectClose: false,
		})
	) {

		let effectOptions = `<optgroup label="${game.i18n.localize('FU.infusionsTypes.basic')}">`;
		for (let key in FU.infusionsBasic) {
			effectOptions += `<option value="${key}">${game.i18n.localize(`${FU.infusionsBasic[key]}`)}</option>`;
		}
		effectOptions += `</optgroup>`;
		effectOptions += `<optgroup label="${game.i18n.localize('FU.infusionsTypes.advanced')}">`;
		for (let key in FU.infusionsAdvanced) {
			effectOptions += `<option value="${key}">${game.i18n.localize(`${FU.infusionsAdvanced[key]}`)}</option>`;
		}
		effectOptions += `</optgroup>`;
		effectOptions += `<optgroup label="${game.i18n.localize('FU.infusionsTypes.superior')}">`;
		for (let key in FU.infusionsSuperior) {
			effectOptions += `<option value="${key}">${game.i18n.localize(`${FU.infusionsSuperior[key]}`)}</option>`;
		}
		effectOptions += `</optgroup>`;
		
		effect = await awaitDialogSelect({
			title: `Stai applicando un'infusione all'attacco`,
			optionsLabel: `Scegli uno dei seguenti <strong>effetti:</strong>`,
			options: effectOptions,
		});
		if ( effect == false ) return false;

		const currentIP = actor.system.resources.ip.current;
		if ( currentIP < 2 ) {
			ui.notifications.error(`Non hai abbastanza Punti Inventario per creare un'infusione`);
			return false;
		} else {
			const newIP = currentIP - 2;
			await actor.update({ 'system.resources.ip.current': newIP });
		}

	}

	return effect;
}