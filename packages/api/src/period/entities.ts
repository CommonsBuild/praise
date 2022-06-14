import { PeriodDocument, PeriodStatusType } from 'types/dist/period/types';
import mongoose from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { endDateValidators } from './validators';

export const periodSchema = new mongoose.Schema<PeriodDocument>(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 64 },
    status: {
      type: String,
      enum: PeriodStatusType,
      default: PeriodStatusType.OPEN,
    },
    endDate: {
      type: Date,
      required: true,
      validate: endDateValidators,
    },
  },
  {
    timestamps: true,
  }
);

periodSchema.plugin(mongoosePagination);

const PeriodModel = mongoose.model<PeriodDocument, Pagination<PeriodDocument>>(
  'Period',
  periodSchema
);

export { PeriodModel };
