import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../../model/event.model';
import { EventService } from '../../services/event.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

	eventId: string;
	event: Event;
	downloadLogoURL: string;
	loadingEvent = true;
	eventUrlCopied = false;
	eventDescriptionHtml: SafeHtml;

	constructor(
		private sanitizer: DomSanitizer,
		private route: ActivatedRoute,
		private router: Router,
		private eventService: EventService,
		private titleService: Title,
		private utilsService: UtilsService
	) { }

	ngOnInit(): void {
		this.getEvent();
	}

	getEvent() {
		this.eventId = this.route.snapshot.paramMap.get('id')!;
		this.eventService.getEvent(this.eventId!).then(observable => {
			const obsRef = observable.subscribe({
				next: value => {
					this.event = value.payload.data()!;
					if (this.event) {
						this.eventDescriptionHtml = this.sanitizer.bypassSecurityTrustHtml(this.event.description);
						this.getEventBanner();
						this.titleService.setTitle('Leet - ' + this.event.name);
					} else {
						this.loadingEvent = false
					}
					obsRef.unsubscribe();
				},
				error: () => {
					this.loadingEvent = false;
					obsRef.unsubscribe();
				}
			});
		});
	}

	getEventBanner() {
		this.eventService.getEventBanner(this.eventId!).then(observable => {
			const obsRef = observable.subscribe({
				next: value => {
					this.downloadLogoURL = value;
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

		this.eventUrlCopied = true;
		setTimeout(() => this.eventUrlCopied = false, 2000);
	}

}
