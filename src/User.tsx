import React from 'react';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { ETarget } from 'Enums';
import { IUser } from 'Models';

interface IProps {
  data: IUser;
  selectedUser: string;
  onSelect: (userID: string) => void;
}

interface IUseStylesProps {
  color: string;
  isActive: boolean;
  isBroadcast: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    user: ({ isActive, isBroadcast, color }: IUseStylesProps) => ({
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
      color: isBroadcast ? theme.palette.primary.main : `rgb(${color})`,
      borderBottomColor: '#e7e8ec',
      borderBottomStyle: 'solid',
      borderBottomWidth: '1px',
      cursor: 'pointer',
      backgroundColor: isActive ? theme.palette.action.disabledBackground : null,
      fontSize: '14px',
    }),
  }),
);

const User: React.SFC<IProps> = ({ data, onSelect, selectedUser }: IProps) => {
  const isActive = data.name === selectedUser;
  const isBroadcast = data.name === ETarget.BROADCAST;
  const classes = useStyles({ isActive, isBroadcast, color: data.color });

  const handleSelectUser = () => {
    onSelect(data.name);
  };

  return (
    <div className={classes.user} onClick={handleSelectUser}>
      {isBroadcast ? 'General chat' : data.name}
    </div>
  );
};

export { User };
