import type Author from "./author";
import type Publisher from "./publisher";

export interface Category {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  authors: Author[];
  categories: Category[];
  price: number;
  description: string | null;
  publisher: Publisher;
  stock: number;
}

export interface BookFilter {
  author_ids?: string[];
  category_ids?: string[];
  publisher_id?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  in_stock?: boolean;
  sort_by?: string;
}

interface AuthorApiRaw {
  ID: string;
  Surname: string;
  Name: string;
  Patronymic: string;
  Info?: string;
}

interface CategoryApiRaw {
  ID: string;
  Name: string;
}

interface PublisherApiRaw {
  ID: string;
  Name: string;
  Address: string;
  Email: string;
  Website?: string;
}

interface BookAPIResponse {
  ID: string;
  Title: string;
  Authors?: AuthorApiRaw[];
  Categories?: CategoryApiRaw[];
  Price: number;
  Description?: string | null;
  Publisher?: PublisherApiRaw;
  Stock: number;
}

export function mapBookFromAPI(raw: BookAPIResponse): Book {
  return {
    id: raw.ID,
    title: raw.Title,
    authors: (raw.Authors ?? []).map((a) => ({
      id: a.ID,
      surname: a.Surname,
      name: a.Name,
      patronymic: a.Patronymic,
      info: a.Info ?? "",
    })),
    categories: (raw.Categories ?? []).map((c) => ({ id: c.ID, name: c.Name })),
    price: raw.Price,
    description: raw.Description ?? null,
    publisher: raw.Publisher
      ? {
          id: raw.Publisher.ID,
          name: raw.Publisher.Name,
          address: raw.Publisher.Address,
          email: raw.Publisher.Email,
          website: raw.Publisher.Website,
        }
      : { id: "", name: "", address: "", email: "" },
    stock: raw.Stock,
  };
}

export default Book;
