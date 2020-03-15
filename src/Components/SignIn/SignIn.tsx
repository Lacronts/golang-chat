import React, { useState } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { IAppState } from 'Models';
import { AxiosError } from 'axios';
import { useStyles } from './styles';

interface IDispatchProps {
  chatActions: ChatActions;
}

interface IStateProps {
  signInErrors: AxiosError;
}

type TProps = IDispatchProps & IStateProps;

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
        <Typography component='h1' variant='h5' className={classes.title}>
          Ваше имя:
        </Typography>
        <form className={classes.form} onSubmit={handleRegister}>
          <TextField
            className={classes.nameInput}
            variant='outlined'
            margin='normal'
            required
            fullWidth
            label='Введите ваше имя'
            placeholder='Ваше имя'
            name='name'
            error={!!signInErrors}
            helperText={signInErrors && (signInErrors.response?.data || signInErrors.message)}
            autoFocus
            value={name}
            onChange={handleChangeName}
            autoComplete='off'
            InputLabelProps={{
              classes: {
                root: classes.nameInputLabel,
                focused: classes.nameInputLabelFocused,
              },
            }}
            InputProps={{
              classes: {
                root: classes.innerInput,
                focused: classes.fieldFocused,
                notchedOutline: classes.notchedOutline,
              },
            }}
          />
          <Button type='submit' fullWidth variant='contained' className={classes.submit}>
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
