import { colors } from 'Styles/consts';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: { display: 'flex', flexFlow: 'column nowrap' },
    wrapper: {
      [theme.breakpoints.only('xs')]: {
        paddingTop: '50px',
      },
      display: 'flex',
      flexGrow: 1,
      backgroundColor: colors.background.main,
      color: '#fff',
    },

    chat: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
    },
    noUserSelected: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '20px',
    },
  }),
);
