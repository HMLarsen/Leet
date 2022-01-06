import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { firebaseConfig } from 'src/environments/firebase.config';

declare let gtag: Function;

@Injectable({
	providedIn: 'root'
})
export class GoogleAnalyticsService {

	constructor(private router: Router) { }

	setupAnalytics() {
		gtag('config', firebaseConfig.measurementId, { 'send_page_view': false });

		// send page for every route navigated
		this.router.events.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe((event: any) => this.sendPage(event.urlAfterRedirects));
	}

	private sendPage(url: string) {
		gtag('event', 'page_view', { page_path: url });
	}

	private addEvent(eventName: string, eventCategory: string) {
		gtag('event', eventName, { eventCategory });
	}

	addPublicParticipantEvent() {
		this.addEvent('addParticipant', 'public');
	}

	createEventEvent() {
		this.addEvent('createEvent', 'user');
	}

	editEventEvent() {
		this.addEvent('editEvent', 'user');
	}

	deleteEventEvent() {
		this.addEvent('deleteEvent', 'user');
	}

}
