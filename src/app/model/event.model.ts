import { Timestamp } from '@firebase/firestore-types';

export class Event {
	id!: string
	banner?: File;
	bannerUrl?: string;
	name!: string;
	start!: Timestamp;
	description!: string;
	lineUp!: string[];
	active!: boolean;
}
