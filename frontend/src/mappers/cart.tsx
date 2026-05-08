import { mapBookFromAPI, type Book } from "./book";

export interface CartItem {
  id: string;
  cart_id: string;
  book_id: string;
  quantity: number;
  book?: Book;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCartFromAPI(raw: any): Cart {
  return {
    id: raw.ID ?? raw.id ?? "",
    user_id: raw.UserID ?? raw.user_id ?? "",
    items: (raw.Items ?? raw.items ?? []).map(mapCartItemFromAPI),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCartItemFromAPI(raw: any): CartItem {
  return {
    id: raw.ID ?? raw.id ?? "",
    cart_id: raw.CartID ?? raw.cart_id ?? "",
    book_id: raw.BookID ?? raw.book_id ?? "",
    quantity: raw.Quantity ?? raw.quantity ?? 0,
    book: raw.Book ? mapBookFromAPI(raw.Book) : undefined,
  };
}
