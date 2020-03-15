import { colors } from 'Styles/consts';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    selectedUserWrapper: {
      height: '50px',
    },
    selectedUser: {
      fontSize: '16px',
      fontWeight: 700,
      backgroundColor: colors.background.secondary,
      borderBottom: `2px solid ${colors.background.secondary}`,
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
      display: 'flex',
      alignItems: 'center',
      height: '50px',
    },
    status: {
      color: colors.grey,
      fontSize: '12px',
      paddingLeft: '8px',
      transform: 'translateY(2px)',
    },
  }),
);
