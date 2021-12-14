import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Event } from '../model/event.model';
import { EventService } from '../services/event.service';

@Component({
	selector: 'app-create-event',
	templateUrl: './create-event.component.html',
	styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

	loading = false;

	createEventForm = new FormGroup({
		banner: new FormControl('', Validators.required),
		name: new FormControl('', [Validators.required, Validators.minLength(5)]),
		description: new FormControl('', [Validators.required, Validators.minLength(5)]),
		start: new FormControl(new Date().toISOString().slice(0, -8), Validators.required),
		active: new FormControl(true, Validators.required),
		lineUp: new FormArray([new FormControl('', Validators.required)], Validators.required)
	});

	constructor(
		private titleService: Title,
		private router: Router,
		private eventService: EventService
	) { }

	ngOnInit(): void {
		this.titleService.setTitle('Leet - Criar evento');
	}

	getField(name: string) {
		return this.createEventForm.get(name)!;
	}

	get lineUp() {
		return this.createEventForm.get('lineUp') as FormArray;
	}

	onSubmit() {
		this.createEventForm.markAllAsTouched();
		if (this.createEventForm.invalid) return;
		this.loading = true;
		const event: Event = this.createEventForm.value;

		// update date start to Timestamp
		const dateValue = new Date(this.createEventForm.get('start')?.value);
		event.start = Timestamp.fromDate(dateValue);

		this.eventService.createEvent(event)
			.then(eventId => this.router.navigate(['/dashboard/event/' + eventId]))
			.catch(error => console.error(error))
			.finally(() => this.loading = false);
	}

	addDj() {
		this.lineUp.push(new FormControl('', Validators.required));
		this.focusLastDjElement();
	}

	deleteDj(djIndex: number) {
		this.lineUp.removeAt(djIndex);
		this.focusLastDjElement();
	}

	focusLastDjElement() {
		setTimeout(() => {
			let lastElement!: HTMLElement;
			document.getElementsByName('djName').forEach(element => {
				lastElement = element;
			});
			lastElement.focus();
		}, 0);
	}

	bannerChange(event: any) {
		this.createEventForm.get('banner')?.setValue(event.target.files[0]);
	}

}
