import { FabulaActor } from "../documents/actors/actor.mjs";

export function prepareActiveEffect(effects) {

    const cats = {
        temporary: {
            type: 'temporary',
            label: 'Temporanei',
            effects: [],
        },
        passive: {
            type: 'passive',
            label: 'Passivi',
            effects: [],
        },
        inactive: {
            type: 'inactive',
            label: 'Disattivati',
            effects: [],
        }
    }

    for ( let e of effects ) {
        if ( e.disabled ) {
            cats.inactive.effects.push(e);
        } else if ( e.isTemporary ) {
            cats.temporary.effects.push(e);
        } else {
            if ( e.parent.isEmbedded && e.parent.type != 'classFeature' && e.parent.type != 'heroicSkill' ) {
                if ( e.parent.system.isEquipped ) {
                    cats.passive.effects.push(e);
                } else {
                    cats.inactive.effects.push(e);
                }
            } else {
                cats.passive.effects.push(e);
            }
        }
    }

    return cats;

}

export async function manageActiveEffect(event, owner) {
    event.preventDefault();
    const element = event.currentTarget;
    const content = element.closest('.content-collapse');
    const action = element.dataset.action;
    const effectID = element.dataset.effectid;
    let effect;

    if ( owner instanceof FabulaActor ) {
        effect = Array.from( owner.allApplicableEffects() ).find((value) => value.id === effectID);
    } else {
        effect = owner.effects.get(effectID);
    }
    
    if ( action == 'create' ) {

        const createdEffect = await owner.createEmbeddedDocuments('ActiveEffect', [{
            label: 'Nuovo effetto',
            icon: 'systems/fabula/assets/icons/default-effect.svg',
            origin: owner.uuid,
            'duration.rounds': content.dataset.effectType === 'temporary' ? 1 : undefined,
            disabled: content.dataset.effectType === 'inactive',
        }]);
        createdEffect[0].sheet.render(true);

    } else if ( action == 'open' ) {

        effect.sheet.render(true);

    } else if ( action == 'remove' ) {

        await effect.delete();

    } else if ( action == 'toggle' ) {
        
        await effect.update({ disabled: !effect.disabled });

    }

    return;
}