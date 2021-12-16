import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { Event } from '../../model/event.model';
import { EventService } from '../../services/event.service';

@Component({
	selector: 'app-set-event',
	templateUrl: './set-event.component.html',
	styleUrls: ['./set-event.component.scss']
})
export class SetEventComponent implements OnInit {

	editing = false;
	editingEventId: string;
	editingEvent: Event;
	loadingEvent = true;
	loading = false;
	editor: any;

	eventForm = new FormGroup({
		banner: new FormControl('', Validators.required),
		name: new FormControl('', [Validators.required, Validators.minLength(5)]),
		date: new FormControl(new Date().toISOString().slice(0, -8), Validators.required),
		description: new FormControl('', Validators.required),
		active: new FormControl(true, Validators.required)
	});

	constructor(
		private route: ActivatedRoute,
		private titleService: Title,
		private router: Router,
		private eventService: EventService,
		private utilsService: UtilsService
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
						this.eventForm.get('date')?.setValue(this.utilsService.toLocaleISOString(event.date?.toDate()).slice(0, -8));
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

	bannerChange(event: any) {
		this.eventForm.get('banner')?.setValue(event.target.files[0]);
	}

	editorChange(data: string) {
		this.eventForm.get('description')?.setValue(data);
	}

	editorReady(editor: any) {
		this.editor = editor;
	}

	onSubmit() {
		this.eventForm.markAllAsTouched();
		if (this.eventForm.invalid) return;
		this.loading = true;
		this.editor.isReadOnly = true;
		const event: Event = this.eventForm.value;
		event.id = this.editing ? this.editingEventId : event.id;

		// update date start to Timestamp
		const dateValue = new Date(this.eventForm.get('date')?.value);
		event.date = Timestamp.fromDate(dateValue);

		const promise = this.editing ? this.eventService.updateEvent(event) : this.eventService.createEvent(event);
		promise
			.then(event => this.router.navigate(['/dashboard/events/' + event.id]))
			.catch(error => console.error(error));
	}

}
