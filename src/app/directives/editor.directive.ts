import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

declare var Quill: any;

@Directive({
	selector: '[appEditor]'
})
export class EditorDirective implements OnInit {

	@Input() data = undefined;
	@Output() editorChange = new EventEmitter<string>();
	@Output() editorReady = new EventEmitter<string>();

	constructor(private el: ElementRef) { }

	ngOnInit(): void {
		const quill = new Quill(this.el.nativeElement, {
			modules: {
				toolbar: [
					[
						{ 'font': [] },
						{ 'size': ['small', false, 'large', 'huge'] },
						{ 'header': [1, 2, 3, 4, 5, 6, false] }
					],

					['bold', 'italic', 'underline', 'strike', 'link', { 'script': 'sub' }, { 'script': 'super' }],
					['blockquote', 'code', 'code-block'],
					[{ 'align': [] }],

					[{ 'list': 'ordered' }, { 'list': 'bullet' }],
					[{ 'indent': '-1' }, { 'indent': '+1' }],

					[{ 'color': [] }, { 'background': [] }],

					['clean']
				]
			},
			theme: 'snow'
		});

		// set saved data
		if (this.data) quill.root.innerHTML = this.data;

		// register changes
		if (this.editorChange) {
			quill.on('text-change', () => {
				let dataToEmit = quill.root.innerHTML;
				// if no text in editor
				if (quill.getLength() === 1) {
					dataToEmit = undefined;
				}
				this.editorChange.emit(dataToEmit);
			});
		}

		// send editor to parent
		if (this.editorReady) this.editorReady.emit(quill);
	}

}
