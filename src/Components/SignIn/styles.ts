import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { colors } from 'Styles/consts';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      paddingTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100vh',
      overflow: 'hidden',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    title: {
      color: colors.white,
    },
    nameInput: {
      width: '100%',
      '&:hover': {
        '& $notchedOutline': {
          borderColor: colors.active,
        },
      },
      '& fieldset': {
        borderColor: colors.active,
      },
    },
    innerInput: {
      color: colors.white,
      '&$fieldFocused $notchedOutline': {
        borderColor: colors.active,
      },
    },
    notchedOutline: {},
    fieldFocused: {},
    nameInputLabel: {
      color: colors.white,
      '&$nameInputLabelFocused': {
        color: colors.white,
      },
    },
    nameInputLabelFocused: {},
    form: {
      width: '100%',
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
      backgroundColor: colors.active,
      opacity: '0.8',
      transition: 'opacity .4s',
      color: colors.white,
      '&:hover': {
        backgroundColor: colors.active,
        opacity: '1',
      },
    },
  }),
);
