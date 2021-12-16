import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Event } from 'src/app/model/event.model';
import { EventService } from 'src/app/services/event.service';

@Component({
	selector: 'app-event-public',
	templateUrl: './event-public.component.html',
	styleUrls: ['./event-public.component.scss']
})
export class EventPublicComponent implements OnInit {

	eventId: string;
	event: Event;
	downloadLogoURL: string;
	loadingEvent = true;

	constructor(
		private route: ActivatedRoute,
		private eventService: EventService,
		private titleService: Title
	) { }

	ngOnInit(): void {
		this.getEvent();
	}

	getEvent() {
		const params = atob(this.route.snapshot.paramMap.get('params')!).split('|');
		this.eventId = params[0];
		const userEmail = params[1];
		this.eventService.getEvent(this.eventId, userEmail).then(observable => {
			observable.subscribe({
				next: value => {
					this.event = value.payload.data()!;
					if (this.event) {
						this.getEventBanner(userEmail);
						this.titleService.setTitle(this.event.name);
					} else {
						this.loadingEvent = false
					}
				},
				error: error => {
					console.error(error);
					this.loadingEvent = false;
				}
			});
		});
	}

	getEventBanner(userEmail: string) {
		this.eventService.getEventBanner(this.eventId!, userEmail).then(observable => {
			observable.subscribe({
				next: value => {
					this.downloadLogoURL = value;
					this.loadingEvent = false;
				},
				error: () => this.loadingEvent = false
			});
		});
	}

}
