export class PaginationUtil {
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static getTake(limit: number): number {
    return Math.min(limit, 50); // Max 50 items per page
  }

  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
