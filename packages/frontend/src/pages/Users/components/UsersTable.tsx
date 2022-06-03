import {
  AllAdminUsers,
  AllForwarderUsers,
  AllQuantifierUsers,
  AllUsers,
} from '@/model/users';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { UserDto, UserRole } from 'api/dist/user/types';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UsersTableRow from './UsersTableRow';
import UsersTablePagination from './UsersTablePagination';

const roleOptions = [
  { name: 'All users', value: UserRole.USER },
  { name: 'Admins', value: UserRole.ADMIN },
  { name: 'Forwarders', value: UserRole.FORWARDER },
  { name: 'Quantifiers', value: UserRole.QUANTIFIER },
];

const USERS_PER_PAGE = 10;

const UsersTable = (): JSX.Element => {
  const allAdminUsers = useRecoilValue(AllAdminUsers);
  const allForwarderUsers = useRecoilValue(AllForwarderUsers);
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const allUsers = useRecoilValue(AllUsers);
  const [tableData, setTableData] = React.useState<UserDto[]>();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(
    UserRole.USER
  );
  const [filter, setFilter] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);
  const [lastPage, setLastPage] = React.useState<number>(0);

  const applyFilter = React.useCallback(
    (data: UserDto[] | undefined): UserDto[] => {
      if (!data) return [];
      const filteredData = data.filter((user: UserDto) => {
        const userAddress = user.ethereumAddress?.toLowerCase();
        const filterData = filter.toLocaleLowerCase();

        return (
          user.nameRealized.toLowerCase().includes(filterData) ||
          userAddress?.includes(filterData)
        );
      });

      return filteredData;
    },

    [filter]
  );

  React.useEffect(() => {
    if (allUsers) {
      setTableData(allUsers);
    }
  }, [allUsers]);

  React.useEffect(() => {
    switch (selectedRole) {
      case UserRole.USER:
        setTableData(allUsers);
        break;
      case UserRole.ADMIN:
        setTableData(allAdminUsers);
        break;
      case UserRole.FORWARDER:
        setTableData(allForwarderUsers);
        break;
      case UserRole.QUANTIFIER:
        setTableData(allQuantifierUsers);
        break;
    }
    setFilter('');
  }, [
    selectedRole,
    allUsers,
    allAdminUsers,
    allForwarderUsers,
    allQuantifierUsers,
  ]);

  React.useEffect(() => {
    if (tableData) {
      setPage(1);
      const filteredData = applyFilter(tableData);

      if (filteredData.length % USERS_PER_PAGE === 0) {
        setLastPage(Math.trunc(filteredData.length / USERS_PER_PAGE));
      } else {
        setLastPage(Math.trunc(filteredData.length / USERS_PER_PAGE) + 1);
      }
    }
  }, [tableData, filter, applyFilter]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <select
          className="bg-transparent border-black"
          onChange={(event: React.ChangeEvent<HTMLSelectElement>): void =>
            setSelectedRole(UserRole[event.target.value])
          }
        >
          {roleOptions.map((option) => (
            <option key={option.name} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="flex items-center border border-black">
          <label className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size="1x"
              className="absolute transform -translate-y-1/2 top-1/2 left-3"
            />
            <input
              type="text"
              name="search"
              placeholder="Search"
              className="block pl-8 bg-transparent border-none outline-none focus:ring-0"
              value={filter}
              onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
                setFilter(event.target.value)
              }
            />
          </label>
        </div>
      </div>
      <div className="flex justify-between px-4 my-4">
        <div className="w-1/2">
          <span className="font-bold">User</span>
        </div>
        <div className="w-1/2">
          <span className="font-bold">Roles</span>
        </div>
      </div>
      <React.Suspense fallback="Loading...">
        {applyFilter(tableData).map((row, index) => {
          if (Math.trunc(index / USERS_PER_PAGE) + 1 === page) {
            return <UsersTableRow key={row._id} data={row} />;
          }
        })}
        <UsersTablePagination
          lastPage={lastPage}
          page={page}
          setPage={setPage}
        />
      </React.Suspense>
    </>
  );
};

export default UsersTable;
