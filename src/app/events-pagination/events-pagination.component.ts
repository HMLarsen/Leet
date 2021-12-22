import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { Timestamp } from '@angular/fire/firestore';
import { EventForShow } from '../model/event.model';
import { fadeInOut, inOutAnimation } from '../animations';

@Component({
	selector: 'app-events-pagination',
	templateUrl: './events-pagination.component.html',
	styleUrls: ['./events-pagination.component.scss'],
	animations: [inOutAnimation, fadeInOut]
})
export class EventsPaginationComponent implements OnInit {

	events: EventForShow[] = [];
	batch = 3 * 5;
	lastCreatedDate = Timestamp.now();
	empty = false;
	loading = true;
	disabledInfiniteScroll = false;

	constructor(private eventService: EventService) { }

	ngOnInit() {
		this.fetchEventsPaginated();
	}

	fetchEventsPaginated() {
		if (this.empty || this.disabledInfiniteScroll) return;
		this.loading = true;
		this.disabledInfiniteScroll = true;
		this.eventService.paginateEvents(this.batch, this.lastCreatedDate)
			.then(snapshot => {
				const events = snapshot.docs;
				if (!events.length || events.length < this.batch) {
					this.empty = true;
				}
				const lastItem = events[events.length - 1];
				if (lastItem) {
					this.lastCreatedDate = lastItem.data().createdAt;
					events.forEach(eventSnap => {
						const event = eventSnap.data();
						this.events.push(event);
						this.setEventBanner(event);
					});
				}
			})
			.finally(() => {
				this.loading = false;
				this.disabledInfiniteScroll = false;
			});
	}

	setEventBanner(event: EventForShow) {
		this.eventService.getEventBanner(event.id)
			.then(downloadUrl => event.bannerUrl = downloadUrl)
			.catch(() => event.bannerUrlError = true);
	}

	onScroll() {
		this.fetchEventsPaginated();
	}

}
