import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { FirestoreError } from '@angular/fire/firestore';

@Injectable({
	providedIn: 'root'
})
export class ErrorService {

	constructor() { }

	translateError(error: any) {
		let errorMessage = 'Tente novamente mais tarde.';
		if (!error) return errorMessage;
		if (error instanceof FirebaseError ||
			error instanceof FirestoreError) {
			errorMessage = this.translateFirebaseError(error) || errorMessage;
		}
		return errorMessage;
	}

	private translateFirebaseError(error: FirebaseError | FirestoreError) {
		if (error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
			return 'Você não tem permissão para realizar esta operação.';
		}
		if (error.code === 'invalid-argument') {
			return 'As informações enviadas estão incorretas, verifique e tente novamente.';
		}
		return undefined;
	}

}

// [code=invalid-argument]: Function DocumentReference.set() called with invalid data. Unsupported field value: a custom File object (found in field banner in document users/hugomarcel91@gmail.com/events/QpCfnqDewjPNHDJUD7H5)
// FirebaseError: Firebase Storage: User does not have permission to access 'users/hugomarcel91@gmail.com/events/8PEtIbnySVMVXad1o2s5/banner'. (storage/unauthorized)
// FirebaseError: [code=permission-denied]: Missing or insufficient permissions.