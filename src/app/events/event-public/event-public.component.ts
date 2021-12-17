import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Event } from 'src/app/model/event.model';
import { Person } from 'src/app/model/person.model';
import { EventService } from 'src/app/services/event.service';

declare var bootstrap: any;

@Component({
	selector: 'app-event-public',
	templateUrl: './event-public.component.html',
	styleUrls: ['./event-public.component.scss'],
	animations: [
		trigger('fadeInOut', [
			transition(':enter', [
				style({ opacity: 0 }),
				animate(500, style({ opacity: 1 }))
			])
		])
	]
})
export class EventPublicComponent implements OnInit {

	eventId: string;
	eventUserEmail: string;
	event: Event;
	downloadLogoURL: string;
	loadingEvent = true;
	inviteForm: FormGroup;
	loadingSubmit: boolean;
	nameConfirmed: boolean;

	constructor(
		private route: ActivatedRoute,
		private eventService: EventService,
		private titleService: Title
	) { }

	ngOnInit(): void {
		this.inviteForm = new FormGroup({
			personName: new FormControl('', [Validators.required, Validators.minLength(5)])
		});
		this.getEvent();
	}

	getEvent() {
		const params = atob(this.route.snapshot.paramMap.get('params')!).split('|');
		this.eventId = params[0];
		this.eventUserEmail = params[1];
		this.eventService.getEvent(this.eventId, this.eventUserEmail)
			.then(observable => {
				observable.subscribe({
					next: value => {
						this.event = value.payload.data()!;
						if (this.event) {
							this.getEventBanner();
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

	getEventBanner() {
		this.eventService.getEventBanner(this.eventId!, this.eventUserEmail)
			.then(observable => {
				observable.subscribe({
					next: value => {
						this.downloadLogoURL = value;
						this.loadingEvent = false;
					},
					error: () => this.loadingEvent = false
				});
			});
	}

	onSubmit() {
		this.loadingSubmit = true;
		const personName = this.inviteForm.get('personName')?.value.trim();
		const person: Person = {
			name: personName,
			fillDate: Timestamp.now()
		};
		this.eventService.addPerson(this.eventId, person, this.eventUserEmail)
			.then(() => {
				this.nameConfirmed = true;
				this.inviteForm.reset();
			}).catch(() => {
				new bootstrap.Modal(document.getElementById('errorModal')).show();
			})
			.finally(() => this.loadingSubmit = false);
	}

}
