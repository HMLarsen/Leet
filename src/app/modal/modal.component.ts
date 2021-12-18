import { Component, EventEmitter, Input, OnInit } from '@angular/core';

declare var bootstrap: any;

@Component({
	selector: 'app-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

	@Input() modalType: string;
	@Input() errorMessage: string;
	@Input() showModalEmitter: EventEmitter<string>;

	constructor() { }

	ngOnInit(): void {
		this.showModalEmitter.subscribe(() => this.showModal());
	}

	showModal() {
		new bootstrap.Modal(document.getElementById(this.modalType)).show();
	}

}
