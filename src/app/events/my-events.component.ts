import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { fadeInOut, inOutAnimation } from '../animations';
import { EventForShow } from '../model/event.model';
import { SEOService } from '../seo.service';
import { EventService } from '../services/event.service';
import { UserService } from '../services/user-access.service';

@Component({
	selector: 'app-my-events',
	templateUrl: './my-events.component.html',
	styleUrls: ['./my-events.component.scss'],
	animations: [fadeInOut, inOutAnimation]
})
export class MyEventsComponent implements OnInit, OnDestroy {

	events: EventForShow[] = [];
	eventsSubscription: Subscription;
	empty = false;
	loading = true;
	eventLimit = 0;

	constructor(
		private seoService: SEOService,
		private eventService: EventService,
		private userService: UserService
	) { }

	ngOnInit() {
		this.seoService.updateTitle('Meus eventos');
		this.getEvents();
		this.getEventLimit();
	}

	ngOnDestroy(): void {
		if (this.eventsSubscription) this.eventsSubscription.unsubscribe();
	}

	async getEventLimit() {
		this.eventLimit = (await this.userService.getUserEventLimit());
	}

	getEvents() {
		this.eventService.getEventsStateChanges()
			.then(observable => {
				this.events = [];
				this.eventsSubscription = observable.pipe(
					map(changes => {
						let sort = false;
						for (let index = 0; index < changes.length; index++) {
							const itemDoc = changes[index];
							const event = itemDoc.payload.doc.data() as EventForShow;
							if (itemDoc.type == 'added') {
								this.events.push(event);
								this.setEventBanner(event);
								sort = true;
							} else if (itemDoc.type == 'modified') {
								const eventToUpdate = this.events.find(object => object.id === event.id);
								if (eventToUpdate) {
									const indexToUpdate = this.events.indexOf(eventToUpdate);
									if (indexToUpdate >= 0) {
										this.events[indexToUpdate].name = event.name;
										this.events[indexToUpdate].date = event.date;
									}
								}
							} else if (itemDoc.type == 'removed') {
								const eventToRemove = this.events.find(object => object.id === event.id);
								if (eventToRemove) {
									const indexToRemove = this.events.indexOf(eventToRemove);
									if (indexToRemove >= 0) {
										this.events.splice(indexToRemove, 1);
									}
								}
							}
						}
						if (sort) {
							this.events.sort((a, b) => (a.createdAt.seconds <= b.createdAt.seconds) ? 1 : -1);
						}
						this.empty = !this.events.length;
						this.loading = false;
					})
				).subscribe();
			});
	}

	setEventBanner(event: EventForShow) {
		this.eventService.getEventBanner(event.id)
			.then(downloadUrl => event.bannerUrl = downloadUrl)
			.catch(() => event.bannerUrlError = true);
	}

}
