import { Timestamp } from '@angular/fire/firestore';

export class Event {
	id: string;
	createdAt: Timestamp;
	bannerFile?: File;
	name: string;
	date: Timestamp;
	description: string;
	active: boolean;
}

export class EventForShow extends Event {
	bannerUrl?: string;
	bannerUrlError?: boolean;
}