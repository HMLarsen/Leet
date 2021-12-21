import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

declare var bootstrap: any;

@Component({
	selector: 'app-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

	@Input() modalType: string;
	@Input() title: string;
	@Input() detailMessage: string;
	@Input() errorMessage: string;
	@Input() showModalEmitter: EventEmitter<any>;
	@Input() showErrorModalEmitter: EventEmitter<any>;
	@Input() closeModalEmitter: EventEmitter<any>;
	@Input() loading = false;
	@Output() confirm = new EventEmitter();

	private element: any;
	private modal: any;

	constructor() { }

	ngOnInit(): void {
		this.showModalEmitter.subscribe(() => this.showModal());
		if (this.closeModalEmitter) this.closeModalEmitter.subscribe(() => this.closeModal());
		if (this.showErrorModalEmitter) this.showErrorModalEmitter.subscribe(() => this.showErrorModal());
	}

	showModal() {
		this.element = document.getElementById(this.modalType);
		// cancel modal close event if loading
		this.element?.addEventListener('hide.bs.modal', (event: any) => {
			if (this.loading) {
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}
			return true;
		});
		this.modal = new bootstrap.Modal(this.element);
		this.modal.show();
	}

	closeModal() {
		this.modal.hide();
	}

	confirmModal() {
		this.confirm.emit();
	}

	showErrorModal() {
		const element = document.getElementById('error');
		new bootstrap.Modal(element).show();
	}

}
