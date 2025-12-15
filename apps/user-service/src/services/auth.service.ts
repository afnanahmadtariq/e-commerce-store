import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUserDocument, Session } from '../models';
import { AppError } from '../middleware';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export class AuthService {
  // Generate access token
  private static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  // Generate refresh token
  private static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  }

  // Generate both tokens
  private static generateTokens(user: IUserDocument): AuthTokens {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  // Register new user
  static async register(data: RegisterData): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      ...data,
      email: data.email.toLowerCase(),
      emailVerificationToken,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    // TODO: Send verification email
    console.log(`Verification token for ${user.email}: ${emailVerificationToken}`);

    return { user, tokens };
  }

  // Login user
  static async login(
    email: string,
    password: string,
    userAgent: string,
    ipAddress: string
  ): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await Session.create({
      userId: user._id,
      refreshToken: tokens.refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return { user, tokens };
  }

  // Refresh access token
  static async refreshToken(
    refreshToken: string,
    userAgent: string,
    ipAddress: string
  ): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;

      // Find session
      const session = await Session.findOne({
        refreshToken,
        isValid: true,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 404);
      }

      // Generate new tokens
      const newTokens = this.generateTokens(user);

      // Invalidate old session and create new one
      await Session.findByIdAndUpdate(session._id, { isValid: false });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await Session.create({
        userId: user._id,
        refreshToken: newTokens.refreshToken,
        userAgent,
        ipAddress,
        expiresAt,
      });

      return newTokens;
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  // Logout user
  static async logout(refreshToken: string): Promise<void> {
    await Session.findOneAndUpdate(
      { refreshToken },
      { isValid: false }
    );
  }

  // Logout from all devices
  static async logoutAll(userId: string): Promise<void> {
    await Session.updateMany(
      { userId },
      { isValid: false }
    );
  }

  // Verify access token
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid or expired access token', 401);
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<IUserDocument | null> {
    return User.findById(userId);
  }

  // Get user profile
  static async getProfile(userId: string): Promise<IUserDocument | null> {
    return User.findById(userId);
  }

  // Update user profile
  static async updateProfile(
    userId: string,
    updates: Partial<Pick<IUserDocument, 'firstName' | 'lastName' | 'phone' | 'avatar'>>
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );
  }

  // Change password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    // Invalidate all sessions except current
    await Session.updateMany(
      { userId },
      { isValid: false }
    );
  }

  // Add address
  static async addAddress(userId: string, address: IUserDocument['addresses'][0]): Promise<IUserDocument | null> {
    // If this is the default address, unset other defaults
    if (address.isDefault) {
      await User.findByIdAndUpdate(userId, {
        $set: { 'addresses.$[].isDefault': false },
      });
    }

    return User.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true, runValidators: true }
    );
  }

  // Update address
  static async updateAddress(
    userId: string,
    addressId: string,
    updates: Partial<IUserDocument['addresses'][0]>
  ): Promise<IUserDocument | null> {
    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await User.findByIdAndUpdate(userId, {
        $set: { 'addresses.$[].isDefault': false },
      });
    }

    return User.findByIdAndUpdate(
      userId,
      {
        $set: Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [`addresses.$[addr].${key}`, value])
        ),
      },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ 'addr._id': addressId }],
      }
    );
  }

  // Delete address
  static async deleteAddress(userId: string, addressId: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );
  }

  // Get all users (admin)
  static async getAllUsers(
    page = 1,
    limit = 20,
    filters: { role?: string; isActive?: boolean; search?: string } = {}
  ): Promise<{ users: IUserDocument[]; total: number; page: number; totalPages: number }> {
    const query: Record<string, unknown> = {};

    if (filters.role) query.role = filters.role;
    if (typeof filters.isActive === 'boolean') query.isActive = filters.isActive;
    if (filters.search) {
      query.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update user role (admin)
  static async updateUserRole(userId: string, role: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );
  }

  // Toggle user active status (admin)
  static async toggleUserStatus(userId: string): Promise<IUserDocument | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    user.isActive = !user.isActive;
    await user.save();

    // If deactivating, invalidate all sessions
    if (!user.isActive) {
      await this.logoutAll(userId);
    }

    return user;
  }
}
