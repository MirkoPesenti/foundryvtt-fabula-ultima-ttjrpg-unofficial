// Classes
import { FabulaItem } from './documents/items/item.mjs';

// Sheets
import { FabulaItemSheet } from './sheets/item-sheet.mjs';

// Helpers
import { FU, SYSTEM } from './helpers/config.mjs';

// Data Models
import { SpellDataModel } from './documents/items/spell-data-model.mjs';
import { RitualDataModel } from './documents/items/ritual-data-model.mjs';

/* ============================= */
/* 			Init Hook			 */
/* ============================= */

Hooks.once('init', async () => {

	console.log(`${SYSTEM} | Initializing Fabula Ultima TTJRPG (Unofficial)`);
	
	// Custum const for config
	CONFIG.FU = FU;

	// Utilities classes to global game object
	game.fabula = {
		FabulaItem,
	};

	// Custom document classes
	CONFIG.Item.documentClass = FabulaItem;
	CONFIG.Item.dataModels = {
		spell: SpellDataModel,
		ritual: RitualDataModel,
	};

	// Register Sheets
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('projectfu', FabulaItemSheet, {
		makeDefault: true,
	});

});