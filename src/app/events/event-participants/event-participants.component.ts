import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { Event } from 'src/app/model/event.model';
import { Participant } from 'src/app/model/participant.model';
import { EventService } from 'src/app/services/event.service';
import { UtilsService } from 'src/app/services/utils.service';
import { firstValueFrom } from 'rxjs';
import { ErrorService } from 'src/app/services/error.service';
import { fadeInOut, inOutAnimation } from 'src/app/animations';

@Component({
	selector: 'app-event-participants',
	templateUrl: './event-participants.component.html',
	styleUrls: ['./event-participants.component.scss'],
	animations: [fadeInOut, inOutAnimation]
})
export class EventParticipantsComponent implements OnInit, OnDestroy {

	eventId: string;
	event: Event;
	eventSubscription: Subscription;
	loadingEvent = true;
	importNamesForm: FormGroup;
	loadingForm = false;
	errorMessage: string;
	showModalConfirmEmitter = new EventEmitter<string>();
	showErrorModalEmitter = new EventEmitter<string>();
	closeModalEmitter = new EventEmitter();

	participants: Observable<Participant[]>;
	emptyParticipants = false;
	participantsNameCopied = false;
	loadingDeleteParticipants = false;

	constructor(
		private route: ActivatedRoute,
		private eventService: EventService,
		private utilsService: UtilsService,
		private titleService: Title,
		private errorService: ErrorService,
		private changeDetectorRef: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.eventId = this.route.snapshot.paramMap.get('id')!;
		this.importNamesForm = new FormGroup({
			names: new FormControl('', Validators.required)
		});
		this.getEvent();
	}

	ngOnDestroy(): void {
		if (this.eventSubscription) this.eventSubscription.unsubscribe();
	}

	async getEvent() {
		const observable = await this.eventService.getEvent(this.eventId)
		this.eventSubscription = observable.subscribe({
			next: value => {
				this.event = value!;
				if (this.event) {
					this.titleService.setTitle('Leet - ' + this.event.name);
					this.getParticipants();
				}
				this.loadingEvent = false;
			},
			error: () => this.loadingEvent = false
		});
	}

	async getParticipants() {
		const observable = await this.eventService.getParticipants(this.eventId)
		this.participants = observable.pipe(
			map(participants => {
				this.emptyParticipants = participants.length === 0;
				// capitalize and sort
				participants.map(participant => participant.name = this.utilsService.capitalize(participant.name));
				return participants.sort((a, b) => (a.name > b.name) ? 1 : -1);
			})
		);
	}

	async onSubmitImportNamesForm() {
		this.loadingForm = true;
		try {
			const names = this.importNamesForm.get('names')?.value.split('\n');
			await this.eventService.addParticipants(this.eventId, names);
			this.importNamesForm.reset();
		} catch (e) {
			this.errorMessage = this.errorService.translateError(e);
			this.showErrorModalEmitter.emit();
		} finally {
			this.loadingForm = false;
		}
	}

	async copyList() {
		const participantName = (await firstValueFrom(this.participants)).map(participant => participant.name);
		this.utilsService.copyTextToClipboard(participantName.join('\n'));
		this.participantsNameCopied = true;
		setTimeout(() => this.participantsNameCopied = false, 2000);
	}

	participantListTrackBy(index: number, item: Participant) {
		return item.id;
	}

	deleteParticipants() {
		this.showModalConfirmEmitter.emit();
	}

	confirmDeleteParticipants() {
		this.loadingDeleteParticipants = true;
		this.eventService.deleteParticipants(this.eventId)
			.then(() => {
				this.loadingDeleteParticipants = false;
				this.changeDetectorRef.detectChanges();
				this.closeModalEmitter.emit();
			})
			.catch(error => {
				this.loadingDeleteParticipants = false;
				this.errorMessage = this.errorService.translateError(error);
				this.changeDetectorRef.detectChanges();
				this.closeModalEmitter.emit();
				this.showErrorModalEmitter.emit();
			});
	}

}
