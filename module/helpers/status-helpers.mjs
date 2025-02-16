/**
 * @type {ActiveEffectData[]}
 */
export const statusEffects = [
	{
		id: 'slow',
		name: 'FU.Status.slow',
		img: 'systems/fabula/assets/icons/status/icon-slow.svg',
		changes: [
			{
				key: 'system.attributes.dex.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'dazed',
		name: 'FU.Status.dazed',
		img: 'systems/fabula/assets/icons/status/icon-dazed.svg',
		changes: [
			{
				key: 'system.attributes.ins.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'weak',
		name: 'FU.Status.weak',
		img: 'systems/fabula/assets/icons/status/icon-weak.svg',
		changes: [
			{
				key: 'system.attributes.mig.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'shaken',
		name: 'FU.Status.shaken',
		img: 'systems/fabula/assets/icons/status/icon-shaken.svg',
		changes: [
			{
				key: 'system.attributes.wlp.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'enraged',
		name: 'FU.Status.enraged',
		img: 'systems/fabula/assets/icons/status/icon-enraged.svg',
		changes: [
			{
				key: 'system.attributes.dex.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			},
			{
				key: 'system.attributes.ins.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'poisoned',
		name: 'FU.Status.poisoned',
		img: 'systems/fabula/assets/icons/status/icon-poisoned.svg',
		changes: [
			{
				key: 'system.attributes.wlp.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			},
			{
				key: 'system.attributes.mig.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'crisis',
		name: 'FU.crisis',
		img: 'systems/fabula/assets/icons/status/icon-crisis.svg',
	},
	{
		id: 'defeated',
		name: 'FU.defeated',
		img: 'systems/fabula/assets/icons/status/icon-defeated.svg',
	},
	{
		id: 'dex-down',
		name: 'FU.DEXdown',
		img: 'systems/fabula/assets/icons/status/icon-dex-down.svg',
		changes: [
			{
				key: 'system.attributes.dex.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'dex-up',
		name: 'FU.DEXup',
		img: 'systems/fabula/assets/icons/status/icon-dex-up.svg',
		changes: [
			{
				key: 'system.attributes.dex.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '2',
			}
		]
	},
	{
		id: 'ins-down',
		name: 'FU.INSdown',
		img: 'systems/fabula/assets/icons/status/icon-ins-down.svg',
		changes: [
			{
				key: 'system.attributes.ins.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'ins-up',
		name: 'FU.INSup',
		img: 'systems/fabula/assets/icons/status/icon-ins-up.svg',
		changes: [
			{
				key: 'system.attributes.ins.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '2',
			}
		]
	},
	{
		id: 'mig-down',
		name: 'FU.MIGdown',
		img: 'systems/fabula/assets/icons/status/icon-mig-down.svg',
		changes: [
			{
				key: 'system.attributes.mig.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'mig-up',
		name: 'FU.MIGup',
		img: 'systems/fabula/assets/icons/status/icon-mig-up.svg',
		changes: [
			{
				key: 'system.attributes.mig.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '2',
			}
		]
	},
	{
		id: 'wlp-down',
		name: 'FU.WLPdown',
		img: 'systems/fabula/assets/icons/status/icon-wlp-down.svg',
		changes: [
			{
				key: 'system.attributes.wlp.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '-2',
			}
		]
	},
	{
		id: 'wlp-up',
		name: 'FU.WLPup',
		img: 'systems/fabula/assets/icons/status/icon-wlp-up.svg',
		changes: [
			{
				key: 'system.attributes.wlp.current',
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: '2',
			}
		]
	},
];