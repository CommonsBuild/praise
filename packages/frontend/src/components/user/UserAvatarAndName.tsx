import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { SingleUser } from '@/model/users';
import { classNames } from '@/utils/index';

import { UserAvatar } from './UserAvatar';
import { UserName } from './UserName';
import { UserPopover } from './UserPopover';

interface UserNameProps {
  user?: UserDto;
  userId?: string | undefined;
  userAccount?: UserAccountDto;
  usePseudonym?: boolean;
  periodId?: string;
  avatarClassName?: string;
  nameClassName?: string;
}

const WrappedUserAvatarAndName = ({
  user,
  userId,
  userAccount,
  usePseudonym = false,
  periodId,
  avatarClassName,
  nameClassName,
}: UserNameProps): JSX.Element | null => {
  const userFromGlobalState = useRecoilValue(SingleUser(userId));

  if ((!user && !userId && !userAccount) || (usePseudonym && !periodId))
    return null;

  const mergedUser = user ? user : userFromGlobalState;

  return (
    <UserPopover
      usePseudonym={usePseudonym}
      userAccount={userAccount}
      user={mergedUser}
    >
      <div className="flex whitespace-nowrap">
        <div className={classNames('flex items-center pr-2', avatarClassName)}>
          <UserAvatar
            user={mergedUser}
            userAccount={userAccount}
            usePseudonym={usePseudonym}
          />
        </div>
        <div className={classNames('flex items-center', nameClassName)}>
          <UserName
            user={mergedUser}
            userAccount={userAccount}
            usePseudonym={usePseudonym}
            periodId={periodId}
          />
        </div>
      </div>
    </UserPopover>
  );
};

export const UserAvatarAndName = React.memo(WrappedUserAvatarAndName);
