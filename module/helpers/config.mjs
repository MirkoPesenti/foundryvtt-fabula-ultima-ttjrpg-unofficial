export const SYSTEM = 'Fabula Ultima';

export const FU = {};

FU.journalName = 'Tracciamento risorse';

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
	skill: 'TYPES.Item.skill',
	spell: 'TYPES.Item.spell',
	weapon: 'TYPES.Item.weapon',
};

FU.sourcebook = {
	base: 'FU.sourcebook.base',
	bonusAce: 'FU.sourcebook.bonusAce',
	bonusHalloween: 'FU.sourcebook.bonusHalloween',
	bonusArcaneWhispers: 'FU.sourcebook.bonusArcaneWhispers',
	atlasHighFantasy: 'FU.sourcebook.atlasHighFantasy',
	atlasTechnoFantasy: 'FU.sourcebook.atlasTechnoFantasy',
	atlasNaturalFantasy: 'FU.sourcebook.atlasNaturalFantasy',
}

FU.classes = {
	arcanist: 'FU.classes.arcanist',
	chimerist: 'FU.classes.chimerist',
	darkblade: 'FU.classes.darkblade',
	elementalist: 'FU.classes.elementalist',
	entropist: 'FU.classes.entropist',
	fury: 'FU.classes.fury',
	guardian: 'FU.classes.guardian',
	loremaster: 'FU.classes.loremaster',
	orator: 'FU.classes.orator',
	rogue: 'FU.classes.rogue',
	sharpshooter: 'FU.classes.sharpshooter',
	spiritist: 'FU.classes.spiritist',
	tinkerer: 'FU.classes.tinkerer',
	wayfarer: 'FU.classes.wayfarer',
	weaponmaster: 'FU.classes.weaponmaster',
	commander: 'FU.classes.commander',
	dancer: 'FU.classes.dancer',
	singer: 'FU.classes.singer',
	symbolist: 'FU.classes.symbolist',
	esper: 'FU.classes.esper',
	mutant: 'FU.classes.mutant',
	pilot: 'FU.classes.pilot',
	florist: 'FU.classes.florist',
	gourmet: 'FU.classes.gourmet',
	merchant: 'FU.classes.merchant',
	summoner: 'FU.classes.summoner',
	cardAce: 'FU.classes.cardAce',
	necromancer: 'FU.classes.necromancer',
};

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

FU.attributesAbbrRitualChimerism = {
	ins: 'FU.attributesAbbr.ins',
	mig: 'FU.attributesAbbr.mig',
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

FU.recoverResources = {
	hp: 'FU.HP',
	mp: 'FU.MP',
},

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

FU.statusses = {
	"": "FU.selectType",
	slow: 'FU.Status.slow',
	dazed: 'FU.Status.dazed',
	weak: 'FU.Status.weak',
	shaken: 'FU.Status.shaken',
	enraged: 'FU.Status.enraged',
	poisoned: 'FU.Status.poisoned',
};

FU.statusEffects = {
	slow: 'FU.Status.slow',
	dazed: 'FU.Status.dazed',
	weak: 'FU.Status.weak',
	shaken: 'FU.Status.shaken',
	enraged: 'FU.Status.enraged',
	poisoned: 'FU.Status.poisoned',
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

FU.technologies = {
	alchemy: "FU.technologies.alchemy",
	infusions: "FU.technologies.infusions",
	magitech: "FU.technologies.magitech",
};

FU.infusionsBasic = {
	cryo: "FU.infusions.cryo",
	pyro: "FU.infusions.pyro",
	volt: "FU.infusions.volt",
};
FU.infusionsAdvanced = {
	cyclone: "FU.infusions.cyclone",
	exorcism: "FU.infusions.exorcism",
	seismic: "FU.infusions.seismic",
	shadow: "FU.infusions.shadow",
};
FU.infusionsSuperior = {
	vampire: "FU.infusions.vampire",
	venom: "FU.infusions.venom",
};

FU.verses = {
	volume: {
		low: 'FU.verses.volume.low',
		medium: 'FU.verses.volume.medium',
		high: 'FU.verses.volume.high',
	},
	key: {
		flame: {
			type: 'FU.DamageTypes.fire',
			status: 'FU.Status.shaken',
			attribute: 'FU.attributes.mig',
			recover: 'FU.HP',
		},
		iron: {
			type: 'FU.DamageTypes.physical',
			status: 'FU.Status.slow',
			attribute: 'FU.attributes.wlp',
			recover: 'FU.MP',
		},
		frost: {
			type: 'FU.DamageTypes.ice',
			status: 'FU.Status.weak',
			attribute: 'FU.attributes.wlp',
			recover: 'FU.MP',
		},
		stone: {
			type: 'FU.DamageTypes.earth',
			status: 'FU.Status.dazed',
			attribute: 'FU.attributes.mig',
			recover: 'FU.HP',
		},
		star: {
			type: 'FU.DamageTypes.light',
			status: 'FU.Status.dazed',
			attribute: 'FU.attributes.ins',
			recover: 'FU.HP',
		},
		darkness: {
			type: 'FU.DamageTypes.dark',
			status: 'FU.Status.weak',
			attribute: 'FU.attributes.dex',
			recover: 'FU.MP',
		},
		thunder: {
			type: 'FU.DamageTypes.bolt',
			status: 'FU.Status.shaken',
			attribute: 'FU.attributes.dex',
			recover: 'FU.HP',
		},
		wind: {
			type: 'FU.DamageTypes.air',
			status: 'FU.Status.slow',
			attribute: 'FU.attributes.ins',
			recover: 'FU.MP',
		},
	},
	tone: {
		calm: "FU.verses.tone.calm",
		energetic: "FU.verses.tone.energetic",
		frenetic: "FU.verses.tone.frenetic",
		unsettling: "FU.verses.tone.unsettling",
		threatening: "FU.verses.tone.threatening",
		solemn: "FU.verses.tone.solemn",
		lively: "FU.verses.tone.lively",
	},
};