/**
 * Pre load templates for fast access
 * @returns {Promise}
 */

export const preloadPartialTemplates = async function() {
    return loadTemplates([

        // Actors
        'systems/fabula/templates/actors/common/attack-list-item.hbs',
        'systems/fabula/templates/actors/common/spell-list-item.hbs',
        'systems/fabula/templates/actors/common/base-list-item.hbs',

        // Chat Messages
        'systems/fabula/templates/chat/common/dice-result.hbs',
        'systems/fabula/templates/chat/common/dice-damage.hbs',

    ]);
}