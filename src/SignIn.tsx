import React, { useState } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { IAppState } from 'Models';
import { AxiosError } from 'axios';

interface IDispatchProps {
  chatActions: ChatActions;
}

interface IStateProps {
  signInErrors: AxiosError;
}

type TProps = IDispatchProps & IStateProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%',
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }),
);

const SignInComponent: React.FunctionComponent<TProps> = ({ chatActions, signInErrors }: TProps) => {
  const [name, onChangeName] = useState<string>('');
  const classes = useStyles();

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeName(e.target.value);
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    chatActions.connectToRoom(name);
  };

  return (
    <Container maxWidth='xs'>
      <div className={classes.container}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Ваше имя:
        </Typography>
        <form className={classes.form} onSubmit={handleRegister}>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            label='Введите ваше имя'
            name='name'
            error={!!signInErrors}
            helperText={signInErrors && (signInErrors.response?.data || signInErrors.message)}
            autoFocus
            value={name}
            onChange={handleChangeName}
            autoComplete='off'
          />
          <Button type='submit' fullWidth variant='contained' color='primary' className={classes.submit}>
            Войти
          </Button>
        </form>
      </div>
    </Container>
  );
};

const mapStateToProps = ({ chat: { signInErrors } }: IAppState): IStateProps => {
  return {
    signInErrors,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  chatActions: new ChatActions(dispatch),
});

export const SignIn = connect<IStateProps, IDispatchProps, {}, IAppState>(mapStateToProps, mapDispatchToProps)(SignInComponent);
