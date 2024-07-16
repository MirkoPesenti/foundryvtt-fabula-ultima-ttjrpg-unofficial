export const SYSTEM = 'Fabula Ultima';

export const FU = {};

/**
 * Ability scores used in the system
 * @type {Object}
 */

FU.attributes = {
	dex: 'FU.AttributeDex',
	ins: 'FU.AttributeIns',
	mig: 'FU.AttributeMig',
	wlp: 'FU.AttributeWlp',
};

FU.attributesAbbr = {
	dex: 'FU.AttributeDexAbbr',
	ins: 'FU.AttributeInsAbbr',
	mig: 'FU.AttributeMigAbbr',
	wlp: 'FU.AttributeWlpAbbr',
};

FU.currencies = {
	zenit: {
		label: 'FU.Zenit',
		abbr: 'FU.ZenitAbbr',
		conversion: 1,
	},
};

/**
 * @typedef {"untyped", "physical", "air", "bolt", "dark", "earth", "fire", "ice", "light", "poison"} DamageTypes
 * @type {Object<DamageTypes, string}
 */

FU.DamageTypes = {
	physical: 'FU.DamageTypes.physical',
	air: 'FU.DamageTypes.air',
	bolt: 'FU.DamageTypes.bolt',
	dark: 'FU.DamageTypes.dark',
	earth: 'FU.DamageTypes.earth',
	fire: 'FU.DamageTypes.fire',
	ice: 'FU.DamageTypes.ice',
	light: 'FU.DamageTypes.light',
	poison: 'FU.DamageTypes.poison',
};

FU.ItemTypes = {
	spell: 'FU.ItemTpes.spell',
	ritual: 'FU.ItemTpes.ritual',
	accessory: 'FU.ItemTpes.accessory',
	armor: 'FU.ItemTpes.armor',
	weapon: 'FU.ItemTpes.weapon',
	shield: 'FU.ItemTpes.shield',
	project: 'FU.ItemTpes.project',
	consumable: 'FU.ItemTpes.consumable',
};

/**
 * @typedef {"arcanism", "chimerism", "elementalism", "entropism", "ritualism", "spiritism"} MagicDisciplines
 * @type {Object<MagicDisciplines, string}
 */

FU.MagicDisciplines = {
	arcanism: 'FU.MagicDisciplines.arcanism',
	chimerism: 'FU.MagicDisciplines.chimerism',
	elementalism: 'FU.MagicDisciplines.elementalism',
	entropism: 'FU.MagicDisciplines.entropism',
	ritualism: 'FU.MagicDisciplines.ritualism',
	spiritism: 'FU.MagicDisciplines.spiritism',
};

/**
 * @typedef {"chimerism", "elementalism", "entropism", "spiritism"} SpellDisciplines
 * @type {Object<SpellDisciplines, string}
 */

FU.SpellDisciplines = {
	chimerism: 'FU.MagicDisciplines.chimerism',
	elementalism: 'FU.MagicDisciplines.elementalism',
	entropism: 'FU.MagicDisciplines.entropism',
	spiritism: 'FU.MagicDisciplines.spiritism',
};

/**
 * @typedef {"melee", "ranged"} SpellDurations
 * @type {Object.<SpellDurations, string>}
 */

FU.SpellDurations = {
	instantaneous: 'FU.SpellDurations.instantaneous',
	scene: 'FU.SpellDurations.scene',
};

FU.potency = {
	minor: 'FU.potency.minor',
	medium: 'FU.potency.medium',
	major: 'FU.potency.major',
	extreme: 'FU.potency.extreme',
};

FU.area = {
	individual: 'FU.area.individual',
	small: 'FU.area.small',
	large: 'FU.area.large',
	huge: 'FU.area.huge',
};

/**
 * @typedef {"arcane", "bow", "brawling", "dagger", "firearm", "flail", "heavy", "spear", "sword", "thrown", "custom"} WeaponCategory
 * @type {Object.<WeaponCategory, string>}
 */

FU.weaponCategories = {
	arcane: 'FU.weaponCategories.arcane',
	bow: 'FU.weaponCategories.bow',
	brawling: 'FU.weaponCategories.brawling',
	dagger: 'FU.weaponCategories.dagger',
	firearm: 'FU.weaponCategories.firearm',
	flail: 'FU.weaponCategories.flail',
	heavy: 'FU.weaponCategories.heavy',
	spear: 'FU.weaponCategories.spear',
	sword: 'FU.weaponCategories.sword',
	thrown: 'FU.weaponCategories.thrown',
};

/**
 * @typedef {"melee", "ranged"} WeaponRanges
 * @type {Object.<WeaponRanges, string>}
 */

FU.WeaponRanges = {
	melee: 'FU.WeaponRanges.melee',
	ranged: 'FU.WeaponRanges.ranged',
};
