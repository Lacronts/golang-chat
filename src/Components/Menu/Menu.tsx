import React from 'react';
import Badge from '@material-ui/core/Badge';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import { getUnreadMessages } from 'Utils';
import { useStyles } from './styles';
import { IUser } from 'Models';
import { ChatActions } from 'Redux/Actions/ChatActions';

interface IProps {
  activeUsers: IUser[];
  chatActions: ChatActions;
}

const Menu: React.SFC<IProps> = ({ activeUsers, chatActions }: IProps) => {
  const classes = useStyles();
  return (
    <div className={classes.menu}>
      <IconButton className={classes.menuIcon} onClick={chatActions.openMenu}>
        <Badge badgeContent={getUnreadMessages(activeUsers)} classes={{ badge: classes.menuBadge }}>
          <MenuIcon />
        </Badge>
      </IconButton>
    </div>
  );
};

export { Menu };
