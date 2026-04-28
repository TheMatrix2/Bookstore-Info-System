export default interface BookFilter {
    author_id?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
}