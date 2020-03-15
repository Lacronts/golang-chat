import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { colors } from 'Styles/consts';

interface IUseStylesProps {
  color: string;
  isActive: boolean;
}

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    user: ({ isActive, color }: IUseStylesProps) => ({
      display: 'flex',
      justifyContent: 'space-between',
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
      color: `rgb(${color})`,
      cursor: 'pointer',
      backgroundColor: isActive ? colors.active : null,
      fontSize: '14px',
      transition: 'all .3s',
    }),
    unreadMessages: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '10px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      color: colors.white,
      backgroundColor: colors.active,
    },
  }),
);
