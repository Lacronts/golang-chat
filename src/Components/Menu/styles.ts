import { colors } from 'Styles/consts';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menu: {
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      position: 'fixed',
      left: 0,
      right: 0,
      top: 0,
      textAlign: 'right',
      height: '50px',
      backgroundColor: colors.background.main,
      borderBottom: `2px solid ${colors.background.secondary}`,
    },
    menuBadge: {
      backgroundColor: colors.active,
    },
    menuIcon: {
      color: colors.white,
    },
  }),
);
