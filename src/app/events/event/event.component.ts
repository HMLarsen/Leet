import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../model/event.model';
import { EventService } from '../../services/event.service';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

	eventId!: string;
	event!: Event;
	downloadLogoURL!: string;
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
		this.eventId = this.route.snapshot.paramMap.get('id')!;
		this.eventService.getEvent(this.eventId!).then(observable => {
			const obsRef = observable.subscribe({
				next: value => {
					this.event = value.payload.data()!;
					if (this.event) {
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
					this.downloadLogoURL = '../../../assets/img/card-default-image.png';
					this.loadingEvent = false;
					obsRef.unsubscribe();
				}
			});
		});
	}

}
