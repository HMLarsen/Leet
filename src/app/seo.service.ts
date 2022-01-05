import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root'
})
export class SEOService {

	constructor(
		private title: Title,
		private meta: Meta
	) { }

	updateTitle(title: string, prefix = true) {
		const titleUpdated = prefix ? 'Leet - ' : '' + title;
		this.title.setTitle(titleUpdated);
		this.meta.updateTag({ name: 'og:title', content: titleUpdated });
		this.meta.updateTag({ name: 'twitter:title', content: titleUpdated });
	}

	updateDescription(desc: string) {
		this.meta.updateTag({ name: 'description', content: desc });
		this.meta.updateTag({ name: 'og:description', content: desc });
		this.meta.updateTag({ name: 'twitter:description', content: desc });
	}

	updateImage(imageUrl: string) {
		this.meta.updateTag({ name: 'og:image', content: imageUrl });
		this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
	}

}
