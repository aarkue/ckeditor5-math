import View from '@ckeditor/ckeditor5-ui/src/view';
import { MathfieldElement} from 'mathlive';

export default class MathInputView extends View {
	constructor( locale,katexRenderOptions ) {
		super( locale );
		this.value = '';
		// this.set('value','')
		this.textAreaEl = null;
		this.mathFieldEl = null;
		this.katexRenderOptions = katexRenderOptions;
		this.lastFocused = null;

		this.on( 'change', () => {
			console.log("change")
			if(this.element){
				// this.set('value',this.element.value)
				this.value = this.element.value
			}
		} );


		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-mathinput',
					'ck-reset_all-excluded'
				]
			},
			// on: {
			// 	input: bind.to((...args) => {
			// 		this.fire('input',...args)
			// 	})
			// }
		} );
	}


	render() {
		super.render();
		this.mathFieldEl = new MathfieldElement({fontsDirectory: null});
		const macros =  {...this.mathFieldEl.getOptions('macros')}
		if(this.katexRenderOptions && this.katexRenderOptions.macros){
			for(const k in this.katexRenderOptions.macros){
				macros[k.substring(1)] = this.katexRenderOptions.macros[k]
			}
		}
		this.mathFieldEl.setOptions({
			fontsDirectory: null,
			virtualKeyboardMode: 'manual',
			macros: macros,
			soundsDirectory: null,
			plonkSound: null,
			keypressSound: null
		});
		this.textAreaEl = document.createElement('textarea');

		this.textAreaEl.oninput = (e) => {
			this.setValue(e.currentTarget.value,'textarea')
		}
		this.textAreaEl.onkeydown = (e) => {
			if(e.key == 'Tab' && e.shiftKey){
				e.preventDefault();
				e.stopPropagation();
				this.mathFieldEl.focus();
			}
		}
		this.mathFieldEl.onkeydown = (e) => {
			if(e.key === 'Tab' && !e.shiftKey){
				e.stopPropagation();
			}else if(e.key === 'Enter' && e.ctrlKey){
				// Keybind to apply entered math
				// As this is also a keybind here, we might need to undo the last change (i.e. expansion of matrix with Ctrl+Enter)!
				this.mathFieldEl.executeCommand('undo');
				e.preventDefault();
				}
		}
		this.mathFieldEl.oninput = (e) => {
			this.setValue(e.currentTarget.value,'mathfield')
		}
		this.element.appendChild(this.mathFieldEl)
		this.element.appendChild(this.textAreaEl)

	}

	select() {
		this.mathFieldEl.focus()
	}



	focus(){
			this.textAreaEl.focus();
	}

	getValue(){
		return this.value
	}

	setValue(value, changedFrom){
		this.value = value
		if(changedFrom === 'textarea'){
			this.mathFieldEl.value = value;
		}else if(changedFrom === 'mathfield'){
			this.textAreaEl.value = value;
		}else{
// External
			this.mathFieldEl.value = value;
			this.textAreaEl.value = value;
		}
		this.fire('input')
	}

	destroy() {
		super.destroy();
		console.log("destroy")
		this.textAreaEl.remove();
		this.mathFieldEl.remove();
	}
}
