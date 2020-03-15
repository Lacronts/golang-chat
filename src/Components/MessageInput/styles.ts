import { colors } from 'Styles/consts';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    messageInput: {
      width: '100%',
      borderRadius: '0',
      '&:hover': {
        '& $notchedOutline': {
          borderColor: colors.active,
        },
      },
      '& fieldset': {
        borderColor: colors.background.secondary,
        borderRadius: 0,
        borderLeft: 0,
        borderRight: 0,
        borderBottom: 0,
      },
    },
    innerInput: {
      fontSize: '12px',
      color: colors.white,
      '&$fieldFocused $notchedOutline': {
        borderColor: colors.active,
      },
    },
    sendIcon: {
      color: colors.active,
    },
    notchedOutline: {},
    fieldFocused: {},
  }),
);
