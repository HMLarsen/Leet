import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-create-event',
	templateUrl: './create-event.component.html',
	styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

	createEventForm = new FormGroup({
		name: new FormControl('', [Validators.required, Validators.minLength(5)]),
		description: new FormControl('', [Validators.required, Validators.minLength(5)]),
		date: new FormControl({ value: new Date()}, Validators.required)
	});

	constructor() { }

	ngOnInit(): void {
	}

	onSubmit() {
		console.warn(this.createEventForm.value);
	}

}
