import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, CollectionReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Timestamp } from '@angular/fire/firestore';
import { Event } from '../model/event.model';
import { Participant } from '../model/participant.model';
import { firstValueFrom } from 'rxjs';
import { UtilsService } from './utils.service';
import { UserAccessService } from './user-access.service';
import { ErrorService } from './error.service';
import { GoogleAnalyticsService } from './google-analytics.service';

@Injectable({
	providedIn: 'root'
})
export class EventService {

	usersCollectionName = 'users';
	eventsCollectionName = 'events';
	participantsCollectionName = 'participants';

	constructor(
		private firestore: AngularFirestore,
		private storage: AngularFireStorage,
		private auth: AngularFireAuth,
		private utilsService: UtilsService,
		private userAccessService: UserAccessService,
		private errorService: ErrorService,
		private googleAnalyticsService: GoogleAnalyticsService
	) { }

	private getAuthUser() {
		return this.auth.currentUser;
	}

	async setEvent(event: Event) {
		const creation = !event.id;
		if (creation) {
			const eventCount = await this.userAccessService.getUserEventCount();
			const eventLimit = await this.userAccessService.getUserEventLimit();
			if (eventCount >= eventLimit) {
				throw new Error(this.errorService.MAX_LIMIT_EVENT);
			}
		}

		// copy object to prevent original object changes
		let eventCopy: Event = Object.assign({}, event);

		// create new id if null
		if (creation) {
			const newEventId = this.firestore.createId();
			eventCopy.id = newEventId;
			eventCopy.createdAt = Timestamp.now();
		}

		// delete event banner for upload
		const eventBannerFile = eventCopy.bannerFile;
		delete eventCopy.bannerFile;

		// create the event
		const userEmail = (await this.getAuthUser())?.email!;
		await this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection(this.eventsCollectionName)
			.doc(eventCopy.id)
			.set(eventCopy);

		// upload its banner
		if (eventBannerFile) {
			try {
				await this.uploadEventBanner(eventCopy.id, eventBannerFile);
			} catch (e) {
				await this.deleteEvent(eventCopy.id);
				throw e;
			}
		}
		// inc event count if is an insertion
		if (creation) {
			await this.userAccessService.updateEventCount();
			this.googleAnalyticsService.createEventEvent();
		} else {
			this.googleAnalyticsService.editEventEvent();
		}
		return eventCopy;
	}

	async uploadEventBanner(eventId: string, file: any) {
		const userEmail = (await this.getAuthUser())?.email!;
		const filePath = `${this.usersCollectionName}/${userEmail}/events/${eventId}/banner`;
		const ref = this.storage.ref(filePath);
		const metadata = {
			customMetadata: {
				author: userEmail
			},
			cacheControl: 'public,max-age=7776000' // 90 days/3 months
		};
		return ref.put(file, metadata);
	}

	async getEventsStateChanges() {
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection<Event>(this.eventsCollectionName)
			.stateChanges();
	}

	async getEvent(eventId: string, userEmail?: string) {
		userEmail = userEmail || (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection(this.eventsCollectionName)
			.doc<Event>(eventId)
			.valueChanges();
	}

	async deleteEvent(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;

		// delete participants before
		await this.deleteParticipants(eventId);

		// delete event
		await this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection(this.eventsCollectionName)
			.doc(eventId)
			.delete();

		// delete banner
		const filePath = `${this.usersCollectionName}/${userEmail}/events/${eventId}/banner`;
		const ref = this.storage.ref(filePath);
		await firstValueFrom(ref.delete());
		await this.userAccessService.updateEventCount(true);
		this.googleAnalyticsService.deleteEventEvent();
	}

	async deleteParticipants(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		const collectionRef = this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection(this.eventsCollectionName)
			.doc(eventId)
			.collection(this.participantsCollectionName)
			.ref;
		await this.deleteCollectionQueryBatch(collectionRef);
	}

	async deleteCollectionQueryBatch(collectionRef: CollectionReference) {
		const batchLimit = 20;
		const snapshot = await collectionRef.limit(batchLimit).get();
		const batchSize = snapshot.size;
		if (batchSize === 0) {
			// When there are no documents left, we are done
			return;
		}
		// Delete documents in a batch
		const batch = collectionRef.firestore.batch();
		for (let index = 0; index < snapshot.docs.length; index++) {
			const doc = snapshot.docs[index];
			batch.delete(doc.ref)
		}
		await batch.commit();
		await this.deleteCollectionQueryBatch(collectionRef);
	}

	async getEventBanner(eventId: string, userEmail?: string) {
		userEmail = userEmail || (await this.getAuthUser())?.email!;
		const filePath = `${this.usersCollectionName}/${userEmail}/events/${eventId}/banner`;
		const ref = this.storage.ref(filePath);
		return firstValueFrom(ref.getDownloadURL());
	}

	async addParticipant(eventId: string, name: string, userEmail?: string) {
		name = (name || '').trim();
		if (!name) throw new Error;
		name = this.utilsService.toTitleCase(name);
		userEmail = userEmail || (await this.getAuthUser())?.email!;
		const id = this.firestore.createId();
		const fillDate = Timestamp.now();
		return this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection(this.eventsCollectionName)
			.doc(eventId)
			.collection(this.participantsCollectionName)
			.doc(id)
			.set({ id, name, fillDate });
	}

	async addParticipants(eventId: string, names: string[]) {
		const userEmail = (await this.getAuthUser())?.email!;
		const ref = this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection(this.eventsCollectionName)
			.doc(eventId)
			.collection(this.participantsCollectionName)
			.ref;
		const fillDate = Timestamp.now();
		const batch = ref.firestore.batch();
		for (let index = 0; index < names.length; index++) {
			let name = (names[index] || '').trim();
			if (!name) continue;
			name = this.utilsService.toTitleCase(name);
			const id = this.firestore.createId();
			const newParticipantRef = ref.doc(id);
			batch.set(newParticipantRef, { id, name, fillDate });
		}
		return batch.commit();
	}

	async getParticipantsStateChanges(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection(this.eventsCollectionName)
			.doc(eventId)
			.collection<Participant>(this.participantsCollectionName)
			.stateChanges();
	}

	async getEventPublicUrlParams(eventId: string) {
		const userEmail = (await this.getAuthUser())?.email!;
		return btoa(`${eventId}|${userEmail}`);
	}

	async toggleAcceptingParticipants(eventId: string, accepting: boolean) {
		const userEmail = (await this.getAuthUser())?.email!;
		return this.firestore
			.collection(this.usersCollectionName)
			.doc(userEmail)
			.collection(this.eventsCollectionName)
			.doc<Event>(eventId)
			.update({ 'acceptingParticipants': accepting });
	}

}
