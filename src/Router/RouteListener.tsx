import React from 'react';
import { Route, Switch, Redirect, useLocation } from 'react-router-dom';
import { SignIn } from 'SignIn';
import { ChatRoom } from 'ChatRoom';
import { ROUTE } from 'Router/RouteConst';
import { connect } from 'react-redux';
import { IAppState } from 'Models';
import { EConnStatus } from 'Enums';

interface IStateProps {
  status: EConnStatus;
}

const RouteListenerComponent = ({ status }: IStateProps) => {
  const location = useLocation();

  if (status === EConnStatus.CLOSED && location.pathname !== ROUTE.SIGN_IN.PATH) {
    return <Redirect to={ROUTE.SIGN_IN.PATH} />;
  }

  if (status === EConnStatus.OPENED && location.pathname === ROUTE.SIGN_IN.PATH) {
    return <Redirect to={ROUTE.ROOM.PATH} />;
  }

  return (
    <Switch>
      <Route path={ROUTE.SIGN_IN.PATH} exact component={SignIn} />
      <Route path={ROUTE.ROOM.PATH} component={ChatRoom} />
    </Switch>
  );
};

const mapStateToProps = ({ connection: { status } }: IAppState): IStateProps => ({
  status,
});

export const RouteListener = connect(mapStateToProps)(RouteListenerComponent);
