import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
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
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);
  if (imageLoadError || usePseudonym)
    return <FontAwesomeIcon icon={faUserCircle} size="1x" />;

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
    <>
      {!imageLoaded && <FontAwesomeIcon icon={faUserCircle} size="1x" />}
      <img
        src={url}
        onError={(): void => setImageLoadError(true)}
        onLoad={(): void => setImageLoaded(true)}
        alt="avatar"
        className="object-contain h-[1em] rounded-full"
        style={!imageLoaded ? { display: 'none' } : {}}
      />
    </>
  ) : (
    <FontAwesomeIcon icon={faUserCircle} size="1x" />
  );
};

export const UserAvatar = React.memo(WrappedUserAvatar);
