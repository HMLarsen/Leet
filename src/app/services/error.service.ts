import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { FirestoreError } from '@angular/fire/firestore';

@Injectable({
	providedIn: 'root'
})
export class ErrorService {

	MAX_LIMIT_EVENT = 'MAX_LIMIT_EVENT';

	constructor() { }

	translateError(error: any) {
		let errorMessage = 'Tente novamente mais tarde.';
		if (!error) return errorMessage;
		if (error instanceof FirebaseError || error instanceof FirestoreError) {
			errorMessage = this.translateFirebaseError(error) || errorMessage;
		}
		if (error && error.message === this.MAX_LIMIT_EVENT) {
			return 'O limite de eventos foi alcançado, exclua ou edite um evento existente.';
		}
		return errorMessage;
	}

	private translateFirebaseError(error: FirebaseError | FirestoreError) {
		if (error.code === 'permission-denied' || error.code === 'storage/unauthorized') {
			return 'Você não tem permissão para realizar esta operação.';
		}
		if (error.message === 'maximum 500 writes allowed per request') {
			return 'Máximo de 500 registros por vez.';
		}
		if (error.code === 'invalid-argument') {
			return 'As informações enviadas estão incorretas, verifique e tente novamente.';
		}
		if (error.code === 'resource-exhausted') {
			return 'A cota de requisições foi excedida.';
		}
		return undefined;
	}

}
