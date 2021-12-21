import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Timestamp } from '@angular/fire/firestore';
import { Event } from '../model/event.model';
import { Person } from '../model/person.model';
import { firstValueFrom } from 'rxjs';

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

	getAuthUser() {
		return this.auth.currentUser;
	}

	async setEvent(event: Event) {
		// copy object to prevent original object changes
		const eventCopy: Event = Object.assign({}, event);

		// create new id if null
		if (!eventCopy.id) {
			const newEventId = this.firestore.createId();
			eventCopy.id = newEventId;
			eventCopy.createdAt = Timestamp.now();
		}

		// delete event banner for upload
		const eventBannerFile = eventCopy.bannerFile;
		delete eventCopy.bannerFile;

		// create the event and upload its banner
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(eventCopy.id)
			.set(eventCopy)
			.then(async () => {
				if (eventBannerFile) {
					try {
						await this.uploadEventBanner(eventCopy.id, eventBannerFile);
					} catch (e) {
						this.deleteEvent(eventCopy.id);
						throw e;
					}
				}
				return eventCopy;
			});
	}

	async uploadEventBanner(eventId: string, file: any) {
		const userEmail = (await this.getAuthUser())?.email!;
		const filePath = `${this.userCollectionName}/${userEmail}/events/${eventId}/banner`;
		const ref = this.storage.ref(filePath);
		const metadata = {
			customMetadata: {
				author: userEmail
			},
			cacheControl: 'public,max-age=7776000' // 90 days/3 months
		};
		return ref.put(file, metadata);
	}

	async paginateEvents(limit: number, lastCreatedDate: Timestamp) {
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection<Event>(this.eventCollectionName, ref => (
				ref
					.where('createdAt', '<', lastCreatedDate)
					.orderBy('createdAt', 'desc')
					.limit(limit)
			)).snapshotChanges();
	}

	async getEvent(eventId: string, userEmail?: string) {
		userEmail = userEmail || (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc<Event>(eventId)
			.snapshotChanges();
	}

	async deleteEvent(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;

		// delete people from event before
		await this.deleteEventPeople(eventId);

		// delete event
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(eventId)
			.delete()
			.then(async () => {
				// delete banner
				const filePath = `${this.userCollectionName}/${userEmail}/events/${eventId}/banner`;
				const ref = this.storage.ref(filePath);
				await firstValueFrom(ref.delete());
			});
	}

	async deleteEventPeople(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		const collectionRef = this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(eventId)
			.collection(this.personCollectionName)
			.ref;
		await this.deleteCollectionQueryBatch(collectionRef);
	}

	async deleteCollectionQueryBatch(collectionRef: any) {
		const batchLimit = 20;
		const snapshot = await collectionRef.limit(batchLimit).get();

		const batchSize = snapshot.size;
		if (batchSize === 0) {
			// When there are no documents left, we are done
			return;
		}

		// Delete documents in a batch
		const batch = collectionRef.firestore.batch();
		snapshot.docs.forEach((doc: any) => {
			batch.delete(doc.ref);
		});
		await batch.commit();
		await this.deleteCollectionQueryBatch(collectionRef);
	}

	async getEventBanner(eventId: string, userEmail?: string) {
		userEmail = userEmail || (await this.getAuthUser())?.email!;
		const filePath = `${this.userCollectionName}/${userEmail}/events/${eventId}/banner`;
		const ref = this.storage.ref(filePath);
		return ref.getDownloadURL();
	}

	async addPerson(eventId: string, person: Person, userEmail?: string) {
		userEmail = userEmail || (await this.getAuthUser())?.email!;
		const newPersonId = this.firestore.createId();
		person.id = newPersonId;
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(eventId)
			.collection(this.personCollectionName)
			.doc(newPersonId)
			.set(person);
	}

	async addPeople(eventId: string, people: Person[], userEmail?: string) {
		userEmail = userEmail || (await this.getAuthUser())?.email!;
		const ref = this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(eventId)
			.collection(this.personCollectionName)
			.ref;
		const batch = ref.firestore.batch();
		people.forEach(person => {
			person.id = this.firestore.createId();
			const newPersonRef = ref.doc(person.id);
			batch.set(newPersonRef, person);
		});
		return batch.commit();
	}

	async getPeople(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.userCollectionName)
			.doc(userEmail)
			.collection(this.eventCollectionName)
			.doc(eventId)
			.collection<Person>(this.personCollectionName)
			.snapshotChanges();
	}

	async getEventPublicUrlParams(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		return btoa(`${eventId}|${userEmail}`);
	}

}
