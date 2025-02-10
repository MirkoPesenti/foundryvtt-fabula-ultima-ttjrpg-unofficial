export function awaitDialogSelect( data ) {
	return new Promise((resolve) => {
        new Dialog({
            title: data.title || '',
			content: `
				<div class="form-group">
					<label>${data.optionsLabel}</label>
					<select id="formDialogSelect">
						${data.options}
					</select>
				</div>
			`,
			buttons: {
				cancel: {
					label: 'Annulla',
					callback: () => resolve(false),
				},
				confirm: {
					label: 'Conferma',
					callback: (html) => {
						const selectedStatus = html.find('#formDialogSelect').val();
						if ( selectedStatus != '' ) {
							resolve(selectedStatus);
						} else {
							resolve(false);
						}
					}
				},
			},
            close: () => resolve(false),
        }).render(true);
    });
}

export function returnSortedPack( packId, itemType ) {
	const pack = game.packs.get( packId );
	const sortedPack = pack.index.contents.sort( ( a, b ) => a.name.localeCompare(b.name) );

	const items = Array.from(
		sortedPack.reduce((acc, item) => {
			if ( item.type == itemType ) {
				if ( !acc.has( item.folder ) ) {
					const foundFolder = pack.folders.find( folder => folder._id === item.folder );
					acc.set( item.folder, { folder: foundFolder.name, items: [] } );
				}

				acc.get( item.folder ).items.push( item );
			}
			return acc;
		}, new Map()).values()
	);

	const sortedItemsList = items.sort((a, b) => {
		if ( a.folder === game.i18n.localize('FU.sourcebook.base') ) return -1;
		if ( b.folder === game.i18n.localize('FU.sourcebook.base') ) return 1;

		return a.folder.localeCompare(b.folder);
	});

	return sortedItemsList;
}

export function generateDataLink( data, label = null, tolltipLabel = null, icon = null, classes = null ) {

	if ( data ) {
		const id = data._id;
		const uuid = data.uuid;
		const faIcon = icon === null ? '<i class="fa fa-suitcase"></i>' : `<i class="fa fa-${icon}"></i>`;
		const tooltip = tolltipLabel === null ? `Apri ${data.name}` : tolltipLabel;
		const text = label === null ? `Apri ${data.name}` : label;

		return `<a class="content-link ${classes}" draggable="true" data-link data-uuid="${uuid}" data-id="${id}" data-type="Item" data-tooltip="${tooltip}">${faIcon} ${text}</a>`;
	} else {
		return '<mark>Error: data not found</mark>';
	}

}

export async function setProgress( item, newValue, stepIncrease = 0 ) {
	if ( newValue === null ) {
		newValue = item.system.progress.current + stepIncrease;
	}
    await item.update({ 'system.progress.current': newValue });
}