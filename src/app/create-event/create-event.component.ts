import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-create-event',
	templateUrl: './create-event.component.html',
	styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

	createEventForm = new FormGroup({
		name: new FormControl('', [Validators.required, Validators.minLength(5)]),
		description: new FormControl('', [Validators.required, Validators.minLength(5)]),
		date: new FormControl(new Date().toISOString().slice(0, -8), Validators.required),
		active: new FormControl(true, Validators.required),
		lineUp: new FormArray([], Validators.required)
	});

	constructor() { }

	ngOnInit(): void { }

	onSubmit() {
		console.warn(this.createEventForm.value);
	}

	get lineUp() {
		return this.createEventForm.get('lineUp') as FormArray;
	}

	addDj() {
		this.lineUp.push(new FormControl('', Validators.required));
	}

	deleteDj(djIndex: number) {
		this.lineUp.removeAt(djIndex);
	}

}
