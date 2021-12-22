import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventForShow } from 'src/app/model/event.model';
import { Person } from 'src/app/model/person.model';
import { EventService } from 'src/app/services/event.service';

@Component({
	selector: 'app-event-public',
	templateUrl: './event-public.component.html',
	styleUrls: ['./event-public.component.scss'],
	animations: [
		trigger('fadeInOut', [
			transition(':enter', [
				style({ opacity: 0 }),
				animate(500, style({ opacity: 1 }))
			])
		])
	]
})
export class EventPublicComponent implements OnInit, OnDestroy {

	eventId: string;
	eventUserEmail: string;
	event: EventForShow;
	eventSubscription: Subscription;
	loadingEvent = true;
	inviteForm: FormGroup;
	loadingSubmit: boolean;
	nameConfirmed: boolean;
	showModalEmitter = new EventEmitter<string>();
	eventDescriptionHtml: SafeHtml;

	constructor(
		private sanitizer: DomSanitizer,
		private route: ActivatedRoute,
		private eventService: EventService,
		private titleService: Title
	) { }

	ngOnInit(): void {
		this.inviteForm = new FormGroup({
			personName: new FormControl('', [Validators.required, this.noWhitespaceValidator])
		});
		this.getEvent();
	}

	ngOnDestroy(): void {
		if (this.eventSubscription) this.eventSubscription.unsubscribe();
	}

	noWhitespaceValidator(control: FormControl) {
		const isWhitespace = (control.value || '').trim().length === 0;
		const isValid = !isWhitespace && (control.value || '').trim().length >= 5;
		return isValid ? null : { 'whitespace': true };
	}

	getEvent() {
		const params = atob(this.route.snapshot.paramMap.get('params')!).split('|');
		this.eventId = params[0];
		this.eventUserEmail = params[1];
		this.eventService.getEvent(this.eventId, this.eventUserEmail)
			.then(observable => {
				this.eventSubscription = observable.subscribe({
					next: value => {
						// control to continue showing the banner if the event had changes
						const bannerUrl = this.event?.bannerUrl;
						this.event = value.payload.data()!;
						if (this.event) {
							this.event.bannerUrl = bannerUrl;
							this.eventDescriptionHtml = this.sanitizer.bypassSecurityTrustHtml(this.event.description);
							if (!bannerUrl) this.setEventBanner();
							this.titleService.setTitle(this.event.name);
						} else {
							this.loadingEvent = false;
						}
					},
					error: error => this.loadingEvent = false
				});
			});
	}

	setEventBanner() {
		this.eventService.getEventBanner(this.eventId!, this.eventUserEmail)
			.then(downloadUrl => this.event.bannerUrl = downloadUrl)
			.finally(() => this.loadingEvent = false);
	}

	onSubmit() {
		this.loadingSubmit = true;
		const personName = this.inviteForm.get('personName')?.value.trim();
		const person: Person = {
			name: personName,
			fillDate: Timestamp.now()
		};
		this.eventService.addPerson(this.eventId, person, this.eventUserEmail)
			.then(() => {
				this.nameConfirmed = true;
				this.inviteForm.reset();
			})
			.catch(() => this.showModalEmitter.emit())
			.finally(() => this.loadingSubmit = false);
	}

}
