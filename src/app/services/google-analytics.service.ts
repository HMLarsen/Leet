import { Injectable } from '@angular/core';
import { AngularFireAnalytics, } from '@angular/fire/compat/analytics';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class GoogleAnalyticsService {

	constructor(
		private router: Router,
		private analytics: AngularFireAnalytics
	) { }

	setupAnalytics() {
		// send page for every route navigated
		this.router.events.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe((event: any) => this.sendPage(event.urlAfterRedirects));
	}

	private sendPage(url: string) {
		this.analytics.logEvent('page_view', { page_path: url });
	}

	private addEvent(eventName: string, eventCategory: string) {
		this.analytics.logEvent(eventName, { eventCategory });
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
