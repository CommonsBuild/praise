import { UserAccountModel } from '@useraccount/entities';
import { UserDocument } from '../types';
import { shortenEthAddress } from './core';

export const generateUserName = async (user: UserDocument): Promise<string> => {
  let username = '';

  const accounts = await UserAccountModel.find({ user: user._id });

  if (!accounts || accounts.length === 0) {
    username = shortenEthAddress(user.ethereumAddress);
  } else {
    const discordAccount = accounts.find((a) => a.platform === 'DISCORD');

    if (discordAccount) {
      username = discordAccount.name;
    } else {
      username = accounts[0].name;
    }
  }

  return username;
};