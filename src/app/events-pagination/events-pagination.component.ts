import { Component, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { map } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import { EventForShow } from '../model/event.model';

@Component({
	selector: 'app-events-pagination',
	templateUrl: './events-pagination.component.html',
	styleUrls: ['./events-pagination.component.scss']
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
			.then(obs => {
				const obsRef = obs.pipe(
					map(data => {
						if (!data.length) {
							this.empty = true;
						}
						const lastItem = data[data.length - 1];
						if (lastItem) {
							this.lastCreatedDate = lastItem.payload.doc.data().createdAt;
							data.map(eventSnap => {
								const event = eventSnap.payload.doc.data();
								this.events.push(event);
								this.setEventBanner(event);
							});
						}
						this.loading = false;
						this.disabledInfiniteScroll = false;
						obsRef.unsubscribe();
					})
				).subscribe();
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

	onScroll() {
		this.fetchEventsPaginated();
	}

}
