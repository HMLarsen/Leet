import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Event, EventForShow } from '../model/event.model';
import { EventService } from '../services/event.service';

@Component({
	selector: 'app-events',
	templateUrl: './events.component.html',
	styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

	loadingEvents = true;
	events: EventForShow[];

	constructor(
		private titleService: Title,
		private eventService: EventService
	) { }

	ngOnInit(): void {
		this.titleService.setTitle('Leet - Meus eventos');
		this.getEvents();
	}

	getEvents() {
		this.eventService.getEvents()
			.then(observable => {
				const obsRef = observable.subscribe({
					next: snapshot => {
						this.loadingEvents = false;
						this.events = snapshot.docs.map(doc => {
							const event = doc.data();
							this.setEventBanner(event);
							return event;
						});
						obsRef.unsubscribe();
					},
					error: () => {
						this.loadingEvents = false;
						obsRef.unsubscribe();
					}
				});
			});
	}

	setEventBanner(event: EventForShow) {
		this.eventService.getEventBanner(event.id)
			.then(observable => {
				const obsRef = observable.subscribe({
					next: downloadUrl => {
						event.bannerUrl = downloadUrl;
						obsRef.unsubscribe();
					},
					error: () => {
						event.bannerUrlError = true;
						obsRef.unsubscribe();
					}
				});
			});
	}

}
