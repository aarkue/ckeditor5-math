import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat"
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

import Math from "../src/math";
import MathAutoFormat from "../src/autoformatmath";
ClassicEditor.create(document.querySelector("#editor"), {
	plugins: [Essentials, Paragraph, Bold, Italic, Math, Autoformat, MathAutoFormat],
	toolbar: ["bold", "italic", "math"],
	math: {
		engine: "katex",
		katexRenderOptions: {
			macros: {
				"\\test": "\\mathrel{\\char`≠}",
			},
		},
	},
})
	.then((editor) => {
		console.log("Editor was initialized", editor);
		CKEditorInspector.attach(editor);
	})
	.catch((error) => {
		console.error(error);
		console.error(error.stack);
	});
