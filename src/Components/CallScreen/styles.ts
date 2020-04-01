import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import materialGreen from '@material-ui/core/colors/green';
import materialRed from '@material-ui/core/colors/red';
import { colors } from 'Styles/consts';

interface IUseStyles {
  isVisible: boolean;
}

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      position: 'fixed',
      display: ({ isVisible }: IUseStyles) => (isVisible ? 'flex' : 'none'),
      flexDirection: 'column',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 5,
    },
    videos: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    localVideo: {
      position: 'absolute',
      width: 'auto',
      height: '160px',
      borderRadius: theme.spacing(3),
      zIndex: 1,
    },
    remoteVideo: {
      flexGrow: 1,
    },
    callWrapper: {
      position: 'fixed',
      width: 300,
      height: 400,
      top: '50%',
      left: '50%',
      transform: 'translate(-150px, -200px)',
      background: 'inherit',
      zIndex: 6,
    },
    callInnerWrapper: {
      position: 'relative',
      width: '100%',
      height: '100%',
      backdropFilter: 'blur(5px)',
    },
    declineCallIco: {
      position: 'absolute',
      bottom: '15px',
      right: '15px',
      color: materialRed[700],
    },
    title: {
      padding: `${theme.spacing(3)}px 0`,
      fontSize: '24px',
      textAlign: 'center',
      color: colors.white,
    },
    userName: {
      fontSize: '28px',
      textAlign: 'center',
      color: colors.white,
      padding: `${theme.spacing(4)}px 0`,
    },
    flipIco: {
      color: colors.active,
    },
    stopCall: {
      color: materialRed[700],
    },
    controlsWrapper: {
      width: '100vw',
      flexBasis: '60px',
      background: colors.background.main,
      borderTop: `2px solid ${colors.active}`,
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-around',
      margin: '0 auto',
      maxWidth: '640px',
    },
    acceptCallIco: {
      position: 'absolute',
      bottom: '15px',
      left: '15px',
      color: materialGreen[700],
      animation: '$call 1s infinite cubic-bezier(.36, .07, .19, .97) both',
      '&::after': {
        position: 'absolute',
        content: '""',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        borderRadius: '50%',
        animation: '$outerAnim 1s linear infinite both',
      },
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'inherit',
      backdropFilter: 'blur(5px)',
      zIndex: 4,
    },
    '@keyframes outerAnim': {
      '0%': {
        transform: 'scale(0.5)',
        boxShadow: `0 0 0 0 ${materialGreen[800]}`,
      },

      '70%': {
        transform: 'scale(1)',
        boxShadow: '0 0 5px 20px rgba(0, 0, 0, 0)',
      },

      '100%': {
        transform: 'scale(0.95)',
        boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
      },
    },

    '@keyframes call': {
      '5%': {
        transform: 'rotate3d(0, 0, 1, -7deg)',
      },
      '45%': {
        transform: 'rotate3d(0, 0, 1, -7deg)',
      },
      '10%': {
        transform: 'rotate3d(0, 0, 1, 7deg)',
      },
      '40%': {
        transform: 'rotate3d(0, 0, 1, 7deg)',
      },
      '15%': {
        transform: 'rotate3d(0, 0, 1, -7deg)',
      },
      '25%': {
        transform: 'rotate3d(0, 0, 1, -7deg)',
      },
      '35%': {
        transform: 'rotate3d(0, 0, 1, -7deg)',
      },
      '20%': {
        transform: 'rotate3d(0, 0, 1, 7deg)',
      },
      '30%': {
        transform: 'rotate3d(0, 0, 1, 7deg)',
      },
      '51%': {
        transform: 'rotate3d(0, 0, 0, 0deg)',
      },
      '100%': {
        transform: 'rotate3d(0, 0, 0, 0deg)',
      },
    },
  }),
);
