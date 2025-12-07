import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'customer' | 'admin' | 'vendor' | 'support';
    isActive: boolean;
    isVerified: boolean;
    avatar?: string;
    addresses: Array<{
        type: 'home' | 'work' | 'other';
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        isDefault: boolean;
    }>;
    refreshTokens: string[];
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    emailVerificationToken?: string;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    fullName: string;
}

const AddressSchema = new Schema({
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
}, { _id: true });

const UserSchema = new Schema<IUserDocument>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    phone: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'vendor', 'support'],
        default: 'customer',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    avatar: String,
    addresses: [AddressSchema],
    refreshTokens: [{ type: String, select: false }],
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    lastLogin: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: IUserDocument) {
    return `${this.firstName} ${this.lastName}`;
});

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1, isVerified: 1 });

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
