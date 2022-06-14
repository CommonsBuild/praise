import mongoose from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserDocument, UserRole } from 'types/dist/user';

export const userSchema = new mongoose.Schema(
  {
    ethereumAddress: { type: String, required: true, unique: true },
    roles: {
      type: [
        {
          type: String,
          enum: [UserRole],
        },
      ],
      default: [UserRole.USER],
    },
    nonce: { type: String, select: false },
    accessToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoosePagination);

export const UserModel = mongoose.model<UserDocument, Pagination<UserDocument>>(
  'User',
  userSchema
);
