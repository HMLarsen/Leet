import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { map, Subscription } from 'rxjs';
import { fadeInOut, inOutAnimation } from '../animations';
import { EventForShow } from '../model/event.model';
import { EventService } from '../services/event.service';
import { UserAccessService } from '../services/user-access.service';

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
		private titleService: Title,
		private eventService: EventService,
		private userAccessService: UserAccessService
	) { }

	ngOnInit() {
		this.titleService.setTitle('Leet - Meus eventos');
		this.getEvents();
		this.getEventLimit();
	}

	ngOnDestroy(): void {
		if (this.eventsSubscription) this.eventsSubscription.unsubscribe();
	}

	async getEventLimit() {
		this.eventLimit = (await this.userAccessService.getUserEventLimit());
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
								// in theory this action does not exists
							} else if (itemDoc.type == 'removed') {
								const participantToRemove = this.events.find(object => object.id === event.id);
								if (participantToRemove) {
									const indexToRemove = this.events.indexOf(participantToRemove);
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
