import { FU } from "./config.mjs";

export async function rollDiceToChat( actor, rollString, asyncRoll = null, mode = 'base', item = null, template = 'systems/fabula/templates/chat/check-base.hbs' ) {

	let roll;
	let reroll = false;
	if ( asyncRoll === null ) {
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
}