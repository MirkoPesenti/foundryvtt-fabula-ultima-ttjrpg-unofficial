export const SYSTEM = 'Fabula Ultima';

export const FU = {};

/**
 * Ability scores used in the system
 * @type {Object}
 */

FU.attributes = {
	dex: 'FU.attributes.dex',
	ins: 'FU.attributes.ins',
	mig: 'FU.attributes.mig',
	wlp: 'FU.attributes.wlp',
};

FU.attributesAbbr = {
	dex: 'FU.attributesAbbr.dex',
	ins: 'FU.attributesAbbr.ins',
	mig: 'FU.attributesAbbr.mig',
	wlp: 'FU.attributesAbbr.wlp',
};

FU.currencies = {
	zenit: {
		label: 'FU.Zenit',
		abbr: 'FU.ZenitAbbr',
		conversion: 1,
	},
};

FU.rarityList = {
	base: 'FU.rarityList.base',
	rare: 'FU.rarityList.rare'
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
 * @typedef {"instantaneous", "scene"} SpellDurations
 * @type {Object.<SpellDurations, string>}
 */

FU.SpellDurations = {
	instantaneous: 'FU.SpellDurations.instantaneous',
	scene: 'FU.SpellDurations.scene',
};

FU.potencyList = {
	minor: 'FU.potencyList.minor',
	medium: 'FU.potencyList.medium',
	major: 'FU.potencyList.major',
	extreme: 'FU.potencyList.extreme',
};

FU.areaList = {
	individual: 'FU.areaList.individual',
	small: 'FU.areaList.small',
	large: 'FU.areaList.large',
	huge: 'FU.areaList.huge',
};

FU.usesList = {
	consumable: 'FU.usesList.consumable',
	permanent: 'FU.usesList.permanent',
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

FU.martialItems = {
	meleeWeapon: 'FU.martialItems.meleeWeapon',
	rangedWeapon: 'FU.martialItems.rangedWeapon',
	armor: 'FU.martialItems.armor',
	shield: 'FU.martialItems.shield',
};

FU.bondType1 = {
	admiration: 'FU.bond.admiration',
	inferiority: 'FU.bond.inferiority',
};

FU.bondType2 = {
	loyalty: 'FU.bond.loyalty',
	mistrust: 'FU.bond.mistrust',
};

FU.bondType3 = {
	affection: 'FU.bond.affection',
	hatred: 'FU.bond.hatred',
};
