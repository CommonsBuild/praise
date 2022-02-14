import { pseudonymNouns, psudonymAdjectives } from '@/utils/users';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import {
  ApiAuthGet,
  ApiAuthPatch,
  ApiQuery,
  isResponseOk,
  useAuthApiQuery,
} from './api';
import { AllPeriods } from './periods';

export enum UserRole {
  ADMIN = 'ADMIN',
  QUANTIFIER = 'QUANTIFIER',
  USER = 'USER',
}

export interface User {
  _id: string;
  createdAt: string;
  updatedAt: string;
  ethereumAddress: string;
  accounts?: UserAccount[];
  roles: UserRole[];
}

export enum UserAccountPlatform {
  DISCORD = 'DISCORD',
  TELEGRAM = 'TELEGRAM',
}

export interface UserAccount {
  _id?: string;
  id: string;
  username: string;
  profileImageUrl: string;
  platform: string; // DISCORD | TELEGRAM
}

// The request Id is used to force refresh of AllUsersQuery.
// AllUsersQuery subscribes to the value. Increase to trigger
// refresh.
const UsersRequestId = atom({
  key: 'UsersRequestId',
  default: 0,
});

export const AllUsersQuery = selector({
  key: 'AllUsersQuery',
  get: ({ get }) => {
    get(UsersRequestId);
    return get(
      ApiAuthGet({
        url: '/api/users/all?sortColumn=ethereumAddress&sortType=desc',
      })
    );
  },
});

export const AllUsers = atom<User[] | undefined>({
  key: 'AllUsers',
  default: undefined,
});

export const AllQuantifierUsers = selector({
  key: 'AllQuantifierUsers',
  get: ({ get }) => {
    const users = get(AllUsers);
    if (users) {
      return users.filter((user) => user.roles.includes(UserRole.QUANTIFIER));
    }
    return undefined;
  },
});

export const useAllUsersQuery = () => {
  const allUsersQueryResponse = useAuthApiQuery(AllUsersQuery);
  const [allUsers, setAllUsers] = useRecoilState(AllUsers);

  React.useEffect(() => {
    if (
      isResponseOk(allUsersQueryResponse) &&
      typeof allUsers === 'undefined'
    ) {
      const paginatedResponse =
        allUsersQueryResponse.data as PaginatedResponseBody<User>;
      const users = paginatedResponse.docs;
      if (Array.isArray(users) && users.length > 0) setAllUsers(users);
    }
  }, [allUsersQueryResponse, setAllUsers, allUsers]);

  return allUsersQueryResponse;
};

export const SingleUser = selectorFamily({
  key: 'SingleUser',
  get:
    (params: any) =>
    ({ get }) => {
      const { userId } = params;
      const allUsers = get(AllUsers);
      if (!allUsers) return null;
      return allUsers.filter((user) => user._id === userId)[0];
    },
});

export const SingleUserByReceiverId = selectorFamily({
  key: 'SingleUserByReceiverId',
  get:
    (params: any) =>
    ({ get }) => {
      const { receiverId } = params;
      const allUsers = get(AllUsers);
      if (!allUsers) return null;
      return allUsers.find((user) => {
        if (!user.accounts) return false;
        return user.accounts.find((account) => account._id === receiverId);
      });
    },
});

const stringToNumber = (s: string) => {
  let value = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    value = value * 256 + s.charCodeAt(i);
  }
  return value;
};

export const PseudonymForUser = selectorFamily({
  key: 'PseudonymForUser',
  get:
    (params: any) =>
    ({ get }) => {
      const { periodId, userId } = params;
      const allPeriods = get(AllPeriods);
      if (!allPeriods) return 'Loading…';
      const periodIndex = allPeriods.findIndex((p) => p._id === periodId);

      if (userId && periodIndex > -1) {
        const u = stringToNumber(userId);
        const p = stringToNumber(periodId);
        const n = pseudonymNouns[(u + p) % pseudonymNouns.length];
        const a = psudonymAdjectives[(u + p) % psudonymAdjectives.length];
        return `${a} ${n}`;
      }

      return 'Unknown user';
    },
});

export const AddUserRoleApiResponse = atom<
  AxiosResponse<unknown> | AxiosError<unknown> | null
>({
  key: 'AddUserRoleApiResponse',
  default: null,
});

// Hook that returns functions for administering users
export const useAdminUsers = () => {
  const allUsers: User[] | undefined = useRecoilValue(AllUsers);

  const addRole = useRecoilCallback(
    ({ snapshot, set }) =>
      async (userId: string, role: UserRole) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/api/admin/users/${userId}/addRole`,
              data: JSON.stringify({ role }),
            })
          )
        );

        // If OK response, add returned user object to local state
        if (isResponseOk(response)) {
          const user = response.data as User;
          if (user) {
            if (typeof allUsers !== 'undefined') {
              set(
                AllUsers,
                allUsers.map((oldUser) =>
                  oldUser._id === user._id ? user : oldUser
                )
              );
            } else {
              set(AllUsers, [user]);
            }
          }
          set(AddUserRoleApiResponse, response);
        }
        return response;
      }
  );

  const removeRole = useRecoilCallback(
    ({ snapshot, set }) =>
      async (userId: string, role: UserRole) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/api/admin/users/${userId}/removeRole`,
              data: JSON.stringify({ role }),
            })
          )
        );

        // If OK response, add returned user object to local state
        if (isResponseOk(response)) {
          const user = response.data as User;
          if (user) {
            if (typeof allUsers !== 'undefined') {
              set(
                AllUsers,
                allUsers.map((oldUser) =>
                  oldUser._id === user._id ? user : oldUser
                )
              );
            } else {
              set(AllUsers, [user]);
            }
          }
          set(AddUserRoleApiResponse, response);
        }
        return response;
      }
  );

  return { addRole, removeRole };
};
