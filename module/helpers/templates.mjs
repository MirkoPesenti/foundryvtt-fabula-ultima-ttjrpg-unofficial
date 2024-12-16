/**
 * Pre load templates for fast access
 * @returns {Promise}
 */

export const preloadPartialTemplates = async function() {
    return loadTemplates([

        // Chat Messages
        'systems/fabula/templates/chat/common/dice-result.hbs',
        'systems/fabula/templates/chat/common/dice-damage.hbs',

    ]);
}