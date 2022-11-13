import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';

import { extractDelimiters, hasDelimiters } from '../utils';

import MathView from './mathview';

import '../../theme/mathform.css';
import MathInputView from './mathinputview';

export default class MainFormView extends View {
	constructor( locale, engine, lazyLoad, previewEnabled, previewUid, previewClassName, popupClassName, katexRenderOptions ) {
		super( locale );

		const t = locale.t;

		// Create key event & focus trackers
		this._createKeyAndFocusTrackers();

		// Submit button
		this.saveButtonView = this._createButton( t( 'Save (Ctrl+Enter)' ), checkIcon, 'ck-button-save', null );
		this.saveButtonView.type = 'submit';

		// Equation input
		this.mathInputView = this._createMathInput(katexRenderOptions);

		// Display button
		this.displayButtonView = this._createDisplayButton();

		// Cancel button
		this.cancelButtonView = this._createButton( t( 'Cancel (Esc)' ), cancelIcon, 'ck-button-cancel', 'cancel' );

		this.previewEnabled = previewEnabled;

		let children = [];
		if ( this.previewEnabled ) {
			// Preview label
			this.previewLabel = new LabelView( locale );
			this.previewLabel.text = t( 'Equation preview' );

			// Math element
			this.mathView = new MathView( engine, lazyLoad, locale, previewUid, previewClassName, katexRenderOptions );
			this.mathView.bind( 'display' ).to( this.displayButtonView, 'isOn' );

			children = [
				this.mathInputView,
				this.displayButtonView,
				this.previewLabel,
				this.mathView,
			];
		} else {
			children = [
				this.mathInputView,
				this.displayButtonView
			];
		}

		// Add UI elements to template
		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-math-form',
					...popupClassName
				],
				style: "padding: 5px;",
				tabindex: '-1',
				spellcheck: 'false'
			},
			children: [
				{
					tag: 'div',
					attributes: {
						class: [
							'ck-math-view',
							'ck-reset_all-excluded'
						]
					},
					children,
				},
				{
					tag: 'div',
					attributes: {
						class: ['ck-math-buttons']
					},
					children: [
				this.saveButtonView,
				this.cancelButtonView,
					]
				}
			]
		} );
	}

	render() {
		super.render();

		// Prevent default form submit event & trigger custom 'submit'
		submitHandler( {
			view: this
		} );

		// Register form elements to focusable elements
		const childViews = [
			this.mathInputView,
			this.displayButtonView,
			this.saveButtonView,
			this.cancelButtonView
		];

		childViews.forEach( v => {
			this._focusables.add( v );
			this.focusTracker.add( v.element );
		} );

		// Listen to keypresses inside form element
		this.keystrokes.listenTo( this.element );
	}

	focus() {
		this._focusCycler.focusFirst();
	}

	get equation() {
		return this.mathInputView.getValue();
	}

	set equation( equation ) {
		this.mathInputView.setValue(equation);
		if ( this.previewEnabled ) {
			this.mathView.value = equation;
		}
	}

	_createKeyAndFocusTrackers() {
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this._focusables = new ViewCollection();

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
		} );
	}

	_createMathInput(katexRenderOptions) {
		const mathAreaInput = new MathInputView(this.locale,katexRenderOptions)

		const onInput = () => {
			console.log("onInput")
			if ( mathAreaInput.element != null ) {
				let equationInput = mathAreaInput.getValue().trim();

				// If input has delimiters
				if ( hasDelimiters( equationInput ) ) {
					// Get equation without delimiters
					const params = extractDelimiters( equationInput );

					// Remove delimiters from input field
					mathAreaInput.setValue(params.equation);

					equationInput = params.equation;

					// update display button and preview
					this.displayButtonView.isOn = params.display;
				}
				if ( this.previewEnabled ) {
					// Update preview view
					this.mathView.value = equationInput;
					setTimeout(() => {
						this.mathView.updateMath(equationInput)
					},1)
				}

				this.saveButtonView.isEnabled = !!equationInput;
			}
		};

		// mathAreaInput.on( 'render', onInput );
		mathAreaInput.on( 'input', onInput );

		return mathAreaInput;
	}

	_createButton( label, icon, className, eventName ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}

	_createDisplayButton() {
		const t = this.locale.t;

		const switchButton = new SwitchButtonView( this.locale );

		switchButton.set( {
			label: t( 'Display mode' ),
			withText: true,
		} );
		switchButton.extendTemplate( {
			attributes: {
				class: 'ck-button-display-toggle',
				style: 'padding-left: 0; padding-bottom: 5px;'
			}
		} );

		switchButton.on( 'execute', () => {
			// Toggle state
			switchButton.isOn = !switchButton.isOn;

			if ( this.previewEnabled ) {
				// Update preview view
				this.mathView.display = switchButton.isOn;
			}
		} );

		return switchButton;
	}
}
