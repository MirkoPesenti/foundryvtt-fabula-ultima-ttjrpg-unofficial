import { FU } from "../../../helpers/config.mjs";

function migrateFabulaPoints( source ) {
	if ( typeof source.resources?.fp == 'number' ) {
		const fp = {
			current: source.resources.fp ?? 0,
		};
		source.resources.fp = fp;
	}
}

export class CharacterMigration {
	static run( source ) {

		// system.resources.fp => system.resources.fp.current
		migrateFabulaPoints( source );

	}
}