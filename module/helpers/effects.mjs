import { FabulaActor } from "../documents/actors/actor.mjs";

export async function changeProjectProgress( event, item, increase = true, value = undefined ) {
    event.preventDefault();
    let newValue = item.system.progress.current;
    if ( value == undefined ) {

        if ( increase )
            newValue += item.system.progress.step;
        else
            newValue -= item.system.progress.step;

    } else {
        newValue = value;
    }
    await item.update({ 'system.progress.current': newValue });
}

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
            cats.passive.effects.push(e);
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

        return owner.createEmbeddedDocuments('ActiveEffect', [{
            label: 'Nuovo effetto',
            origin: owner.uuid,
            'duration.rounds': content.dataset.effectType === 'temporary' ? 1 : undefined,
            disabled: content.dataset.effectType === 'inactive',
        }]);

    } else if ( action == 'open' ) {

        return effect.sheet.render(true);

    } else if ( action == 'remove' ) {

        return effect.delete();

    } else if ( action == 'toggle' ) {

        return effect.update({ disabled: !effect.disabled });

    }

}