import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { User, UserAccess } from '../model/user.model';

@Injectable({
	providedIn: 'root'
})
export class UserService {

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

	async getUserAccess() {
		const userEmail = (await this.getAuthUser())?.email!;
		const refObservable = this.firestore
			.collection(this.accessCollectionName)
			.doc<UserAccess>(userEmail)
			.get();
		return (await firstValueFrom(refObservable)).data();
	}

	async getUser() {
		const userEmail = (await this.getAuthUser())?.email!;
		const refObservable = this.firestore
			.collection(this.usersCollectionName)
			.doc<User>(userEmail)
			.get();
		return (await firstValueFrom(refObservable)).data();
	}

	async isAllowedUser(userEmail: string) {
		const refObservable = this.firestore
			.collection(this.accessCollectionName)
			.doc<UserAccess>(userEmail)
			.get();
		const userAccess = (await firstValueFrom(refObservable));
		if (!userAccess.exists) return false;
		return userAccess.data()?.allowed;
	}

	async getUserEventLimit() {
		const userAccess = await this.getUserAccess();
		if (userAccess) {
			return userAccess.eventLimit || this.DEFAULT_EVENT_LIMIT;
		}
		return this.DEFAULT_EVENT_LIMIT;
	}

	async getUserEventCount() {
		const user = await this.getUser();
		if (user) {
			return user.eventCount || 0;
		}
		return 0;
	}

	async updateEventCount(dec = false) {
		let user = await this.getUser();
		if (!user) {
			user = { eventCount: 0 };
		}
		user.eventCount += (dec ? -1 : 1);
		const userEmail = (await this.getAuthUser())?.email!;
		this.firestore
			.collection(this.usersCollectionName)
			.doc<User>(userEmail)
			.set(user);
	}

}
