import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { fadeInOut } from 'src/app/animations';
import { EventForShow } from 'src/app/model/event.model';
import { SEOService } from 'src/app/seo.service';
import { EventService } from 'src/app/services/event.service';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

@Component({
	selector: 'app-event-public',
	templateUrl: './event-public.component.html',
	styleUrls: ['./event-public.component.scss'],
	animations: [fadeInOut]
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
		private seoService: SEOService,
		private googleAnalyticsService: GoogleAnalyticsService
	) { }

	ngOnInit(): void {
		this.inviteForm = new FormGroup({
			participantName: new FormControl('', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(100)])
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
						this.event = value!;
						if (this.event) {
							this.event.bannerUrl = bannerUrl;
							this.eventDescriptionHtml = this.sanitizer.bypassSecurityTrustHtml(this.event.description);
							if (!bannerUrl) this.setEventBanner();
							this.seoService.updateTitle(this.event.name, false);
							this.seoService.updateDescription(this.event.description);
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
			.then(downloadUrl => {
				this.event.bannerUrl = downloadUrl;
				this.seoService.updateImage(downloadUrl);
			})
			.finally(() => this.loadingEvent = false);
	}

	onSubmit() {
		this.loadingSubmit = true;
		const participantName = this.inviteForm.get('participantName')?.value.trim();
		this.eventService.addParticipant(this.eventId, participantName, this.eventUserEmail)
			.then(() => {
				this.googleAnalyticsService.addPublicParticipantEvent();
				this.nameConfirmed = true;
				this.inviteForm.reset();
			})
			.catch(() => this.showModalEmitter.emit())
			.finally(() => this.loadingSubmit = false);
	}

}
