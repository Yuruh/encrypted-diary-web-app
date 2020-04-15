export class Pagination {
    limit: number = 0;
    has_next_page: boolean = false;
    has_prev_page: boolean = false;
    page: number = 0;
    next_page: number = 0;
    prev_page: number = 0;
    total_pages: number = 0;
    total_matches: number = 0;
}