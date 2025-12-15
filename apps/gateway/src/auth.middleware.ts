import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

            // Inject user info into headers for downstream services
            req.headers['x-user-id'] = decoded.userId;
            req.headers['x-user-role'] = decoded.role;
            req.headers['x-user-email'] = decoded.email;

            console.log(`[Gateway] Auth Success: ${decoded.userId} (${decoded.role})`);
        } catch (error) {
            console.error('[Gateway] Token verification failed:', error);
            // We don't block here, we just don't set the headers. 
            // Downstream services will decide if they need auth.
        }
    }

    next();
};
