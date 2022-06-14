/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ForbiddenError, UnauthorizedError } from '@error/errors';
import { UserModel } from '@user/entities';
import { UserRole } from 'types/dist/user/types';
import { NextFunction, Request, Response } from 'express';
import { extractAccessTokenFromRequest } from './utils';
import { JwtService } from './JwtService';

export const authMiddleware = (role: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get authorization header
    const accessToken = extractAccessTokenFromRequest(req);

    // Find User with matching token
    const user = await UserModel.findOne({
      accessToken,
    });

    // No user = Forbidden
    if (!user)
      throw new UnauthorizedError('User is not authorized to access resource.');

    // Access token invalid or expired = Forbidden
    const jwtService = new JwtService();
    try {
      jwtService.verifyOrFail(accessToken);
    } catch (err) {
      throw new UnauthorizedError('User is not authorized to access resource.');
    }

    // Wrong permissions = Forbidden
    if (!user.roles.includes(role))
      throw new ForbiddenError('User is not authorized to access resource.');

    // Save auth role and current user for usage in controllers
    res.locals.authRole = role;
    res.locals.currentUser = user;

    next();
  };
};
