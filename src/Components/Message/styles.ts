import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { colors } from 'Styles/consts';

interface IUseStylesProps {
  userColor: string;
  isCurrent: boolean;
  textLength: number;
}

const TEXT_LENGTH_FOR_TOGGLE = 30;

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      position: 'relative',
      display: 'flex',
      padding: theme.spacing(0.5),
    },
    messageWrapper: (props: IUseStylesProps) => ({
      position: 'relative',
      display: 'inline-block',
      padding: `${theme.spacing(0.5)}px ${theme.spacing(1)}px`,
      borderRadius: '10px',
      maxWidth: '75%',
      marginLeft: props.isCurrent ? 'auto' : null,
      backgroundColor: props.isCurrent ? colors.active : colors.background.secondary,
      color: colors.white,
    }),
    withTimeWrapper: (props: IUseStylesProps) => {
      const isWide = props.textLength > TEXT_LENGTH_FOR_TOGGLE;
      if (isWide) {
        return null;
      }
      return { display: 'flex', alignItems: 'flex-end' };
    },
    time: {
      fontSize: '8px',
      color: colors.grey,
      paddingLeft: theme.spacing(0.5),
      textAlign: 'right',
    },
    user: (props: IUseStylesProps) => ({
      display: props.isCurrent ? 'none' : null,
      fontSize: '10px',
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: `rgb(${props.userColor})`,
    }),
    message: {
      fontSize: '12px',
    },
  }),
);
