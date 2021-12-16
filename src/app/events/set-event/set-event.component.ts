import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../../model/event.model';
import { EventService } from '../../services/event.service';

@Component({
	selector: 'app-set-event',
	templateUrl: './set-event.component.html',
	styleUrls: ['./set-event.component.scss']
})
export class SetEventComponent implements OnInit {

	editing = false;
	editingEventId!: string;
	editingEvent!: Event;
	loadingEvent = true;
	loading = false;

	eventForm = new FormGroup({
		banner: new FormControl('', Validators.required),
		name: new FormControl('', [Validators.required, Validators.minLength(5)]),
		description: new FormControl('', [Validators.required, Validators.minLength(5)]),
		start: new FormControl(new Date().toISOString().slice(0, -8), Validators.required),
		lineUp: new FormArray([], Validators.required),
		active: new FormControl(true, Validators.required)
	});

	constructor(
		private route: ActivatedRoute,
		private titleService: Title,
		private router: Router,
		private eventService: EventService
	) { }

	ngOnInit(): void {
		this.titleService.setTitle('Leet - Criar evento');

		// editing?
		this.editingEventId = this.route.snapshot.paramMap.get('id')!;
		this.editing = this.router.url.includes('/edit') && !!this.editingEventId;

		if (this.editing) {
			this.getEvent();
		} else {
			this.loadingEvent = false;
			this.addDj('', false);
		}
	}

	getEvent() {
		this.loadingEvent = true;
		this.eventService.getEvent(this.editingEventId).then(observable => {
			const obsRef = observable.subscribe({
				next: value => {
					const event = value.payload.data();
					if (event) {
						this.editingEvent = event;
						this.titleService.setTitle('Leet - Editar ' + event.name);
						this.eventForm.get('banner')?.clearValidators();
						this.eventForm.get('name')?.setValue(event.name);
						this.eventForm.get('description')?.setValue(event.description);
						this.eventForm.get('start')?.setValue(event.start?.toDate().toISOString().slice(0, -8));
						event.lineUp?.forEach(dj => this.addDj(dj, false));
						this.eventForm.get('active')?.setValue(event.active);
					}
					this.loadingEvent = false;
					obsRef.unsubscribe();
				},
				error: () => {
					this.loadingEvent = false;
					obsRef.unsubscribe();
				}
			});
		});
	}

	getField(name: string) {
		return this.eventForm.get(name)!;
	}

	get lineUp() {
		return this.eventForm.get('lineUp') as FormArray;
	}

	onSubmit() {
		this.eventForm.markAllAsTouched();
		if (this.eventForm.invalid) return;
		this.loading = true;
		const event: Event = this.eventForm.value;
		event.id = this.editing ? this.editingEventId : event.id;

		// update date start to Timestamp
		const dateValue = new Date(this.eventForm.get('start')?.value);
		event.start = Timestamp.fromDate(dateValue);

		const promise = this.editing ? this.eventService.updateEvent(event) : this.eventService.createEvent(event);
		promise
			.then(event => this.router.navigate(['/dashboard/events/' + event.id]))
			.catch(error => console.error(error))
			.finally(() => this.loading = false);
	}

	addDj(value = '', focus = true) {
		this.lineUp.push(new FormControl(value, Validators.required));
		if (focus) this.focusLastDjElement();
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
		this.eventForm.get('banner')?.setValue(event.target.files[0]);
	}

	editorChange(data: string) {
		this.eventForm.get('description')?.setValue(data);
	}

}
