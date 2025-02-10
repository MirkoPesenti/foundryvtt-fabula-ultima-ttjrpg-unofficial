
export function openClockDialog( name,  ) {
	new Dialog({
		title: 'Stai creando un nuovo Orologio',
		content: `
			<div class="flexcolumn">
				<div class="form-group flexrow mb-1">
					<label>Nome</label>
					<input type="text" id="createClockName" placeholder="Allarme Rosso!" />
				</div>
				<div class="form-group flexrow mb-1">
					<label>Sezioni dell'orologio</label>
					<input type="number" id="createClockSections" min="1" value="4" />
				</div>
			</div>
		`,
		buttons: {
			cancel: {
				label: 'Annulla',
			},
			create: {
				label: 'Crea',
				callback: (html) => {
					const name = html.find('#createClockName').val();
					const sections = parseInt( html.find('#createClockSections').val() );
					createClock( name, sections );
				},
			},
		},
	}).render(true);
}

export function createClock( name, sections = 4, visibility = false ) {
	const clock = {
		id: foundry.utils.randomID(),
		name: name || 'Nuovo orologio',
		sections: Array(sections).fill(false),
		public: visibility,
	};

	renderClock( clock );
	return clock.id;
}

export function renderClock( clock ) {
	const clockVisibility = clock.public ? 'public' : 'private';
	const clockProgress = clock.sections.filter(value => value === true).length;

	// Clock container
	const container = document.createElement('div');
	$(container)
		.addClass('fabula').addClass('container-clock')
		.attr('id', `fabula_clock_${clock.id}`)
		.attr('data-clock-id', clock.id)
		.attr('data-clock-name', clock.name)
		.attr('data-clock-visibility', clockVisibility)
		.attr('data-clock-sections', clock.sections.length)
		.attr('data-clock-progress', clockProgress);

	const clockContainer = document.createElement('div');
	$(clockContainer)
		.addClass('inner-clock')
		.attr('data-tooltip', `${clockProgress} / ${clock.sections.length}`);

	// Clock sections
	let clockSections = Math.floor( 360 / clock.sections.length );
	let clockDEG = 0;
	clock.sections.forEach((full, index) => {
		const section = document.createElement('div');
		$(section)
			.addClass('clock-section')
			.attr('data-index', index);

		if ( full ) {
			$(section).addClass('completed');
		}

		$(clockContainer).append( section );
		clockDEG += clockSections;
	});
	$(container).append( clockContainer );

	const infoContainer = document.createElement('div');
	$(infoContainer).addClass('clock-label');

	// Button remove section to clock
	const buttonMinus = document.createElement('button');
	$(buttonMinus)
		.attr('type', 'button')
		.addClass('btn')
		.addClass('btn-minus')
		.attr('data-tooltip', `Svuota una sezione dell'orologio`)
		.append(`<i class="fa fa-minus"></i>`);
	$(buttonMinus).on('click', (e) => {
		e.preventDefault();
		removeSectionToClock( clock );
	});
	if ( clockProgress == 0 ) {
		$(buttonMinus).attr('disabled', true);
	}
	$(infoContainer).append( buttonMinus );

	// Clock name
	const clockName = document.createElement('h4');
	$(clockName).text( clock.name );
	$(infoContainer).append( clockName );
	
	// Button add section to Clock
	const buttonPlus = document.createElement('button');
	$(buttonPlus)
		.attr('type', 'button')
		.addClass('btn')
		.addClass('btn-plus')
		.attr('data-tooltip', `Riempi una sezione dell'orologio`)
		.append(`<i class="fa fa-plus"></i>`);
	$(buttonPlus).on('click', async (e) => {
		e.preventDefault();
		await addSectionToClock( clock );
	});
	if ( clockProgress == clock.sections.length ) {
		$(buttonPlus).attr('disabled', true);
	}
	$(infoContainer).append( buttonPlus );

	$(container).append( infoContainer );

	
	// Check if clock already exist
	const oldClock = $(`[data-clock-id="${clock.id}"]`);
	if ( oldClock.length > 0 ) {
		$(oldClock).replaceWith(container);
	} else {
		$('#ui-top').append( container );
	}
}

export function deleteClock( clockId ) {
	if ( $(`[data-clock-id="${clockId}"]`).length > 0 ) {
		$(`[data-clock-id="${clockId}"]`).remove();
	} else {
		ui.notifications.error(`L'orologio con id: ${clockId} non è stato trovato!`);
	}
}

export function removeSectionToClock( clock, amount = 1 ) {
	const sections = [...clock.sections];
	let changes = 0;

	for ( let i = sections.length - 1; i >= 0 && changes < amount; i-- ) {
		if ( sections[i] ) {
			sections[i] = false;
			changes++;
		}
	}

	clock.sections = sections;
	renderClock( clock );

	const chatClockChanges = changes > 1 ? `Sono state svuotate ${changes} sezioni` : `È stata svuotata ${changes} sezione`;
	const chatData = {
		speaker: 'Fabula Ultima',
		flavor: `Modifica alle sezioni di un orologio`,
		content: `<p>${chatClockChanges} dell'orologio <strong>${clock.name}</strong></p>`,
		flags: {
			customClass: 'clock-alert',
		},
	};
	ChatMessage.create(chatData);
}

export async function addSectionToClock( clock, amount = 1 ) {
	const sections = [...clock.sections];
	let changes = 0;

	for ( let i = 0; i < sections.length && changes < amount; i++ ) {
		if ( !sections[i] ) {
			sections[i] = true;
			changes++;
		}
	}

	const clockProgress = sections.filter(value => value === true).length;
	if ( clockProgress == sections.length ) {
		if (
			!await Dialog.confirm({
				title: `L'orologio ${clock.name} verrà completato`,
				content: `<p>L'orologio ${clock.name} verrà completato. Sei sicuro di voler continuare?</p>`,
				rejectClose: false,
			})
		) {
			return;
		}
	}

	let chatData;
	if ( clockProgress == sections.length ) {
		chatData = {
			speaker: 'Fabula Ultima',
			flavor: `Orologio completato`,
			content: `<p>L'orologio <strong>${clock.name}</strong> è stato completato!</p>`,
			flags: {
				customClass: 'clock-alert',
			},
		};
		deleteClock( clock.id );
	} else {
		clock.sections = sections;
		renderClock( clock );

		const chatClockChanges = changes > 1 ? `Sono state riempite ${changes} sezioni` : `È stata riempita ${changes} sezione`;
		chatData = {
			speaker: 'Fabula Ultima',
			flavor: `Modifica alle sezioni di un orologio`,
			content: `<p>${chatClockChanges} dell'orologio <strong>${clock.name}</strong></p>`,
			flags: {
				customClass: 'clock-alert',
			},
		};
	}
	ChatMessage.create(chatData);
}