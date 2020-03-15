import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { RouteListener } from 'Router/RouteListener';
import { colors } from 'Styles/consts';

const useStyles = makeStyles(() =>
  createStyles({
    main: {
      //minHeight: '100vh',
      backgroundColor: colors.background.secondary,
    },
  }),
);

const App: React.FunctionComponent = () => {
  const classes = useStyles();
  return (
    <main className={classes.main}>
      <CssBaseline />
      <RouteListener />
    </main>
  );
};

export default App;
