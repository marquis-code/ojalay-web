import { BaseApi } from '~/api/base/BaseApi';
import type { Review, ReviewListResponse } from '~/types';

class ReviewsApi extends BaseApi {
  constructor() { super('/reviews'); }
  listReviews(status = 'all'): Promise<ReviewListResponse> {
    return this.request('get', '', undefined, { status });
  }
  setStatus(id: string, status: Review['status']): Promise<Review> { return this.request('patch', `/${id}`, { status }); }
  removeReview(id: string): Promise<{ removed: boolean }> { return this.request('delete', `/${id}`); }
}

export const reviewsApi = new ReviewsApi();
