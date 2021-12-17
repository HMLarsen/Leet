import { Timestamp } from "@angular/fire/firestore";

export class Person {
	id?: string;
	name: string;
	fillDate: Timestamp;
}
