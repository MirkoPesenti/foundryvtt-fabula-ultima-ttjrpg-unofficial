/**
 * Pre load templates for fast access
 * @returns {Promise}
 */

export const preloadPartialTemplates = async function() {
    return loadTemplates([

        // Actors
        'systems/fabula/templates/actors/common/arcanum-list-item.hbs',
        'systems/fabula/templates/actors/common/attack-list-item.hbs',
        'systems/fabula/templates/actors/common/base-list-item.hbs',
        'systems/fabula/templates/actors/common/class-list-item.hbs',
        'systems/fabula/templates/actors/common/project-list-item.hbs',
        'systems/fabula/templates/actors/common/ritual-list-item.hbs',
        'systems/fabula/templates/actors/common/spell-list-item.hbs',

        // Items
        'systems/fabula/templates/item/common/sheet-header.hbs',
        'systems/fabula/templates/item/common/tab-settings.hbs',

        // Commons
        'systems/fabula/templates/common/active-effects.hbs',
        'systems/fabula/templates/common/class/free-benefits.hbs',

        // Chat Messages
        'systems/fabula/templates/chat/common/dice-result.hbs',
        'systems/fabula/templates/chat/common/dice-damage.hbs',

    ]);
}