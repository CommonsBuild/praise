import {
  ActiveUserRoles,
  ROLE_ADMIN,
  ROLE_QUANTIFIER,
  SessionToken,
} from '@/model/auth';
import { EthState } from '@/model/eth';
import * as localStorage from '@/model/localStorage';
import ActivatePage from '@/pages/Activate/ActivatePage';
import ErrorPage from '@/pages/ErrorPage';
import LoginPage from '@/pages/Login/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SettingsPage from '@/pages/Settings/SettingsPage';
import StartPage from '@/pages/Start/StartPage';
import React, { FC } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { StartupLoader } from '../startupLoader';
import Nav from './Nav';

const MyPraisePage = React.lazy(() => import('@/pages/MyPraise/MyPraisePage'));
const UsersPage = React.lazy(() => import('@/pages/Users/UsersPage'));

const PeriodsPage = React.lazy(() => import('@/pages/Periods/PeriodsPage'));
const PeriodsCreateUpdatePage = React.lazy(
  () => import('@/pages/Periods/Create/PeriodCreatePage')
);
const PeriodDetailPage = React.lazy(
  () => import('@/pages/Periods/Details/PeriodDetailsPage')
);
const PeriodReceiverSummaryPage = React.lazy(
  () => import('@/pages/Periods/ReceiverSummary/ReceiverSummaryPage')
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

interface LoggedInOnlyRouteProps {
  exact?: boolean;
  path: string;
}
// A Route that requires user to be logged in
const LoggedInOnlyRoute: FC<LoggedInOnlyRouteProps> = ({
  children,
  ...props
}) => {
  const ethState = useRecoilValue(EthState);
  const [sessionToken, setSessionToken] = useRecoilState(SessionToken);
  React.useEffect(() => {
    setSessionToken(localStorage.getSessionToken(ethState.account));
  }, [ethState.account, setSessionToken]);
  // Token exists: Show content
  // Token undefined: Unknown state => wait
  // Token null: Token doesn't exist => login
  return (
    <Route
      {...props}
      render={({ location }) =>
        sessionToken ? (
          children
        ) : sessionToken === undefined ? null : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

interface AuthRouteProps {
  exact?: boolean;
  path: string;
  roles: string[];
}
// A Route that takes an array of roles as argument and redirects
// to frontpage if user do not belong to any of the given roles
const AuthRoute: FC<AuthRouteProps> = ({ children, ...props }) => {
  const userRoles = useRecoilValue(ActiveUserRoles);

  let authenticated = false;
  for (const role of props.roles) {
    if (userRoles?.includes(role)) {
      authenticated = true;
      break;
    }
  }

  return (
    <Route
      {...props}
      render={({ location }) =>
        authenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

const SubPages = () => {
  return (
    <Switch>
      <Route exact path="/mypraise">
        <MyPraisePage />
      </Route>

      <AuthRoute roles={[ROLE_ADMIN]} path={`/pool`}>
        <UsersPage />
      </AuthRoute>

      <Route exact path={`/periods`}>
        <PeriodsPage />
      </Route>

      <AuthRoute roles={[ROLE_ADMIN]} path={`/periods/createupdate`}>
        <PeriodsCreateUpdatePage />
      </AuthRoute>

      <Route exact path="/period/:periodId/receiver/:receiverId">
        <PeriodReceiverSummaryPage />
      </Route>
      <Route exact path={`/period/:periodId`}>
        <PeriodDetailPage />
      </Route>

      <Route exact path="/praise/:praiseId">
        <PraiseDetailsPage />
      </Route>

      <AuthRoute
        roles={[ROLE_QUANTIFIER]}
        path={`/quantify/period/:periodId/receiver/:receiverId`}
      >
        <QuantifyPage />
      </AuthRoute>
      <AuthRoute roles={[ROLE_QUANTIFIER]} path={`/quantify/period/:periodId`}>
        <QuantifyPeriodPage />
      </AuthRoute>

      <AuthRoute roles={[ROLE_ADMIN]} path={`/settings`}>
        <SettingsPage />
      </AuthRoute>

      <Route exact path="/">
        <StartPage />
      </Route>

      <Route path="/*">
        <NotFoundPage />
      </Route>
    </Switch>
  );
};

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/activate">
        <ActivatePage />
      </Route>
      <Route exact path="/login">
        <LoginPage />
      </Route>
      <Route exact path="/404">
        <ErrorPage error={{ message: 'Not found' }} />
      </Route>
      <LoggedInOnlyRoute path="/">
        <StartupLoader />
        <div className="flex min-h-screen">
          <Nav />
          <div className="flex w-full">
            <div className="w-[920px] pt-4 px-5">
              <div>
                <SubPages />
              </div>
            </div>
          </div>
        </div>
      </LoggedInOnlyRoute>
    </Switch>
  );
};

export default Routes;
