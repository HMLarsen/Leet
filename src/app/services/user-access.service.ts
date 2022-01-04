import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({
	providedIn: 'root'
})
export class UserAccessService {

	accessCollectionName = 'access';
	usersCollectionName = 'users';
	DEFAULT_EVENT_LIMIT = 20;

	constructor(
		private firestore: AngularFirestore,
		private auth: AngularFireAuth
	) { }

	private getAuthUser() {
		return this.auth.currentUser;
	}

	async isAllowedUser(userEmail: string) {
		const refObservable = this.firestore
			.collection(this.accessCollectionName)
			.doc(userEmail)
			.get();
		return (await firstValueFrom(refObservable)).exists;
	}

	async getUserEventCount() {
		const userEmail = (await this.getAuthUser())?.email!;
		const refObservable = this.firestore
			.collection(this.usersCollectionName)
			.doc<User>(userEmail)
			.get();
		const data = (await firstValueFrom(refObservable)).data();
		if (data) return data.eventCount || 0;
		return 0;
	}

	async updateEventCount(dec = false) {
		const eventCount = await this.getUserEventCount() + (dec ? -1 : 1);
		const userEmail = (await this.getAuthUser())?.email!;
		this.firestore
			.collection(this.usersCollectionName)
			.doc<User>(userEmail)
			.update({ eventCount });
	}

	async getUserEventLimit() {
		const userEmail = (await this.getAuthUser())?.email!;
		const refObservable = this.firestore
			.collection(this.usersCollectionName)
			.doc<User>(userEmail)
			.get();
		const data = (await firstValueFrom(refObservable)).data();
		if (data) return data.eventLimit || this.DEFAULT_EVENT_LIMIT;
		return this.DEFAULT_EVENT_LIMIT;
	}

}
