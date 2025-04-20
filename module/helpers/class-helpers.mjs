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

function openFreeBenefirsChildDialog( radios, newClass ) {
	return new Promise((resolve) => {
		new Dialog({
			title: `Scegli i benefici gratuiti della classe ${newClass.name}`,
			content: `<form class="flexrow">${radios}</form>`,
			buttons: {
				cancel: {
					label: 'Annulla',
					callback: () => resolve(false),
				},
				confirm: {
					label: 'Conferma',
					callback: async (html) => {
						const radio = html.find('[name="formClassBenefit"]:checked').val();
						newClass.system.bonus = {
							hp: false,
							mp: false,
							ip: false,
						}
						newClass.system.bonus[radio] = true;
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
		dex: attributes.dex.base == 12 ? 12 : attributes.dex.base + 2,
		ins: attributes.ins.base == 12 ? 12 : attributes.ins.base + 2,
		mig: attributes.mig.base == 12 ? 12 : attributes.mig.base + 2,
		wlp: attributes.wlp.base == 12 ? 12 : attributes.wlp.base + 2,
	};
	return new Promise((resolve) => {
		new Dialog({
			title: `Hai raggiunto il livello ${actor.system.level.value}!`,
			content: `
				<p>Devi scegliere una delle tue Caratteristiche e ne incrementi la taglia di dado base di un grado (massimo <strong>d12</strong>)</p>
				<div class="form-group">
					<label for="radioDex">Destrezza ( d${attributes.dex.base} => d${newAttributes.dex} )</label>
					<input type="radio" id="radioDex" name="formAttributeIncrease" value="dex" ${attributes.dex.base == 12 ? 'disabled' : ''} />
				</div>
				<div class="form-group">
					<label for="radioIns">Intuito ( d${attributes.ins.base} => d${newAttributes.ins} )</label>
					<input type="radio" id="radioIns" name="formAttributeIncrease" value="ins" ${attributes.ins.base == 12 ? 'disabled' : ''} />
				</div>
				<div class="form-group">
					<label for="radioMig">Vigore ( d${attributes.mig.base} => d${newAttributes.mig} )</label>
					<input type="radio" id="radioMig" name="formAttributeIncrease" value="mig" ${attributes.mig.base == 12 ? 'disabled' : ''} />
				</div>
				<div class="form-group">
					<label for="radioWlp">Volontà ( d${attributes.wlp.base} => d${newAttributes.wlp} )</label>
					<input type="radio" id="radioWlp" name="formAttributeIncrease" value="wlp" ${attributes.wlp.base == 12 ? 'disabled' : ''} />
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
						
						await actor.update({ 'system.attributes.dex.base': newAttributes.dex });
						await actor.update({ 'system.attributes.ins.base': newAttributes.ins });
						await actor.update({ 'system.attributes.mig.base': newAttributes.mig });
						await actor.update({ 'system.attributes.wlp.base': newAttributes.wlp });
						resolve(true);
					}
				},
			}
		}).render(true);
	});
}

async function openClassFeaturesChildDialog( sourceClass, actor, featureItem = null ) {

	let classFeatures = [];
	for ( const id of sourceClass.system.features ) {
		let item = game.items.get( id );
		if ( item ) {
			classFeatures.push( item );
			continue;
		}

		for ( const pack of game.packs ) {
			if ( pack.documentName === 'Item' ) {
				item = await pack.getDocument( id );
				if ( item ) {
					classFeatures.push( item );
					break;
				}
			}
		}
	}
	
	if ( classFeatures.length === 0 ) {
		ui.notifications.warn(`L'Item ${sourceClass.name} non ha Abilità di Classe selezionabili`);
		return false;
	}

	if ( featureItem === null ) {
		let skillOptions = '<div class="form-choose-feature">';
		for ( const skill of classFeatures ) {
			let skillCurrentLevel = null;
			let skillMaxLevel = null;
			actor.items.forEach(item => {
				if ( item.system.fabulaID === skill.system.fabulaID ) {
					skillCurrentLevel = item.system.level.current;
					skillMaxLevel = item.system.level.max;
					return;
				}
			});
			if ( skillCurrentLevel === null && skillMaxLevel === null ) {
				skillCurrentLevel = skill.system.level.current; 
				skillMaxLevel = skill.system.level.max;
			}

			skillOptions += `
				<div class="form-feature-group ${skill.system.sourcebook}">
					<label class="${skillCurrentLevel == skillMaxLevel ? 'disabled' : ''}">
						<div class="title">
							${skill.name}
			`;
			if ( skillCurrentLevel < skillMaxLevel ) {
				skillOptions += `
							<span class="upgrade">
								${skillCurrentLevel}
								<i class="fa fa-fw fa-right-long"></i>
								${skillCurrentLevel + 1}
							</span>
				`;
			} else {
				skillOptions += `
							<span class="upgrade">
								<span>MAX</span>
							</span>
				`;
			}
			const enrichedDescription = await TextEditor.enrichHTML( skill.system.description ?? '' );
			skillOptions += `
							<span class="max">
								(<span>l</span> ${skillMaxLevel})
							</span>
						</div>
						<div class="description">
							${enrichedDescription}
						</div>
						<input type="radio" name="formClassFeature" value="${skill._id}" ${skillCurrentLevel == skillMaxLevel ? 'disabled' : ''} />
					</label>
				</div>
			`;
		}
		skillOptions += '</div>';

		return new Promise((resolve) => {
			new Dialog({
				title: `Hai scelto: ${sourceClass.name}!`,
				content: `
					<p>Scegli una delle seguenti <strong>Abilità di Classe</strong>:</p>
					${skillOptions}
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
							const compendium = game.packs.get('fabula.classfeatures');
							const feature = await compendium.getDocument( featureID );

							let existingFeatureID = null;
							actor.items.forEach(item => {
								if ( item.system.fabulaID === feature.system.fabulaID ) {
									existingFeatureID = item._id;
									return;
								}
							});

							if ( existingFeatureID === null ) {
								const newFeature = feature.toObject();
								newFeature.system.level.current++;
							
								resolve( await actor.createEmbeddedDocuments("Item", [newFeature]) );
							} else {
								const item = actor.items.get( existingFeatureID );
								const newLevel = item.system.level.current + 1;
								resolve( await item.update({ 'system.level.current': newLevel }) );
							}
						}
					}
				}
			}, {
				width: 500,
			}).render(true);
		});
	} else {

		let existingFeatureID = null;
		actor.items.forEach(item => {
			if ( item.system.fabulaID === featureItem.system.fabulaID ) {
				existingFeatureID = item._id;
				return;
			}
		});

		if ( existingFeatureID === null ) {
			featureItem.system.level.current++;
			return await actor.createEmbeddedDocuments("Item", [featureItem]);
		} else {
			const item = actor.items.get( existingFeatureID );
			const newLevel = item.system.level.current + 1;
			return await item.update({ 'system.level.current': newLevel });
		}
	}
}

export async function addClassToActor( actor, sourceItem, isClassFeature = false ) {

	if ( actor.system.level.value >= 50 ) {
		ui.notifications.warn('Hai già raggiunto il livello massimo! Non puoi aumentare ulteriolmente il livello');
		return false;
	}
	
	let className;
	let featureItem;
	if ( isClassFeature ) {
		className = sourceItem.folder.name;
		let existingFeatureID = null;
		actor.items.forEach(item => {
			if ( item.system.fabulaID === sourceItem.system.fabulaID ) {
				existingFeatureID = item._id;
				return;
			}
		});
		if ( existingFeatureID === null ) {
			featureItem = sourceItem.toObject();
		} else {
			featureItem = actor.items.get( existingFeatureID );
			featureItem = featureItem.toObject();
		}
		if ( featureItem.system.level.current >= featureItem.system.level.max ) {
			ui.notifications.warn(`Non puoi acquisire ulteriori livelli nell'abilità: ${featureItem.name}!`);
			return false;
		}
	} else {
		className = sourceItem.name;
		featureItem = null;
	}
	let obtainHeroicSkill = false;

	// Check if Actor has already 3 non masterd classes
	let nonMasteredClasses = 0;
	const actorClasses = actor.items.filter( item => item.type === 'class' ) ?? [];
	for ( const item of actorClasses ) {
		if ( item.system.level.value < 10 && item.name !== className )
			nonMasteredClasses++;
	}
	if ( nonMasteredClasses >= 3 ) {
		ui.notifications.warn(`Non puoi acquisire un livello in ${className}! Hai già 3 classi non padroneggiate!`);
		return false;
	}

	// Check if the class is new or already obtained
	const embeddedClass = actor.items.find( item => item.type === 'class' && item.name == className );
	if ( embeddedClass ) {

		if ( embeddedClass.system.level.value == 10 ) {
			ui.notifications.warn(`Possiedi già 10 livelli nella classe ${className} e non puoi acquisirne altri!`);
			return false;
		}
		
		let featureAdded = false;
		featureAdded = await openClassFeaturesChildDialog( embeddedClass, actor, featureItem );

		let featureClone = [];
		
		if ( featureAdded.hasOwnProperty(0) ) {
			featureClone = featureAdded;
		} else {
			featureClone.push( featureAdded );
		}
		if ( featureAdded !== false && featureClone[0]?.system?.advancement?.value === true ) {
			featureAdded = false;
			featureAdded = await openClassFeaturesChildDialog( featureClone[0], actor );
		}

		if ( featureAdded !== false && embeddedClass.system.level.value < 10 ) {
			const newLevel = embeddedClass.system.level.value + 1;
			await embeddedClass.update({ 'system.level.value': newLevel });
			if ( embeddedClass.system.level.value == 10 ) 
				obtainHeroicSkill = true;
		}

	} else {

		// Check if class gives multiple choice of benefits
		let newClass;
		if ( isClassFeature ) {
			const pack = game.packs.get('fabula.classes');
			const classInPack = pack.index.find(item => item.name == sourceItem.folder.name);
			const classDocument = await pack.getDocument( classInPack._id );
			newClass = classDocument.toObject();
		} else {
			newClass = sourceItem.toObject();
		}
		if ( ( newClass.system.bonus.hp + newClass.system.bonus.mp + newClass.system.bonus.ip ) > 1 ) {
			let radios = '';
			if ( newClass.system.bonus.hp ) {
				radios += `<div class="form-group">
							<input type="radio" style="flex:0;" name="formClassBenefit" id="benefitHP" value="hp" />
							<label for="benefitHP">Punti Ferita</label>
						</div>`;
			}
			if ( newClass.system.bonus.mp ) {
				radios += `<div class="form-group">
							<input type="radio" style="flex:0;" name="formClassBenefit" id="benefitMP" value="mp" />
							<label for="benefitMP">Punti Mente</label>
						</div>`;
			}
			if ( newClass.system.bonus.ip ) {
				radios += `<div class="form-group">
							<input type="radio" style="flex:0;" name="formClassBenefit" id="benefitIP" value="ip" />
							<label for="benefitIP">Punti Inventario</label>
						</div>`;
			}
			await openFreeBenefirsChildDialog( radios, newClass );
		}
		newClass.system.level.value++;
		await actor.createEmbeddedDocuments("Item", [newClass]);

		const addedClass = actor.items.find( item => item.type === 'class' && item.name == className );
		let featureAdded = false;
		featureAdded = await openClassFeaturesChildDialog( addedClass, actor, featureItem );

		let featureClone = [];
		if ( featureAdded.hasOwnProperty(0) ) {
			featureClone = featureAdded;
		} else {
			featureClone.push( featureAdded );
		}
		if ( featureAdded !== false && featureClone[0]?.system?.advancement?.value === true ) {
			featureAdded = false;
			featureAdded = await openClassFeaturesChildDialog( featureClone[0], actor );
		}

		if ( featureAdded === false ) {
			const itemToBeRemoved = actor.items.get( addedClass._id );
			await itemToBeRemoved.delete();
		}

	}

	// Remove exp
	if ( actor.system.level.exp >= 10 ) {
		const newExp = actor.system.level.exp - 10;
		await actor.update({ 'system.level.exp': newExp });
	}

	// Check if Actor level is 20 or 40
	if ( actor.system.level.value == 20 || actor.system.level.value == 40 ) {
		await openAttributesIncreaseChildDialog( actor );
	}

	// Check if Actor can obtain an Heroic Skill
	if ( obtainHeroicSkill ) {
		ui.notifications.info(`Hai padroneggiato la classe ${className}! Ora puoi acquisire un'Abilità Eroica`);
		const heroicSkills = game.packs.get('fabula.heroicskill');
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

	actor.render(true);
	return;
}