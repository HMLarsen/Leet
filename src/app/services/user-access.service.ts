import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class UserAccessService {

	accessCollectionName = 'access';

	constructor(
		private firestore: AngularFirestore
	) { }

	async isAllowedUser(userEmail: string) {
		const refObservable = this.firestore
			.collection(this.accessCollectionName)
			.doc(userEmail)
			.get();
		return (await firstValueFrom(refObservable)).exists;
	}

}
