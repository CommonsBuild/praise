import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import difference from 'lodash/difference';
import { ROLE_ADMIN, ROLE_QUANTIFIER } from '@/model/auth';

const StartPage = React.lazy(() => import('@/pages/Start/StartPage'));
const SettingsPage = React.lazy(() => import('@/pages/Settings/SettingsPage'));
const UserDetailsPage = React.lazy(
  () => import('@/pages/UserDetails/UserDetailsPage')
);
const UsersPage = React.lazy(() => import('@/pages/Users/UsersPage'));

const PeriodsPage = React.lazy(() => import('@/pages/Periods/PeriodsPage'));
const PeriodsCreateUpdatePage = React.lazy(
  () => import('@/pages/Periods/Create/PeriodCreatePage')
);
const PeriodDetailsPage = React.lazy(
  () => import('@/pages/Periods/Details/PeriodDetailsPage')
);
const PeriodReceiverSummaryPage = React.lazy(
  () => import('@/pages/Periods/ReceiverSummary/ReceiverSummaryPage')
);
const PeriodGiverSummaryPage = React.lazy(
  () => import('@/pages/Periods/GiverSummary/GiverSummaryPage')
);
const PeriodQuantifierSummaryPage = React.lazy(
  () => import('@/pages/Periods/QuantifierSummary/QuantifierSummaryPage')
);

const PraiseDetailsPage = React.lazy(
  () => import('@/pages/PraiseDetails/PraiseDetailsPage')
);

const QuantifyPeriodPage = React.lazy(
  () => import('@/pages/QuantifyPeriod/QuantifyPeriodPage')
);
const QuantifyPage = React.lazy(
  () => import('@/pages/QuantifyPeriodReceiver/QuantifyPeriodReceiverPage')
);

const EventLogsPage = React.lazy(
  () => import('@/pages/EventLogs/EventLogsPage')
);

interface AuthRouteProps {
  children: JSX.Element;
  userRoles: string[];
  path: string;
  exact?: boolean;
  roles?: string[];
}
// A Route that takes an array of roles as argument and redirects
// to frontpage if user do not belong to any of the given roles
const AuthRoute = ({
  children,
  userRoles,
  path,
  exact = false,
  roles = [],
}: AuthRouteProps): JSX.Element => {
  // Check if user.roles contain all required roles
  const hasRequiredRoles = difference(roles, userRoles).length === 0;

  return (
    <Route
      path={path}
      exact={exact}
      render={(): JSX.Element =>
        hasRequiredRoles ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/404',
            }}
          />
        )
      }
    />
  );
};

interface Props {
  userRoles: string[];
}

export const AuthenticatedRoutes = ({
  userRoles,
}: Props): JSX.Element | null => {
  return (
    <Switch>
      <Route exact path={'/users'}>
        <UsersPage />
      </Route>

      <Route path={'/users/:userId'}>
        <UserDetailsPage />
      </Route>

      <Route exact path={'/periods'}>
        <PeriodsPage />
      </Route>

      <AuthRoute
        userRoles={userRoles}
        roles={[ROLE_ADMIN]}
        path={'/periods/createupdate'}
      >
        <PeriodsCreateUpdatePage />
      </AuthRoute>

      <Route path="/periods/:periodId/receiver/:receiverId">
        <PeriodReceiverSummaryPage />
      </Route>

      <Route path="/periods/:periodId/giver/:giverId">
        <PeriodGiverSummaryPage />
      </Route>

      <Route path="/periods/:periodId/quantifier/:quantifierId">
        <PeriodQuantifierSummaryPage />
      </Route>

      <Route exact path="/eventlogs">
        <EventLogsPage />
      </Route>

      <AuthRoute
        userRoles={userRoles}
        roles={[ROLE_QUANTIFIER]}
        path={'/periods/:periodId/quantify/receiver/:receiverId'}
      >
        <QuantifyPage />
      </AuthRoute>

      <AuthRoute
        userRoles={userRoles}
        roles={[ROLE_QUANTIFIER]}
        path={'/periods/:periodId/quantify'}
      >
        <QuantifyPeriodPage />
      </AuthRoute>

      <Route path={'/periods/:periodId'}>
        <PeriodDetailsPage />
      </Route>

      <Route path={'/periods'}>
        <PeriodsPage />
      </Route>

      <Route path="/praise/:praiseId">
        <PraiseDetailsPage />
      </Route>

      <AuthRoute userRoles={userRoles} roles={[ROLE_ADMIN]} path={'/settings'}>
        <SettingsPage />
      </AuthRoute>

      <Route exact path="/">
        <StartPage />
      </Route>

      <Route path="/*">
        <Redirect
          to={{
            pathname: '/404',
          }}
        />
      </Route>
    </Switch>
  );
};
