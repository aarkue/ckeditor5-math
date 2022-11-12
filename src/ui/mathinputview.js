import View from '@ckeditor/ckeditor5-ui/src/view';
import { MathfieldElement} from 'mathlive';

export default class MathInputView extends View {
	constructor( locale ) {
		super( locale );

		this.value = ""
		this.textAreaEl = null;
		this.mathFieldEl = null;

		this.on( 'change', () => {
			console.log("change")
			if(this.element){
				this.set('value',this.element.value)
			}
		} );


		this.setTemplate( {
			tag: 'div',
			attributes: {
				'fonts-directory': '',
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
		this.mathFieldEl.setOptions({
			fontsDirectory: 'https://unpkg.com/mathlive/dist/fonts/',
			virtualKeyboardMode: 'manual',
		});
		this.textAreaEl = document.createElement('textarea');

		this.textAreaEl.oninput = (e) => {
			this.setValue(e.currentTarget.value,'textarea')
			console.log("textArea change!")
		}
		this.mathFieldEl.onkeydown = (e) => {
			if(e.key === 'Tab'){
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
			console.log("mathfield change!")
		}

		this.element.appendChild(this.textAreaEl)
		this.element.appendChild(this.mathFieldEl)
	}

	select() {
		this.textAreaEl.focus()
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
