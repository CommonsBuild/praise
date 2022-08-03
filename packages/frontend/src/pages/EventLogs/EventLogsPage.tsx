import {
  faArrowDownWideShort,
  faBook,
} from '@fortawesome/free-solid-svg-icons';
import { debounce } from '@mui/material';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { MultiselectInput } from '@/components/form/MultiselectInput';
import { SearchInput } from '@/components/form/SearchInput';
import { SelectInput } from '@/components/form/SelectInput';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { PraisePage } from '@/components/ui/PraisePage';
import {
  AllEventLogTypes,
  AllEventLogsQueryParameters,
} from '@/model/eventlogs';

import { EventLogsList } from './components/EventLogsList';

const sortOptions = [
  { value: 'desc', label: 'Newest' },
  { value: 'asc', label: 'Oldest' },
];

interface filterOptionsProps {
  key: string;
  label: string;
}

interface sortOptionsProps {
  value: string;
  label: string;
}

const defaultQueryParameters = {
  sortColumn: 'createdAt',
  sortType: 'desc',
  limit: 15,
  page: 1,
  type: '',
  search: '',
} as AllEventLogsQueryParameters;

const EventLogsPage = (): JSX.Element => {
  const [selectedFilters, setSelectedFilters] = useState<filterOptionsProps[]>(
    []
  );
  const [selectedSort, setSelectedSort] = useState<sortOptionsProps>(
    sortOptions[0]
  );
  const [searchValue, setSearchValue] = useState<string>('');

  const [page, setPage] = useState<number>(1);

  const eventLogtypes = useRecoilValue(AllEventLogTypes);

  const [queryParameters, setQueryParameters] = useState(
    defaultQueryParameters
  );

  const setLocalParameters = useMemo(
    () =>
      debounce((data) => {
        const params = {
          ...defaultQueryParameters,
          sortType: data.selectedSort.value,
          type: Array.prototype.map
            .call(data.selectedFilters, (s) => s.key)
            .toString(),
          search: data.searchValue,
          page: data.page,
        };

        setQueryParameters(params);
      }, 600),
    []
  );

  useEffect(() => {
    setLocalParameters({
      selectedFilters: selectedFilters,
      selectedSort: selectedSort,
      searchValue: searchValue,
      page: page,
    });
  }, [selectedFilters, selectedSort, searchValue, page, setLocalParameters]);

  return (
    <PraisePage>
      <BreadCrumb name="Transparency Log" icon={faBook} />

      <div className="mb-5 praise-box">
        <h2 className="mb-2">Transparency Log</h2>
        <p>A log of all user actions that change the database state.</p>
      </div>

      <div className="p-0 praise-box">
        <div className="flex mb-8">
          {/* Filter */}
          <div className="w-3/12 mt-5 mb-5 ml-5 mr-4">
            {eventLogtypes && (
              <MultiselectInput
                handleChange={(e): void => {
                  setSelectedFilters(e);
                  setPage(1);
                }}
                selected={selectedFilters}
                options={eventLogtypes}
                noSelectedMessage="All log items"
              />
            )}
          </div>

          {/* Search */}
          <div className="w-5/12 mt-5 mb-5 mr-4">
            <SearchInput
              handleChange={(e): void => {
                setSearchValue(e);
                setPage(1);
              }}
              value={searchValue}
              handleClear={(): void => setSearchValue('')}
            />
          </div>

          {/* Sort */}
          <div className="w-2/12 mt-5 mb-5 ml-auto mr-5">
            <SelectInput
              handleChange={(e): void => {
                setSelectedSort(e);
                setPage(1);
              }}
              selected={selectedSort}
              options={sortOptions}
              icon={faArrowDownWideShort}
            />
          </div>
        </div>

        <Suspense fallback={<LoaderSpinner />}>
          <EventLogsList queryParameters={queryParameters} setPage={setPage} />
        </Suspense>
      </div>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default EventLogsPage;
