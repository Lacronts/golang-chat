import React from 'react';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { User } from 'User';
import { IAppState, IUser } from 'Models';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { sortUsersByMessageDate } from 'Utils';

interface IStateProps {
  activeUsers: IUser[];
  targetUser: string;
}

interface IDispatchProps {
  chatActions: ChatActions;
}

type TProps = IStateProps & IDispatchProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    users: {
      flexBasis: '300px',
      borderRightWidth: '2px',
      borderRightColor: theme.palette.primary.main,
      borderRightStyle: 'solid',
    },
  }),
);

const UsersSFC: React.SFC<TProps> = ({ activeUsers, targetUser, chatActions }: TProps) => {
  const classes = useStyles();
  const users = sortUsersByMessageDate(activeUsers);

  const selectUser = (targetUser: string) => {
    chatActions.selectTargetUser(targetUser);
  };

  return (
    <div className={classes.users}>
      {users.map(user => (
        <User data={user} key={user.name} onSelect={selectUser} selectedUser={targetUser} />
      ))}
    </div>
  );
};

const mapStateToProps = ({ chat: { activeUsers, targetUser } }: IAppState): IStateProps => ({
  activeUsers,
  targetUser,
});

const mapDispatchToProps = (dispatch: Dispatch): IDispatchProps => ({
  chatActions: new ChatActions(dispatch),
});

export const Users = connect<IStateProps, IDispatchProps, {}, IAppState>(mapStateToProps, mapDispatchToProps)(UsersSFC);
