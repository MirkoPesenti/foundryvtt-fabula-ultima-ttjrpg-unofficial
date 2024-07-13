export default class FUItemSheet extends ItemSheet {

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 600,
			height: 300,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
		});
	}

	get template() {
		const path = 'systems/futtjrpg/templates/items';
		return `${path}/${this.item.type}-sheet.hbs`;
	}

	getData() {
		const context = super.getData();
		const itemData = context.data;

		context.rollData = this.item.getRollData();
		context.config = CONFIG.Fabula;
		context.system = itemData.system;

		console.log(context.system);

		return context;
	}

	prepareDerivedData() {
		const itemData = this;
		const systemData = itemData.system;
		const flags = systemData.flags.boilerplate || {};
	
		this._prepareSpellData(systemData);
	}

	activateListeners(html) {
		super.activateListeners(html);
	  
		if (!this.isEditable) return;
	  
		// html.on('click', '.effect-control', (ev) =>
		//   onManageActiveEffect(ev, this.item)
		// );
	}

	_prepareCharacterData(itemData) {
		if (itemData.type !== 'spell') return;

		const systemData = itemData.system;

		// for (let [key, ability] of Object.entries(systemData.abilities)) {
		//   // Calculate the modifier using d20 rules.
		//   ability.mod = Math.floor((ability.value - 10) / 2);
		// }
	}
	
}