import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Event } from '../model/event.model';
import { EventService } from '../services/event.service';

@Component({
	selector: 'app-events',
	templateUrl: './events.component.html',
	styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

	loadingEvents = true;
	events!: Event[];

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
					next: events => {
						this.loadingEvents = false;
						this.events = events;
						this.events.forEach(event => this.getEventBanner(event));
						obsRef.unsubscribe();
					},
					error: () => {
						this.loadingEvents = false;
						obsRef.unsubscribe();
					}
				});
			});
	}

	getEventBanner(event: Event) {
		this.eventService.getEventBanner(event.id)
			.then(observable => {
				const obsRef = observable.subscribe({
					next: value => {
						event.bannerUrl = value;
						obsRef.unsubscribe();
					},
					error: () => {
						obsRef.unsubscribe();
					}
				});
			});
	}

}
