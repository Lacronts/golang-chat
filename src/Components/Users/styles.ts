import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { colors } from 'Styles/consts';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

interface IUseStylesProps {
  isOpen: boolean;
}

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: ({ isOpen }: IUseStylesProps) => {
      return {
        [theme.breakpoints.down('xs')]: {
          position: 'fixed',
          width: '300px',
          top: 0,
          bottom: 0,
          left: 0,
          boxShadow: theme.shadows[24],
          zIndex: 2,
          backgroundColor: colors.background.main,
        },
        [theme.breakpoints.between('sm', 'md')]: {
          flexBasis: '200px',
          transform: 'none',
        },
        [theme.breakpoints.up('md')]: {
          flexBasis: '300px',
          transform: 'none',
        },
        transition: 'transform .4s',
        transform: isOpen ? null : 'translate3d(-300px, 0, 0)',
        borderRight: '2px solid #213040',
      };
    },
    header: {
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50px',
      borderBottom: `2px solid ${colors.background.secondary}`,
    },
    backdrop: {
      position: 'fixed',
      backdropFilter: 'blur(5px)',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      animation: '$backdrop-animation .4s',
    },
    '@keyframes backdrop-animation': {
      '0%': {
        backdropFilter: 'blur(0px)',
      },
      '100%': {
        backdropFilter: 'blur(5px)',
      },
    },
  }),
);
