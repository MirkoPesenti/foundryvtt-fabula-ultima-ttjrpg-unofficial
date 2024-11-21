import { FU } from "../helpers/config.mjs";

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
		
		context.rollData = context.actor.getRollData();

		context.FU = FU;

		return context;
	}

	activateListeners( html ) {
		super.activateListeners( html );

		html.on('click','.roll', this._onRoll.bind(this));
		html.on('click','.getActor', () => console.log(this.actor));
		html.on('click','.addClass', () => {
			const pack = game.packs.get('fabula.classes');
			let options = '';
			pack.index.forEach((value, key) => {
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
								const document = await pack.getDocument(entry._id);
								await this._addClass( document.toObject() );
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
		await this.actor.createEmbeddedDocuments('Item', [classItem]);
	}
}