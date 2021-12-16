import { Timestamp } from '@firebase/firestore-types';

export class Event {
	id: string;
	banner?: File;
	bannerUrl: string;
	name: string;
	date: Timestamp;
	description: string;
	active: boolean;
}
