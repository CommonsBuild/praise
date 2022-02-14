import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import {
  PaginatedResponseBody,
  QueryInputParsedQs,
  SearchQueryInputParsedQs,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { Request } from 'express';
import { UserModel } from './entities';
import { userListTransformer, userTransformer } from './transformers';
import { RoleChangeRequestInput, User, UserRole } from './types';

/**
 * Description
 * @param
 */
const all = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<User>>
): Promise<void> => {
  const users = await UserModel.paginate({
    ...req.query, //TODO Unchecked input
    sort: getQuerySort(req.query),
    populate: 'accounts',
  });
  if (!users) throw new InternalServerError('No users found');
  res.status(200).json(userListTransformer(res, users));
};

/**
 * Description
 * @param
 */
const single = async (
  req: Request,
  res: TypedResponse<User>
): Promise<void> => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.status(200).json(userTransformer(res, user));
};

/**
 * Description
 * @param
 */
const search = async (
  req: TypedRequestQuery<SearchQueryInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<User>>
): Promise<void> => {
  //TODO Support searching more than eth address
  const searchQuery = {
    ethereumAddress: { $regex: req.query.search },
  };

  const users = await UserModel.paginate({
    query: searchQuery,
    ...req.query, //TODO Unchecked input
    sort: getQuerySort(req.query),
  });
  if (!users) throw new NotFoundError('User');

  res.status(200).json(userListTransformer(res, users));
};

/**
 * Description
 * @param
 */
const addRole = async (
  req: TypedRequestBody<RoleChangeRequestInput>,
  res: TypedResponse<User>
): Promise<void> => {
  const user = await UserModel.findById(req.params.id).populate('accounts');
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');
  if (!(role in UserRole)) throw new BadRequestError('Invalid role');

  if (!user.roles.includes(role)) {
    user.roles.push(role);
    user.accessToken = undefined;
    user.nonce = undefined;
    await user.save();
  }
  res.status(200).json(userTransformer(res, user));
};

/**
 * Description
 * @param
 */
const removeRole = async (
  req: TypedRequestBody<RoleChangeRequestInput>,
  res: TypedResponse<User>
): Promise<void> => {
  const user = await UserModel.findById(req.params.id).populate('accounts');
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');

  const roleIndex = user.roles.indexOf(role);

  if (roleIndex > -1) {
    user.roles.splice(roleIndex, 1);
    user.accessToken = undefined;
    user.nonce = undefined;
    await user.save();
  }
  res.status(200).json(userTransformer(res, user));
};

export { all, single, search, addRole, removeRole };
