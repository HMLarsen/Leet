import { Component, EventEmitter, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { fadeInOut } from 'src/app/animations';
import { SEOService } from 'src/app/seo.service';
import { ErrorService } from 'src/app/services/error.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Event } from '../../model/event.model';
import { EventService } from '../../services/event.service';

@Component({
	selector: 'app-set-event',
	templateUrl: './set-event.component.html',
	styleUrls: ['./set-event.component.scss'],
	animations: [fadeInOut]
})
export class SetEventComponent implements OnInit {

	eventForm: FormGroup;
	loadingFormSubmit = false;
	editor: any;
	submitFormErrorMessage: string;
	showModalEmitter = new EventEmitter<string>();

	// edit
	editing = false;
	editingEventId: string;
	editingEvent: Event;
	loadingEventForEdit = false;
	editingEventNotFound = false;

	constructor(
		private route: ActivatedRoute,
		private seoService: SEOService,
		private router: Router,
		private eventService: EventService,
		private utilsService: UtilsService,
		private errorService: ErrorService
	) { }

	ngOnInit(): void {
		this.eventForm = new FormGroup({
			createdAt: new FormControl(''),
			bannerFile: new FormControl('', Validators.required),
			name: new FormControl('', [Validators.required, Validators.minLength(5)]),
			date: new FormControl(this.utilsService.toLocaleISOString(new Date()).slice(0, -8), Validators.required),
			description: new FormControl('', Validators.required),
			acceptingParticipants: new FormControl(true, Validators.required)
		});

		// editing?
		this.editingEventId = this.route.snapshot.paramMap.get('id')!;
		this.editing = this.router.url.includes('/edit') && !!this.editingEventId;

		if (this.editing) {
			this.getEventForEdit();
		} else {
			this.seoService.updateTitle('Criar evento');
			this.loadingEventForEdit = false;
		}
	}

	async getEventForEdit() {
		this.loadingEventForEdit = true;
		const event = (await firstValueFrom(await this.eventService.getEvent(this.editingEventId)));
		if (event) {
			this.editingEvent = event;
			this.eventForm.get('createdAt')?.setValue(event.createdAt);
			this.eventForm.get('bannerFile')?.clearValidators();
			this.eventForm.get('name')?.setValue(event.name);
			this.eventForm.get('description')?.setValue(event.description);
			this.eventForm.get('date')?.setValue(this.utilsService.toLocaleISOString(event.date?.toDate()).slice(0, -8));
			this.eventForm.get('acceptingParticipants')?.setValue(event.acceptingParticipants);
			this.seoService.updateTitle('Editar ' + event.name);
		} else {
			this.editingEventNotFound = true;
		}
		this.loadingEventForEdit = false;
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
			const maxSize = 3 * 1024 * 1024; // 3MB
			if (file.size > maxSize) {
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

	onSubmitForm() {
		this.eventForm.markAllAsTouched();
		if (this.eventForm.invalid) return;

		// disable form
		this.loadingFormSubmit = true;
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
				this.loadingFormSubmit = false;
				this.editor.enable();
				this.submitFormErrorMessage = this.errorService.translateError(error);
				this.showModalEmitter.emit();
			});
	}

}
