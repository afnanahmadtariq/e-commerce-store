import mongoose from 'mongoose';
import { Review, IReviewDocument } from '../models/review.model';
import { Product } from '../models/product.model';

export interface CreateReviewData {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  content: string;
  isVerifiedPurchase?: boolean;
  images?: string[];
}

export class ReviewService {
  // Create review
  static async create(data: CreateReviewData): Promise<IReviewDocument> {
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId: data.productId,
      userId: data.userId,
    });

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    const review = await Review.create(data);

    // Update product ratings
    await this.updateProductRatings(data.productId);

    return review;
  }

  // Get reviews for a product
  static async getByProduct(
    productId: string,
    page = 1,
    limit = 10,
    sortBy: 'createdAt' | 'rating' | 'helpfulCount' = 'createdAt'
  ): Promise<{
    reviews: IReviewDocument[];
    total: number;
    page: number;
    totalPages: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  }> {
    const sortOptions: Record<string, -1> = {};
    sortOptions[sortBy] = -1;

    const total = await Review.countDocuments({ productId });
    const reviews = await Review.find({ productId })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      ratingDistribution[d._id] = d.count;
    });

    // Calculate average
    const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
    const weightedSum = Object.entries(ratingDistribution).reduce(
      (sum, [rating, count]) => sum + parseInt(rating) * count,
      0
    );
    const averageRating = totalRatings > 0 ? weightedSum / totalRatings : 0;

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  }

  // Update review
  static async update(
    reviewId: string,
    userId: string,
    updates: Pick<CreateReviewData, 'rating' | 'title' | 'content' | 'images'>
  ): Promise<IReviewDocument | null> {
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (review) {
      await this.updateProductRatings(review.productId.toString());
    }

    return review;
  }

  // Delete review
  static async delete(reviewId: string, userId: string): Promise<boolean> {
    const review = await Review.findOneAndDelete({ _id: reviewId, userId });

    if (review) {
      await this.updateProductRatings(review.productId.toString());
      return true;
    }

    return false;
  }

  // Delete review (admin)
  static async adminDelete(reviewId: string): Promise<boolean> {
    const review = await Review.findByIdAndDelete(reviewId);

    if (review) {
      await this.updateProductRatings(review.productId.toString());
      return true;
    }

    return false;
  }

  // Mark review as helpful
  static async markHelpful(reviewId: string): Promise<IReviewDocument | null> {
    return Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
  }

  // Update product ratings (called after review changes)
  private static async updateProductRatings(productId: string): Promise<void> {
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const ratings = stats[0] || { average: 0, count: 0 };

    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(ratings.average * 10) / 10,
      'ratings.count': ratings.count,
    });
  }

  // Get user's reviews
  static async getByUser(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{
    reviews: IReviewDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const total = await Review.countDocuments({ userId });
    const reviews = await Review.find({ userId })
      .populate('productId', 'name slug images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
