import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';

export const useStyles = makeStyles(() =>
  createStyles({
    chatWrapper: {
      position: 'relative',
      flexGrow: 1,
    },
    messageArea: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflowY: 'hidden',
      overflowX: 'hidden',
    },
    messageContent: {
      position: 'absolute',
    },
    scrollbar: {
      maxHeight: '100%',
      height: '100%',
    },
  }),
);
