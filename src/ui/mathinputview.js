import View from '@ckeditor/ckeditor5-ui/src/view';
import { MathfieldElement} from 'mathlive';

export default class MathInputView extends View {
	constructor( locale,katexRenderOptions ) {
		super( locale );

		this.value = ""
		this.textAreaEl = null;
		this.mathFieldEl = null;
		this.katexRenderOptions = katexRenderOptions;
		this.lastFocused = null;

		this.on( 'change', () => {
			console.log("change")
			if(this.element){
				this.set('value',this.element.value)
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
		this.mathFieldEl = new MathfieldElement();
		console.log(this.katexRenderOptions?.macros);
		const macros =  {...this.mathFieldEl.getOptions('macros')}
		if(this.katexRenderOptions && this.katexRenderOptions.macros){
			for(const k in this.katexRenderOptions.macros){
				macros[k.substring(1)] = this.katexRenderOptions.macros[k]
			}
		}
		console.log(macros)
		this.mathFieldEl.setOptions({
			fontsDirectory: 'https://unpkg.com/mathlive/dist/fonts/',
			virtualKeyboardMode: 'manual',
			macros: macros,
			soundsDirectory: null,
			plonkSound: null
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

			// if(this.lastFocused == 'textarea'){
			// 	e.preventDefault();
			// 	this.mathFieldEl.focus();
			// }else{
			// 	this.lastFocused = 'textarea';
			// 	this.textAreaEl.selectionStart = this.textAreaEl.value.length
			// 	this.textAreaEl.selectionEnd = this.textAreaEl.value.length

			// }

		// this.mathFieldEl.onfocus = (e) => {
		// 	this.lastFocused = 'mathfield';
		// }
		// this.mathFieldEl.onblur = (e) => {
		// 	e.preventDefault();
		// 	e.stopPropagation();
		// 	this.textAreaEl.focus();
		// }

		// this.mathFieldEl.onblur = (e) => {
		// 	// console.log("mathFieldEl onblur")
		// 	// e.preventDefault();
		// 	// e.stopPropagation();
		// 	// this.textAreaEl.focus()
		// 	// this.element.blur();
		// 	// this.fire('blur',e)
		// }
		this.mathFieldEl.onkeydown = (e) => {
			if(e.key === 'Tab' && !e.shiftKey){
				console.log(this.mathFieldEl.executeCommand('complete'))
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
		this.mathFieldEl.tabindex = undefined;
		this.element.appendChild(this.mathFieldEl)
		this.element.appendChild(this.textAreaEl)
		this.element.tabIndex = -1

	}

	select() {
		this.mathFieldEl.focus()
	}



	focus(){
		// console.log(this.lastFocused)
		// if(this.lastFocused == null){
		// 	this.lastFocused = 'textarea';
			this.textAreaEl.focus();
		// }else if(this.lastFocused == 'textarea'){
		// 	this.lastFocused = 'mathfield';
		// 	this.mathFieldEl.focus();

		// }else if(this.lastFocused == 'mathfield'){
		// 	this.lastFocused = 'textarea';
		// 	this.textAreaEl.focus();

		// }
		// // if(this.mathFieldEl.hasFocus){
		// // 	this.textAreaEl.focus()

		// // }else if(this.textAreaEl.hasFocus){
		// // 	this.mathFieldEl.focus()
		// // }else{
		// // 	this.textAreaEl.focus()
		// // }
		// // this.mathFieldEl.focus()
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
		console.log("destroy!!!")
	}
}
