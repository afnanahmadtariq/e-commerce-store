import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
} from '../validators/user.validator';

const router = Router();

// Helper to get client info
const getClientInfo = (req: Request) => ({
  userAgent: req.headers['user-agent'] || 'unknown',
  ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
});

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, tokens } = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { userAgent, ipAddress } = getClientInfo(req);

      const { user, tokens } = await AuthService.login(
        email, 
        password, 
        userAgent, 
        ipAddress
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
          },
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      const { userAgent, ipAddress } = getClientInfo(req);
      const tokens = await AuthService.refreshToken(refreshToken, userAgent, ipAddress);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /auth/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /auth/logout-all
 * @desc Logout from all devices
 * @access Private
 */
router.post(
  '/logout-all',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthService.logoutAll(req.user!.userId);

      res.json({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get(
  '/profile',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.getProfile(req.user!.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.updateProfile(req.user!.userId, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /auth/password
 * @desc Change password
 * @access Private
 */
router.put(
  '/password',
  authenticate,
  validate(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /auth/addresses
 * @desc Add new address
 * @access Private
 */
router.post(
  '/addresses',
  authenticate,
  validate(addressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.addAddress(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /auth/addresses/:addressId
 * @desc Update address
 * @access Private
 */
router.put(
  '/addresses/:addressId',
  authenticate,
  validate(addressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.updateAddress(
        req.user!.userId, 
        req.params.addressId, 
        req.body
      );

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /auth/addresses/:addressId
 * @desc Delete address
 * @access Private
 */
router.delete(
  '/addresses/:addressId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.deleteAddress(req.user!.userId, req.params.addressId);

      res.json({
        success: true,
        message: 'Address deleted successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== ADMIN ROUTES ====================

/**
 * @route GET /auth/users
 * @desc Get all users (Admin only)
 * @access Private/Admin
 */
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const role = req.query.role as string;
      const isActive = req.query.isActive === 'true' ? true : 
                       req.query.isActive === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await AuthService.getAllUsers(page, limit, { role, isActive, search });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /auth/users/:userId/role
 * @desc Update user role (Admin only)
 * @access Private/Admin
 */
router.put(
  '/users/:userId/role',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body;
      const user = await AuthService.updateUserRole(req.params.userId, role);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /auth/users/:userId/toggle-status
 * @desc Toggle user active status (Admin only)
 * @access Private/Admin
 */
router.put(
  '/users/:userId/toggle-status',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.toggleUserStatus(req.params.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
