export function checkParams( params ) {
	const values = Object.values(params);
	values.sort((a, b) => a - b);
	const combinations = [
		[8, 8, 8, 8],
		[10, 8, 8, 6],
		[10, 10, 6, 6]
	];

	function getFrequency(arr) {
		return arr.reduce((acc, val) => {
			acc[val] = ( acc[val] || 0 ) + 1;
			return acc;
		}, {});
	}

	const inputFrequency = getFrequency( values );

	return combinations.some((combo) => {
		const comboFrequency = getFrequency(combo);
		return Object.keys(comboFrequency).every(
			key => comboFrequency[key] === inputFrequency[key]
		);
	});
}

function openFreeBenefirsChildDialog( radios, actorClasses, clonedDocument ) {
	return new Promise((resolve) => {
		new Dialog({
			title: 'Scegli beneficio',
			content: `<form>${radios}</form>`,
			buttons: {
				cancel: {
					label: 'Annulla',
					callback: () => resolve(false),
				},
				confirm: {
					label: 'Conferma',
					callback: async (html) => {
						const radio = html.find('[name="formClassBenefit"]:checked').val();
						clonedDocument.system.bonus = {
							hp: false,
							mp: false,
							ip: false,
						}
						clonedDocument.system.bonus[radio] = true;
						clonedDocument.system.level.value++;
						actorClasses.push( clonedDocument );
						resolve(true);
					}
				},
			},
		}).render(true);
	});
}

export async function addClass( classID, actorClasses, actorClassFeatures, actor ) {
	let returnValue = false;
	const pack = game.packs.get('fabula.classes');
	const entry = pack.index.find( e => e._id === classID );

	let nonMasteredClass = 0;
	actorClasses.forEach((value) => {
		if ( value.system.level.value < 10 && classID != value._id )
			nonMasteredClass++;
	});

	// Check if actor can obtain another class
	if ( actorClasses.length >= 3 && nonMasteredClass >= 3 ) {
		ui.notifications.warn('Non puoi avere più di 3 classi non padroneggiate');
		return false;
	}

	if ( entry ) {
		const document = await pack.getDocument( entry._id );
		const clonedDocument = document.toObject();
		let classFound = false;
		for ( const doc of actorClasses ) {
			if ( clonedDocument._id == doc._id ) {
				doc.system.level.value++;
				classFound = true;
				break;
			}
		}

		// Check if Class has multiple choise for Free Benefits
		if ( ( document.system.bonus.hp + document.system.bonus.mp + document.system.bonus.ip ) > 1 && !classFound ) {
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
			returnValue = await openFreeBenefirsChildDialog( radios, actorClasses, clonedDocument );
		} else {
			clonedDocument.system.level.value++;
			if ( !classFound )
				actorClasses.push( clonedDocument );

			returnValue = true;
		}
	} else {
		ui.notifications.error('Non è stato potuto trovare la classe nel compendio');
	}
	await actor.setFlag('fabula', 'classes', actorClasses);
	return returnValue;
}