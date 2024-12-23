export const SYSTEM = 'Fabula Ultima';

export const FU = {};

FU.ItemTypes = {
	"": "FU.selectOption",
	accessory: 'TYPES.Item.accessory',
	arcanum: 'TYPES.Item.arcanum',
	armor: 'TYPES.Item.armor',
	artifact: 'TYPES.Item.artifact',
	attack: 'TYPES.Item.attack',
	baseItem: 'TYPES.Item.baseItem',
	class: 'TYPES.Item.class',
	classFeature: 'TYPES.Item.classFeature',
	consumable: 'TYPES.Item.consumable',
	heroicSkill: 'TYPES.Item.heroicSkill',
	project: 'TYPES.Item.project',
	ritual: 'TYPES.Item.ritual',
	rule: 'TYPES.Item.rule',
	shield: 'TYPES.Item.shield',
	spell: 'TYPES.Item.spell',
	weapon: 'TYPES.Item.weapon',
};

FU.sourcebook = {
	base: 'FU.sourcebook.base',
	bonusAce: 'FU.sourcebook.bonusAce',
	bonusNecromancer: 'FU.sourcebook.bonusNecromancer',
	atlasHighFantasy: 'FU.sourcebook.atlasHighFantasy',
	atlasTechnoFantasy: 'FU.sourcebook.atlasTechnoFantasy',
	atlasNaturalFantasy: 'FU.sourcebook.atlasNaturalFantasy',
}

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

FU.attributesDice = {
	6: 'FU.D6',
	8: 'FU.D8',
	10: 'FU.D10',
	12: 'FU.D12',
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
	"": "FU.selectType",
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
	"": "FU.selectOption",
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

FU.NPCactionTypes = {
	attack: 'FU.NPCactions.attack',
	other: 'FU.NPCactions.other',
	rule: 'FU.NPCactions.rule',
};

FU.martialItems = {
	meleeWeapon: 'FU.martialItems.meleeWeapon',
	rangedWeapon: 'FU.martialItems.rangedWeapon',
	armor: 'FU.martialItems.armor',
	shield: 'FU.martialItems.shield',
};

FU.bondType1 = {
	"": "FU.bond.none",
	admiration: 'FU.bond.admiration',
	inferiority: 'FU.bond.inferiority',
};

FU.bondType2 = {
	"": "FU.bond.none",
	loyalty: 'FU.bond.loyalty',
	mistrust: 'FU.bond.mistrust',
};

FU.bondType3 = {
	"": "FU.bond.none",
	affection: 'FU.bond.affection',
	hatred: 'FU.bond.hatred',
};

FU.affinity = {
	"": "FU.selectOption",
	vulnerability: 'FU.affinity.vulnerability',
	resistance: 'FU.affinity.resistance',
	immunity: 'FU.affinity.immunity',
	absorption: 'FU.affinity.absorption',
};

FU.consumableType = {
	potion: 'FU.consumable.potion',
	utility: 'FU.consumable.utility',
};

FU.villainTypes = {
	"": "FU.villain.none",
	minor: 'FU.villain.minor',
	major: 'FU.villain.major',
	supreme: 'FU.villain.supreme',
};

FU.enemyRanks = {
	soldier: 'FU.enemy.soldier',
	elite: 'FU.enemy.elite',
	champion: 'FU.enemy.champion',
};

FU.species = {
	beast: 'FU.species.beast',
	construct: 'FU.species.construct',
	demon: 'FU.species.demon',
	elemental: 'FU.species.elemental',
	monster: 'FU.species.monster',
	plant: 'FU.species.plant',
	undead: 'FU.species.undead',
	humanoid: 'FU.species.humanoid',
};
