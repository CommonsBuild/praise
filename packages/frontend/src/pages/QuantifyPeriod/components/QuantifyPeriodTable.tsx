/* eslint-disable react/jsx-key */
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import {
  PeriodPageParams,
  PeriodQuantifierReceivers,
  QuantifierReceiverData,
} from '@/model/periods';
import { SinglePeriodSettingValueRealized } from '@/model/periodsettings';
import { classNames } from '@/utils/index';

const DoneLabel = (): JSX.Element => {
  return (
    <div className="pl-1 pr-1 ml-2 text-xs text-white no-underline bg-green-400 py-[3px] rounded inline-block relative top-[-1px]">
      <FontAwesomeIcon icon={faCheckCircle} size="1x" className="mr-2" />
      Done
    </div>
  );
};

export const QuantifyPeriodTable = (): JSX.Element => {
  const history = useHistory();
  const { periodId } = useParams<PeriodPageParams>();
  const data = useRecoilValue(PeriodQuantifierReceivers(periodId));
  const usePseudonyms = useRecoilValue(
    SinglePeriodSettingValueRealized({
      periodId,
      key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    })
  ) as boolean;
  const columns = React.useMemo(
    () => [
      {
        Header: 'Receiver',
        accessor: 'receiver.name',
        className: 'pl-5 text-left',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => {
          return (
            <UserAvatarAndName
              userAccount={data.row.original.receiver}
              usePseudonym={usePseudonyms}
              periodId={data.row.original.periodId}
              avatarClassName="text-2xl"
            />
          );
        },
      },
      {
        Header: 'Remaining items',
        accessor: 'count',
        className: 'text-right',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): string | null => {
          const item = data.row.original;
          if (!item) return null;
          return `${item.count - item.done} / ${item.count}`;
        },
      },
      {
        Header: '',
        accessor: 'done',
        className: 'pr-5 text-center',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element | null => {
          const item = data.row.original;
          if (!item) return null;
          return item.count - item.done === 0 ? (
            <div className="w-full text-right">
              <DoneLabel />
            </div>
          ) : null;
        },
      },
    ],
    [usePseudonyms]
  );

  const options = {
    columns,
    data: data ? data : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleClick = (data: QuantifierReceiverData) => () => {
    history.push(
      `/periods/${data.periodId}/quantify/receiver/${data.receiver._id}`
    );
  };
  return (
    <table
      id="periods-table"
      className="w-full table-auto"
      {...getTableProps()}
    >
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const className = (column as any).className as string;
              return (
                <th
                  className={classNames(className, 'mb-2')}
                  {...column.getHeaderProps()}
                >
                  {column.render('Header')}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr
              className="cursor-pointer hover:bg-warm-gray-100 dark:hover:bg-slate-500"
              id=""
              {...row.getRowProps()}
              onClick={handleClick(row.original as QuantifierReceiverData)}
            >
              {row.cells.map((cell) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const className = (cell.column as any).className as string;
                return (
                  <td
                    {...cell.getCellProps()}
                    className={classNames(className, 'py-3')}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
