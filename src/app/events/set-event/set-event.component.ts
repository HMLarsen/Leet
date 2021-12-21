import { Component, EventEmitter, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService } from 'src/app/services/error.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Event } from '../../model/event.model';
import { EventService } from '../../services/event.service';

@Component({
	selector: 'app-set-event',
	templateUrl: './set-event.component.html',
	styleUrls: ['./set-event.component.scss']
})
export class SetEventComponent implements OnInit {

	eventForm: FormGroup;
	editing = false;
	editingEventId: string;
	editingEvent: Event;
	loadingEvent = true;
	loading = false;
	editor: any;
	submitFormErrorMessage: string;
	showModalEmitter = new EventEmitter<string>();

	constructor(
		private route: ActivatedRoute,
		private titleService: Title,
		private router: Router,
		private eventService: EventService,
		private utilsService: UtilsService,
		private errorService: ErrorService
	) { }

	ngOnInit(): void {
		this.titleService.setTitle('Leet - Criar evento');

		this.eventForm = new FormGroup({
			bannerFile: new FormControl('', Validators.required),
			name: new FormControl('', [Validators.required, Validators.minLength(5)]),
			date: new FormControl(this.utilsService.toLocaleISOString(new Date()).slice(0, -8), Validators.required),
			description: new FormControl('', Validators.required),
			acceptingParticipations: new FormControl(true, Validators.required)
		});

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
						this.eventForm.get('bannerFile')?.clearValidators();
						this.eventForm.get('name')?.setValue(event.name);
						this.eventForm.get('description')?.setValue(event.description);
						this.eventForm.get('date')?.setValue(this.utilsService.toLocaleISOString(event.date?.toDate()).slice(0, -8));
						this.eventForm.get('acceptingParticipations')?.setValue(event.acceptingParticipations);
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

	bannerFileChange(event: any) {
		const file: File = event.target.files[0];
		const bannerFileControl = this.eventForm.get('bannerFile');
		if (file) {
			// validate type
			const imagePattern = /image-*/;
			if (!file.type.match(imagePattern)) {
				invalidateFile();
				return;
			}
			// validate size
			const maximumSize = 3 * 1024 * 1024; // 3MB
			if (file.size > maximumSize) {
				invalidateFile();
				return;
			}
			function invalidateFile() {
				event.target.value = '';
				bannerFileControl?.setValue(undefined);
				bannerFileControl?.markAsTouched();
			}
		}
		bannerFileControl?.setValue(file);
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

		// disable form
		this.loading = true;
		this.editor.disable();

		// prepare event
		const event: Event = this.eventForm.value;
		event.id = this.editing ? this.editingEventId : event.id;
		// update date start to Timestamp
		const dateValue = new Date(this.eventForm.get('date')?.value);
		event.date = Timestamp.fromDate(dateValue);

		// save event
		this.eventService.setEvent(event)
			.then(event => this.router.navigate(['/dashboard/events/' + event.id]))
			.catch(error => {
				this.loading = false;
				this.editor.enable();
				this.submitFormErrorMessage = this.errorService.translateError(error);
				this.showModalEmitter.emit();
			});
	}

}
