/* This example requires Tailwind CSS v2.0+ */
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { LoadScreen } from '@/components/ui/LoadScreen';
import { ApiAuthGet } from '@/model/api';
import { usePraiseAppVersion } from '@/model/app';
import { ActiveUserRoles, HasRole, ROLE_ADMIN } from '@/model/auth';
import { SingleSetting } from '@/model/settings';
import { AuthenticatedRoutes } from '@/navigation/AuthenticatedRoutes';
import { Nav } from '@/navigation/Nav';

export const AuthenticatedLayout = (): JSX.Element | null => {
  useRecoilValue(ApiAuthGet({ url: '/settings/all' })); //Pre-loading settings to force `ApiAuthGet` to initialise properly. Weird.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const siteNameSetting = useRecoilValue(SingleSetting('NAME'));
  const activeUserRoles = useRecoilValue(ActiveUserRoles);
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const appVersion = usePraiseAppVersion();

  return (
    <div className="h-full cursor-default">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 flex lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-opacity-75 bg-warm-gray-600" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex flex-col w-64">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 pt-2 -mr-12">
                  <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:focus:ring-warm-gray-800"
                    onClick={(): void => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <FontAwesomeIcon
                      icon={faX}
                      className="w-6 h-6 text-white dark:text-warm-gray-800"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 overflow-y-auto">
                <Nav />
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {isAdmin && appVersion.newVersionAvailable && (
        <div className="sticky top-0 p-3 text-center bg-opacity-50 bg-warm-gray-100 lg:pl-64">
          <p>
            🎉 There is a new version of the Praise out! You are running{' '}
            {appVersion.current}, latest version is {appVersion.latest}.{' '}
            <a
              href="https://github.com/commons-stack/praise/releases"
              className="font-bold"
              target="_blank"
              rel="noreferrer"
            >
              Release notes
            </a>
          </p>
        </div>
      )}

      <div className="fixed bottom-0 right-0 invisible p-1 text-xs text-right lg:visible">
        {appVersion.current}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden w-64 lg:flex lg:flex-col lg:fixed lg:inset-y-0">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-warm-gray-200">
          <Nav />
        </div>
      </div>

      <div className="flex flex-col flex-1 lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center justify-start w-full px-1 py-1 border-b shadow-sm h-14 lg:hidden bg-warm-gray-50 dark:bg-slate-900">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-warm-gray-500 hover:text-warm-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={(): void => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <FontAwesomeIcon
              icon={faBars}
              className="w-6 h-6"
              aria-hidden="true"
            />
          </button>

          {siteNameSetting && (
            <div className="flex justify-center flex-grow">
              <h1 className="font-lg">{siteNameSetting.value}</h1>
            </div>
          )}
        </div>
        <main className="flex justify-center w-full ">
          <React.Suspense fallback={<LoadScreen />}>
            <AuthenticatedRoutes userRoles={activeUserRoles} />
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};
