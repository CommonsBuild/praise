import { Request } from 'express';
import mime from 'mime-types';
import { UploadedFile } from 'express-fileupload';
import { unlink } from 'fs/promises';
import { randomBytes } from 'crypto';
import { BadRequestError, InternalServerError } from '@/error/errors';
import { PraiseAllInput, PraiseExportInput } from '@/praise/types';
import { QueryInput } from './types';
import { logger } from './logger';

const uploadDirectory =
  process.env.NODE_ENV === 'production' ? '/usr/src/uploads/' : 'uploads/';

export const getRandomString = (bytes = 10): string => {
  const buffer = randomBytes(bytes);
  const randomString = buffer.toString('hex');

  return randomString;
};

export const getQuerySort = (input: QueryInput): Object => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sort: any = {};

  if (input.sortColumn) {
    const sortColumn: string = encodeURIComponent(input.sortColumn);
    const sortType: string | undefined = input.sortType
      ? encodeURIComponent(input.sortType)
      : undefined;
    sort[sortColumn] = sortType === 'desc' ? -1 : 1;
  }

  return sort;
};

export const getPraiseAllInput = (q: PraiseAllInput): Object => {
  const { receiver } = q;
  const query: PraiseExportInput = {};

  if (receiver) {
    query.receiver = encodeURIComponent(receiver);
  }

  return query;
};

export const getQueryInput = (q: QueryInput): Object => {
  const { sortColumn, sortType, limit, page } = q;
  const query: QueryInput = {};

  query.sortColumn = sortColumn ? encodeURIComponent(sortColumn) : undefined;
  query.sortType = sortType ? encodeURIComponent(sortType) : undefined;
  query.limit = limit ? encodeURIComponent(limit) : undefined;
  query.page = page ? encodeURIComponent(page) : undefined;

  return query;
};

function isJpg(buffer: Uint8Array): boolean {
  if (!buffer || buffer.length < 3) {
    return false;
  }

  return buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
}

function isPng(buffer: Uint8Array): boolean {
  if (!buffer || buffer.length < 8) {
    return false;
  }

  return (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

export const upload = async (req: Request, key: string): Promise<string> => {
  const file = req.files;

  if (!file) {
    throw new BadRequestError('Uploaded file is missing.');
  }

  const logo: UploadedFile = file[key] as UploadedFile;
  const chunk = logo.data.slice(0, 8);

  if (!isJpg(chunk) && !isPng(chunk)) {
    throw new BadRequestError('Uploaded file is not a valid image.');
  }

  const fileExtension: string = mime.extension(logo.mimetype) as string;
  const filename = `${getRandomString()}.${fileExtension}`;
  const path = `${uploadDirectory}${filename}`;
  await logo.mv(path);
  return filename;
};

export const removeFile = async (filename: string): Promise<void> => {
  try {
    await unlink(`${uploadDirectory}${filename}`);
  } catch (e) {
    logger.warn(`Could not find a file to remove: ${filename}`);
  }
};

export const objectsHaveSameKeys = (a: object, b: object): boolean => {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
};
