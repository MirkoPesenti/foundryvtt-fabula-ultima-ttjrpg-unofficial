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

export async function createActiveEffect(event, owner) {
    event.preventDefault();
    const element = event.currentTarget;
    let effect;

    if ( owner instanceof FabulaActor ) {
    } else {
    }

    return owner.createEmbeddedDocuments('ActiveEffect', [{
        label: 'Nuovo effetto',
        icon: 'icons/svg/aura.svg',
    }]);
}