import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import blockAutoformatEditing from '@ckeditor/ckeditor5-autoformat/src/blockautoformatediting';

import inlineAutoformatEditing from '@ckeditor/ckeditor5-autoformat/src/inlineautoformatediting';
import LivePosition from '@ckeditor/ckeditor5-engine/src/model/liveposition';

import Math from './math';
export default class AutoformatMath extends Plugin {
	static get requires() {
		return [ Math, Autoformat ];
	}

	afterInit() {
		const editor = this.editor;
		const command = editor.commands.get( 'math' );

		if ( command ) {
			const mathBlockCallback = getCallbackFunctionForBlockAutoformat( editor, command );
			const mathInlineCallback = getCallbackFunctionForInlineAutoformat( editor, command );

			blockAutoformatEditing( editor, this, /^\\\[$/, mathBlockCallback );
			// blockAutoformatEditing( editor, this, /^\$\$$/, mathBlockCallback );
			inlineAutoformatEditing( editor, this, /(?:^|\s)(\$)([^$]*)(\$)$/g , mathInlineCallback)

		}
	}

	static get pluginName() {
		return 'AutoformatMath';
	}
}

function getCallbackFunctionForBlockAutoformat( editor, command ) {
	return () => {
		if ( !command.isEnabled ) {
			return false;
		}

		command.display = true;
		editor.plugins.get( 'MathUI' )._showUI();
	};
}

function getCallbackFunctionForInlineAutoformat( editor, command ) {
	return ( writer, rangesToFormat ) => {
		if ( !command.isEnabled ) {
			return false;
		}
		// text in between symbols 
		let text = '';
		console.log(rangesToFormat)
		writer.setSelection(rangesToFormat)
		for ( const range of rangesToFormat ) {
			// writer.setAttribute( 'math', true, range );
			const walker = range.getWalker( { ignoreElementEnd: true } );

			// Get equation text
			for ( const node of walker ) {
				if ( node.item.is( '$textProxy' ) ) {
					text += node.item.data;
					console.log(node,node.item.data)
				}
			}
			const leftLivePosition = LivePosition.fromPosition( range.start );
			leftLivePosition.stickiness = 'toPrevious';

			const rightLivePosition = LivePosition.fromPosition( range.end );
			rightLivePosition.stickiness = 'toNext';
			leftLivePosition.detach();
			rightLivePosition.detach();
		}
		text = text.trim();
		setTimeout(() => {
			command.value = text;
			command.display = false;
			// This is ugly, but we enforce that the selection is updated this way
			editor.plugins.get( 'MathUI' )._showUI();
		},100)

	}
}
