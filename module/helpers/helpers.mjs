import { FU } from "./config.mjs";

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

function openAttributesIncreaseChildDialog( actor ) {
	const attributes = actor.system.attributes;
	const newAttributes = {
		dex: attributes.dex.value == 12 ? 12 : attributes.dex.value + 2,
		ins: attributes.ins.value == 12 ? 12 : attributes.ins.value + 2,
		mig: attributes.mig.value == 12 ? 12 : attributes.mig.value + 2,
		wlp: attributes.wlp.value == 12 ? 12 : attributes.wlp.value + 2,
	};
	return new Promise((resolve) => {
		new Dialog({
			title: `Hai raggiunto il livello ${actor.system.level.value + 1}`,
			content: `
				<p>Devi scegliere una delle tue Caratteristiche e ne incrementi la taglia di dado base di un grado (massimo <strong>d12</strong>)</p>
				<div class="form-group">
					<label for="radioDex">Destrezza ( d${attributes.dex.value} => d${newAttributes.dex} )</label>
					<input type="radio" id="radioDex" name="formAttributeIncrease" value="dex" ${attributes.dex.value == 12 ? 'disabled' : ''} />
				</div>
				<div class="form-group">
					<label for="radioIns">Intuito ( d${attributes.ins.value} => d${newAttributes.ins} )</label>
					<input type="radio" id="radioIns" name="formAttributeIncrease" value="ins" ${attributes.ins.value == 12 ? 'disabled' : ''} />
				</div>
				<div class="form-group">
					<label for="radioMig">Vigore ( d${attributes.mig.value} => d${newAttributes.mig} )</label>
					<input type="radio" id="radioMig" name="formAttributeIncrease" value="mig" ${attributes.mig.value == 12 ? 'disabled' : ''} />
				</div>
				<div class="form-group">
					<label for="radioWlp">Volontà ( d${attributes.wlp.value} => d${newAttributes.wlp} )</label>
					<input type="radio" id="radioWlp" name="formAttributeIncrease" value="wlp" ${attributes.wlp.value == 12 ? 'disabled' : ''} />
				</div>
			`,
			buttons: {
				confirm: {
					label: 'Conferma',
					callback: async (html) => {
						const increase = html.find('[name="formAttributeIncrease"]:checked').val();
						newAttributes.dex = newAttributes.dex == 12 ? 12 : newAttributes.dex - 2;
						newAttributes.ins = newAttributes.ins == 12 ? 12 : newAttributes.ins - 2;
						newAttributes.mig = newAttributes.mig == 12 ? 12 : newAttributes.mig - 2;
						newAttributes.wlp = newAttributes.wlp == 12 ? 12 : newAttributes.wlp - 2;
						newAttributes[increase] += 2;
						
						await actor.update({ 'system.attributes.dex.value': newAttributes.dex });
						await actor.update({ 'system.attributes.ins.value': newAttributes.ins });
						await actor.update({ 'system.attributes.mig.value': newAttributes.mig });
						await actor.update({ 'system.attributes.wlp.value': newAttributes.wlp });
						resolve(true);
					}
				},
			}
		}).render(true);
	});
}

function openClassFeaturesChildDialog( document, actorClassFeatures, actor ) {
	const classFeatures = document.flags.fabula.subItems;
	if ( classFeatures.length == 0 ) {
		ui.notifications.warn('La classe non ha abilità selezionabili');
		return true;
	}

	let options = '';
	classFeatures.forEach((value, key) => {
		let level = 0;
		options += `
			<div class="form-group">
				<label for="${value._id}">
					<strong>${value.name}</strong>`;

		actorClassFeatures.forEach((item, k) => {
			if ( item._id == value._id )
				level += item.system.level.current;
		});
		if ( value.system.level.max > 1 ) {
			options += ` ( ${level} / ${value.system.level.max} )`;
		}

		options += `<br>
					${value.system.description}
				</label>
				<input type="radio" name="formClassFeature" id="${value._id}" value="${value._id}" ${level == value.system.level.max ? 'disabled' : ''} />
				<hr>
			</div>
		`;
	});
	return new Promise((resolve) => {
		new Dialog({
			title: `Hai scelto la classe ${document.name}: ora devi scegliere l'abilità da ottenere`,
			content: `
				<p>Scegli una delle seguenti opzioni:</p>
				${options}
			`,
			buttons: {
				cancel: {
					label: 'Annulla',
					callback: () => resolve(false),
				},
				confirm: {
					label: 'Conferma',
					callback: async (html) => {
						const featureID = html.find('input[name="formClassFeature"]:checked').val();
						const feature = classFeatures.find((element) => element._id == featureID);
						feature.system.level.current++;
						let featureFound = false;

						for ( const doc of actorClassFeatures ) {
							if ( feature._id == doc._id ) {
								doc.system.level.current++;
								featureFound = true;
								break;
							}
						}
						if ( !featureFound )
							actorClassFeatures.push( feature );

						actorClassFeatures.sort((a, b) => {
							return a.name.localeCompare(b.name);
						});

						await actor.setFlag('fabula', 'classFeatures', actorClassFeatures);
						resolve(true);
					}
				}
			}
		}).render(true);
	});
}

export async function addClassToActor( classID, actorClasses, actorClassFeatures, actor ) {
	let returnValue = false;
	let isMastered = false;
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

		// Check if actor is level 20 or 40
		if ( actor.system.level.value == 19 || actor.system.level.value == 39 ) {
			await openAttributesIncreaseChildDialog( actor );
		}

		const document = await pack.getDocument( entry._id );
		const clonedDocument = document.toObject();
		let classFound = false;
		for ( const doc of actorClasses ) {
			if ( clonedDocument._id == doc._id ) {
				if ( doc.system.level.value == 10 ) {
					ui.notifications.warn('Non puoi aumentare il livello in una classe sopra il 10');
					return false;
				}
				doc.system.level.value++;
				classFound = true;
				if ( doc.system.level.value == 10 )
					isMastered = true;
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

		await openClassFeaturesChildDialog( clonedDocument, actorClassFeatures, actor );

	} else {
		ui.notifications.error('Non è stato potuto trovare la classe nel compendio');
	}
	
	actorClasses.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});
	await actor.setFlag('fabula', 'classes', actorClasses);

	// Open Heroic skill list if class is mastered
	if ( isMastered ) {
		ui.notifications.info(`Hai padroneggiato la classe ${entry.name}! Ora puoi acquisire un'Abilità Eroica`);
		const heroicSkills = game.packs.get('fabula.heroikskill');
		const itemID = '1rMuu2Rly4ueElJd';

		if ( heroicSkills ) {
			heroicSkills.getDocument( itemID ).then(item => {
				if ( item )
					item.sheet.render(true);
				else
					console.error(`L'Item con ID: ${itemID} non è stato trovato!`);
			});
		}
	}

	return returnValue;
}