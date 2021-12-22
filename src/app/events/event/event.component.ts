import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EventForShow } from '../../model/event.model';
import { EventService } from '../../services/event.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ErrorService } from 'src/app/services/error.service';
import { Subscription } from 'rxjs';
import { fadeInOut } from 'src/app/animations';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss'],
	animations: [fadeInOut]
})
export class EventComponent implements OnInit, OnDestroy {

	eventId: string;
	event: EventForShow;
	eventSubscription: Subscription;
	loadingEvent = true;
	eventUrlCopied = false;
	eventDescriptionHtml: SafeHtml;

	showModalEmitter = new EventEmitter();
	closeModalEmitter = new EventEmitter();
	loadingDeleteEvent = false;
	showErrorModalEmitter = new EventEmitter();
	deleteEventErrorMessage: string;

	constructor(
		private sanitizer: DomSanitizer,
		private route: ActivatedRoute,
		private router: Router,
		private eventService: EventService,
		private titleService: Title,
		private utilsService: UtilsService,
		private changeDetectorRef: ChangeDetectorRef,
		private errorService: ErrorService
	) { }

	ngOnInit(): void {
		this.getEvent();
	}

	ngOnDestroy(): void {
		if (this.eventSubscription) this.eventSubscription.unsubscribe();
	}

	getEvent() {
		this.eventId = this.route.snapshot.paramMap.get('id')!;
		this.eventService.getEvent(this.eventId!).then(observable => {
			this.eventSubscription = observable.subscribe({
				next: value => {
					// control to continue showing the banner if the event had changes
					const bannerUrl = this.event?.bannerUrl;
					this.event = value.payload.data()!;
					if (this.event) {
						this.event.bannerUrl = bannerUrl;
						this.eventDescriptionHtml = this.sanitizer.bypassSecurityTrustHtml(this.event.description);
						if (!bannerUrl) this.setEventBanner();
						this.titleService.setTitle('Leet - ' + this.event.name);
					} else {
						this.loadingEvent = false;
					}
				},
				error: () => this.loadingEvent = false
			});
		});
	}

	setEventBanner() {
		this.eventService.getEventBanner(this.eventId!)
			.then(downloadUrl => this.event.bannerUrl = downloadUrl)
			.finally(() => this.loadingEvent = false);
	}

	deleteEvent() {
		this.showModalEmitter.emit();
	}

	confirmDeleteEvent() {
		this.loadingDeleteEvent = true;
		this.eventService.deleteEvent(this.eventId)
			.then(() => {
				this.loadingDeleteEvent = false;
				this.changeDetectorRef.detectChanges();
				this.closeModalEmitter.emit();
				this.router.navigate(['/dashboard/events']);
			})
			.catch(error => {
				this.loadingDeleteEvent = false;
				this.deleteEventErrorMessage = this.errorService.translateError(error);
				this.changeDetectorRef.detectChanges();
				this.closeModalEmitter.emit();
				this.showErrorModalEmitter.emit();
			});
	}

	async openEvent() {
		const urlParams = await this.eventService.getEventPublicUrlParams(this.eventId);
		window.open('events/' + urlParams, '_blank');
	}

	async copyEventUrl() {
		const urlParams = await this.eventService.getEventPublicUrlParams(this.eventId);
		const currentRoute = this.router.url;
		const newRoute = this.router.createUrlTree(['events', urlParams]).toString();
		const url = window.location.href.replace(currentRoute, newRoute);

		// copy
		this.utilsService.copyTextToClipboard(url);

		// screen change
		this.eventUrlCopied = true;
		setTimeout(() => this.eventUrlCopied = false, 2000);
	}

}
