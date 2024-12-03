import { FU } from "../helpers/config.mjs";
import { showItemInChat } from "../helpers/helpers.mjs";

/**
 * Extend basic ActorSheet
 * @extends {ActorSheet}
 */

export class FabulaActorSheet extends ActorSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['fabula', 'sheet', 'actor', 'backgroundstyle'],
			width: 700,
			height: 700,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description', }],
		});
	}

	get template() {
		const path = 'systems/fabula/templates/actors';
		return `${path}/actor-${this.actor.type}-sheet.hbs`;
	}

	async getData() {
		const context = super.getData();
		const actorData = context.actor;

		context.system = actorData.system;
		context.flags = actorData.flags;

		await this._prepareItems(context);

		//Add required CONFIG data
		context.sourcebook = CONFIG.FU.sourcebook;
		context.attributes = CONFIG.FU.attributes;
		context.attributesAbbr = CONFIG.FU.attributesAbbr;
		context.DamageTypes = CONFIG.FU.DamageTypes;
		context.WeaponRanges = CONFIG.FU.WeaponRanges;
		context.weaponCategories = CONFIG.FU.weaponCategories;
		context.SpellDurations = CONFIG.FU.SpellDurations;
		context.SpellDisciplines = CONFIG.FU.SpellDisciplines;
		context.potencyList = CONFIG.FU.potencyList;
		context.areaList = CONFIG.FU.areaList;
		context.usesList = CONFIG.FU.usesList;
		context.rarityList = CONFIG.FU.rarityList;
		context.martialItems = CONFIG.FU.martialItems;
		
		context.rollData = context.actor.getRollData();

		context.FU = FU;

		// if ( actorData.type == 'character' && actorData.system.level.value < 5 )
		// 	await this._characterCreation( actorData );

		return context;
	}

	activateListeners( html ) {
		super.activateListeners( html );

		html.on('click', '.js_showInChat', (e) => {
			e.preventDefault();
			const data = e.currentTarget.dataset;
			showItemInChat( data );
		});

		html.on('click','.roll', this._onRoll.bind(this));
		html.on('click','.getActor', () => console.log(this.actor));
		html.on('click','.addClass', () => {
			const pack = game.packs.get('fabula.classes');
			const sortedPack = pack.index.contents.sort( ( a, b ) => a.name.localeCompare(b.name) );
			let options = '';
			sortedPack.forEach((value, key) => {
				options += `<option value="${value.name}">${value.name}</option>`;
			})
			new Dialog({
				title: 'Seleziona Classe',
				content: `
					<form>
						<div class="form-group">
							<label>Classe:</label>
							<select id="formClass">
								${options}
							</select>
						</div>
					</form>
				`,
				buttons: {
					confirm: {
						label: 'Conferma',
						callback: async (html) => {
							const selectedClass = html.find('#formClass').val();
							const entry = pack.index.find(e => e.name === selectedClass);
							if (entry) {
								const actor = this;
								const document = await pack.getDocument(entry._id);
								if ( ( document.system.bonus.hp + document.system.bonus.mp + document.system.bonus.ip ) > 1 ) {
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
									new Dialog({
										title: 'Scegli beneficio',
										content: `<form>${radios}</form>`,
										buttons: {
											confirm: {
												label: 'Conferma',
												callback: async (html) => {
													const radio = html.find('[name="formClassBenefit"]:checked').val();
													let clonedDocument = document.toObject()
													clonedDocument.system.bonus = {
														hp: false,
														mp: false,
														ip: false,
													}
													clonedDocument.system.bonus[radio] = true;
													await actor._addClass( clonedDocument );
												}
											},
											cancel: {
												label: 'Annulla',
											},
										},
									}).render(true);
								} else {
									await actor._addClass( document.toObject() );
								}
							}
							return null;
						}
					},
					cancel: {
						label: 'Annulla',
					},
				},
			}).render(true);
		});

		if (!this.isEditable) return;
	}

	async _prepareItems(context) {
		const weapons = [];
		const armor = [];
		const shields = [];
		const accessories = [];
		const classes = [];
		const spells = [];
		const consumables = [];
		const projects = [];
		const rituals = [];

		for (let i of context.items) {
			i.img = i.img || CONST.DEFAULT_TOKEN;

			if (i.type === 'weapon') {
				weapons.push(i);
			} else if (i.type === 'armor') {
				armor.push(i);
			} else if (i.type === 'shield') {
				shields.push(i);
			} else if (i.type === 'accessory') {
				accessories.push(i);
			} else if (i.type === 'class') {
				classes.push(i);
			} else if (i.type === 'spell') {
				spells.push(i);
			} else if (i.type === 'consumable') {
				consumables.push(i);
			} else if (i.type === 'project') {
				projects.push(i);
			} else if (i.type === 'ritual') {
				rituals.push(i);
			}
		}

		context.weapons = weapons;
		context.armor = armor;
		context.shields = shields;
		context.accessories = accessories;
		context.classes = classes;
		context.spells = spells;
		context.consumables = consumables;
		context.projects = projects;
		context.rituals = rituals;
		context.classFeature = {};

		for (const item of this.actor.itemTypes.classFeature) {
			const featureType = (context.classFeature[item.system.featureType] ??= {
				feature: item.system.data?.constructor,
				items: {},
			});
			featureType.items[item.id] = { item, additionalData: await featureType.feature?.getAdditionalData(item.system.data) };
		}
	}

	_onRoll(e) {
		e.preventDefault();
		const element = e.currentTarget;
		const data = element.dataset;

		if ( data.rollType ) {
			if ( data.rollType == 'item' ) {
				const itemId = element.closest('.item').dataset.itemId;
				const item = this.actor.items.get(itemId);
				if ( item ) return item.roll();
			}
		}

		if ( data.roll ) {
			let label = data.label ? `[ability] ${data.label}` : '';
			let roll = new Roll( data.roll, this.actor.getRollData() );
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: label,
				rollMode: game.settings.get( 'core', 'rollMode' ),
			});
			return roll;
		}
	}

	async _addClass( classItem ) {
		const actorClasses = this.actor.getFlag('fabula', 'classes') || [];
		actorClasses.push(classItem);
		await this.actor.setFlag('fabula', 'classes', actorClasses);
	}
}