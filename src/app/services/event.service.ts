import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Event } from '../model/event.model';
import { Person } from '../model/person.model';

@Injectable({
	providedIn: 'root'
})
export class EventService {

	userCollectionName = 'users';
	eventCollectionName = 'events';
	personCollectionName = 'people';

	constructor(
		private firestore: AngularFirestore,
		private storage: AngularFireStorage,
		private auth: AngularFireAuth
	) { }

	async getAuthUser() {
		return this.auth.currentUser;
	}

	async createEvent(event: Event) {
		const userEmail = (await this.getAuthUser())?.email!;

		// id
		const newEventId = this.firestore.createId();
		event.id = newEventId;

		// delete event banner for upload
		const eventBanner = event.banner;
		delete event.banner;

		// create the event and upload its banner
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(newEventId)
			.set(event)
			.then(async () => {
				// TODO rever esse erro do upload
				await this.uploadEventBanner(newEventId, eventBanner)
					.catch(() => this.deleteEvent(newEventId));
				return event;
			});
	}

	async updateEvent(event: Event) {
		const userEmail = (await this.getAuthUser())?.email!;

		// delete event banner for upload
		const eventBanner = event.banner;
		delete event.banner;

		// create the event and upload its banner
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(event.id)
			.set(event)
			.then(async () => {
				// TODO rever esse erro do upload
				if (eventBanner) {
					await this.uploadEventBanner(event.id, eventBanner)
						.catch(() => this.deleteEvent(event.id));
				}
				return event;
			});
	}

	async uploadEventBanner(eventId: string, file: any) {
		const userEmail = (await this.getAuthUser())?.email!;
		const filePath = `${this.userCollectionName}/${userEmail}/events/${eventId}/banner`;
		const ref = this.storage.ref(filePath);
		return ref.put(file, { cacheControl: 'public,max-age=4000' });
	}

	async getEvents() {
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection<Event>(this.eventCollectionName)
			.get();
	}

	async getEvent(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc<Event>(eventId)
			.snapshotChanges();
	}

	async deleteEvent(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(eventId)
			.delete()
			.then(() => {
				const filePath = `${this.userCollectionName}/${userEmail}/events/${eventId}/banner`;
				const ref = this.storage.ref(filePath);
				return ref.delete();
			});
	}

	async getEventBanner(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		const filePath = `${this.userCollectionName}/${userEmail}/events/${eventId}/banner`;
		const ref = this.storage.ref(filePath);
		return ref.getDownloadURL();
	}

	addPerson(eventId: string, person: Person) {
		return this.firestore
			.collection(this.eventCollectionName)
			.doc(eventId)
			.collection(this.personCollectionName)
			.add(person);
	}

	getPeople(eventId: string) {
		return this.firestore.collection(this.eventCollectionName)
			.doc<Event>(eventId)
			.collection<Person>(this.personCollectionName)
			.snapshotChanges();
	}

	activeEvent(eventId: string) {
		return this.firestore.collection(this.eventCollectionName)
			.doc<Event>(eventId)
			.update({ 'active': true });
	}

	deactiveEvent(eventId: string) {
		return this.firestore.collection(this.eventCollectionName)
			.doc<Event>(eventId)
			.update({ 'active': false });
	}

}
