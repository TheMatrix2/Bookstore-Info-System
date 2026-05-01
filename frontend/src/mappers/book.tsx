import type Author from "./author";
import type Publisher from "./publisher";

export interface Category {
	id: string;
	name: string;
}

export default interface Book {
	id: string;
	title: string;
	author: Author;
	categories: Category[];
	price: number;
	description: string;
	publisher: Publisher;
	stock: number;
}

export default interface BookFilter {
	author_id?: string;
	category_id?: string;
	min_price?: number;
	max_price?: number;
	search?: string;
}

interface BookAPIResponse {
	ID: string;
	Title: string;
	Author: Author;
	Categories: Category[];
	Price: number;
	Description: string;
	Publisher: Publisher;
	Stock: number;
}

export default function mapBookFromAPI(raw: BookAPIResponse): Book {
	return {
		id: raw.ID,
		title: raw.Title,
		author: raw.Author,
		categories: raw.Categories,
		price: raw.Price,
		description: raw.Description,
		publisher: raw.Publisher,
		stock: raw.Stock,
	};
}