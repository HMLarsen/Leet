import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

declare var ClassicEditor: any;

@Directive({
	selector: '[appEditor]'
})
export class EditorDirective implements OnInit {

	@Output() change = new EventEmitter<any>();

	constructor(private el: ElementRef) { }

	ngOnInit(): void {
		ClassicEditor.create(this.el.nativeElement)
			.then((editor: any) => {
				editor.model.document.on('change:data', () => {
					this.change.emit(editor.getData())
				});
			});
	}

}
