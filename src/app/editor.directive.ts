import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

declare var ClassicEditor: any;

@Directive({
	selector: '[appEditor]'
})
export class EditorDirective implements OnInit {

	@Input() data = undefined;
	@Output() editorChange = new EventEmitter<string>();
	@Output() editorReady = new EventEmitter<string>();

	constructor(private el: ElementRef) { }

	ngOnInit(): void {
		const config = {
			toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
		};
		ClassicEditor.create(this.el.nativeElement, config)
			.then((editor: any) => {
				if (this.data) editor.setData(this.data);

				if (this.editorReady) this.editorReady.emit(editor);

				if (this.editorChange) {
					editor.model.document.on('change:data', () => {
						this.editorChange.emit(editor.getData());
					});
				}
			});
	}

}
