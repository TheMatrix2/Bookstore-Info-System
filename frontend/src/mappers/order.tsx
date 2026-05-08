import { mapBookFromAPI, type Book } from "./book";

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  quantity: number;
  price: number;
  book?: Book;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

export interface Delivery {
  order_id: string;
  address: string;
  status: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  payment?: Payment | null;
  delivery?: Delivery | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOrderFromAPI(raw: any): Order {
  return {
    id: raw.ID ?? raw.id ?? "",
    user_id: raw.UserID ?? raw.user_id ?? "",
    total_price: raw.TotalPrice ?? raw.total_price ?? 0,
    status: raw.Status ?? raw.status ?? "",
    created_at: raw.CreatedAt ?? raw.created_at ?? "",
    items: (raw.Items ?? raw.items ?? []).map(mapOrderItemFromAPI),
    payment: raw.Payment ? mapPaymentFromAPI(raw.Payment) : null,
    delivery: raw.Delivery ? mapDeliveryFromAPI(raw.Delivery) : null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrderItemFromAPI(raw: any): OrderItem {
  return {
    id: raw.ID ?? raw.id ?? "",
    order_id: raw.OrderID ?? raw.order_id ?? "",
    book_id: raw.BookID ?? raw.book_id ?? "",
    quantity: raw.Quantity ?? raw.quantity ?? 0,
    price: raw.Price ?? raw.price ?? 0,
    book: raw.Book ? mapBookFromAPI(raw.Book) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPaymentFromAPI(raw: any): Payment {
  return {
    id: raw.ID ?? raw.id ?? "",
    order_id: raw.OrderID ?? raw.order_id ?? "",
    amount: raw.Amount ?? raw.amount ?? 0,
    method: raw.Method ?? raw.method ?? "",
    status: raw.Status ?? raw.status ?? "",
    created_at: raw.CreatedAt ?? raw.created_at ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDeliveryFromAPI(raw: any): Delivery {
  return {
    order_id: raw.OrderID ?? raw.order_id ?? "",
    address: raw.Address ?? raw.address ?? "",
    status: raw.Status ?? raw.status ?? "",
    created_at: raw.CreatedAt ?? raw.created_at ?? "",
  };
}
