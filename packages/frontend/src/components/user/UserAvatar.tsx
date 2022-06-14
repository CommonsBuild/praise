import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserDto } from 'types/dist/user/types';
import { UserAccountDto } from 'types/dist/useraccount/types';
import React from 'react';

const discordAvatarUrl = (account: UserAccountDto): string => {
  return `https://cdn.discordapp.com/avatars/${account.accountId}/${account.avatarId}.webp?size=128`;
};

interface UserAvatarProps {
  user?: UserDto;
  userAccount?: UserAccountDto;
  usePseudonym?: boolean;
}
const WrappedUserAvatar = ({
  user,
  userAccount,
  usePseudonym = false,
}: UserAvatarProps): JSX.Element => {
  const [imageLoadError, setImageLoadError] = React.useState<boolean>(false);
  if (imageLoadError || usePseudonym)
    return <FontAwesomeIcon icon={faUserCircle} size="2x" />;
  let url;
  if (user) {
    if (Array.isArray(user.accounts) && user.accounts.length > 0) {
      for (const account of user.accounts) {
        // Prefer DISCORD over others
        if (account.avatarId && account.platform === 'DISCORD') {
          url = discordAvatarUrl(account);
          break;
        }
      }
    }
  }
  if (userAccount) {
    if (userAccount.avatarId && userAccount.platform === 'DISCORD') {
      url = discordAvatarUrl(userAccount);
    }
  }

  return url ? (
    <img
      src={url}
      onError={(): void => setImageLoadError(true)}
      alt="avatar"
      className="rounded-full w-[29px] max-w-none"
    />
  ) : (
    <FontAwesomeIcon icon={faUserCircle} size="2x" />
  );
};

export const UserAvatar = React.memo(WrappedUserAvatar);
