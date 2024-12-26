import { generateDataLink } from "./helpers.mjs";
import { FU } from "./config.mjs";

function generateHTML( data, isLast = true ) {
	let html = `
		<h2>${FU.journalName}</h2>
		<ul>
	`;
	for ( const [resource, count] of Object.entries(data.resources) ) {
		html += `
			<li><strong>${game.i18n.localize(`FU.${resource}`)}:</strong> ${count}</li>
		`;
	}
	html += `</ul>`;

	if ( isLast ) {
		html += `
			<button type="button" class="js_giveExperienceSessionEnd">
				Distribuisci i Punti Esperienza
			</button>
		`;
		return JSON.stringify( data, null, 2 ) + '<hr />' + html;
	} else {
		return html;
	}
	
}

export async function initSessionJournal() {

	let journal = game.journal.getName( FU.journalName );
	if ( !journal ) {
		journal = await JournalEntry.create({
			name: FU.journalName,
			pages: [
				{
					name: 'Sessione 1',
					type: 'text',
					text: {
						content: generateHTML({ resources: {} }),
						format: 1,
					},
				}
			],
			ownership: {
				default: 3,
			},
		});
		ui.notifications.info(`Journal ${FU.journalName} creato con successo.`);
	}
	return journal;
	
}

export async function addNewPageToJournal( journal, exp = 0 ) {

	if ( journal === null ) {
		journal = await initSessionJournal();
	}
	
	const prevPageName = `Sessione ${journal.pages.size}`;
	const prevPage = journal.pages.find( page => page.name === prevPageName );

	let data = {};
    try {
        data = JSON.parse(prevPage.text.content.split("<hr />")[0]) || {};
    } catch (e) {
        data = { resources: {} };
    }

	data.resources = data.resources || {};
	data.resources.exp = exp;

	const newContent = generateHTML( data, false );
	await updateJournalPage( journal, prevPageName, newContent );

	await journal.createEmbeddedDocuments("JournalEntryPage", [
        {
			name: `Sessione ${journal.pages.size + 1}`,
			type: 'text',
			text: {
				content: generateHTML({ resources: {} }),
				format: 1,
			},
		},
    ]);
	
}

async function updateJournalPage( journal, pageName, newContent ) {

	const page = journal.pages.find( page => page.name === pageName );
	if ( !page ) {
		ui.notifications.error(`Pagina ${pageName} non trovata.`);
		return;
	}

	await page.update({ 'text.content': newContent });
	
}

export async function incrementSessionResource( resourceName, journal = null, chat = null ) {

	if ( journal === null ) {
		journal = await initSessionJournal();
	}

	const pageName = `Sessione ${journal.pages.size}`;
	const page = journal.pages.find( page => page.name === pageName );
	if ( !page ) {
		ui.notifications.error(`Pagina ${pageName} non trovata.`);
		return;
	}

	let data = {};
    try {
        data = JSON.parse(page.text.content.split("<hr />")[0]) || {};
    } catch (e) {
        data = { resources: {} };
    }

	data.resources = data.resources || {};
	data.resources[resourceName] = (data.resources[resourceName] || 0) + 1;

	const newContent = generateHTML( data );

	await updateJournalPage( journal, pageName, newContent );

	let chatContent = '';
	if ( chat.trait ) {
		if ( chat.actor.type == 'character' ) {
			chatContent += `<p>Ha invocato il suo tratto: <strong>${game.i18n.localize(`FU.${chat.trait}`)}</stron></p>`;
		} else {
			chatContent += '<p>Ha invocato un suo tratto</p>';
		}
	}
	if ( chat.bond === true ) {
		chatContent += '<p>Ha invocato un suo legame</p>';
	}
	chatContent += `
		<div class="flexrow">
			<div>${chat.currentResource}</div>
			<i class="fa fa-fw fa-right-long"></i>
			<div>${chat.newResource}</div>
		</div>
		<p>${game.i18n.localize(`FU.${resourceName}`)} spesi durante questa sessione:</p>
	`;

	let chatTooltip = '';
	if ( chat.actor.type == 'character' )
		chatTooltip += 'A fine sessione i giocatori riceverano Punti Esperienza pari ai Punti Fabula spesi dal gruppo diviso per il numero di PG';
	else 
		chatTooltip += 'A fine sessione i giocatori riceverano Punti Esperienza pari ai Punti Ultima spesi dai cattivi';

	const chatData = {
		user: game.user.id,
		speaker: ChatMessage.getSpeaker({ actor: chat.actor }),
		flavor: `Ha speso uno dei suoi <strong>${game.i18n.localize(`FU.${resourceName}`)}</strong>`,
		content: `
			${chatContent}
			<h4 data-tooltip="${chatTooltip}">${data.resources[resourceName]}</h4>
			${generateDataLink( journal, `Apri ${journal.name}`, null, 'book-open' )}
		`,
		flags: {
			customClass: 'fabula-point-check',
		},
	};
	ChatMessage.create(chatData);
	
}