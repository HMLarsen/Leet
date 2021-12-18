import { Timestamp } from '@firebase/firestore-types';

export class Event {
	id: string;
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