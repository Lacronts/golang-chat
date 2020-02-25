import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { history } from 'Utils';
import { getWebSocketHandler } from './ws';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { ChatActions } from 'Actions/ChatActions';

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

const chatActions = new ChatActions();

const SignIn: React.FunctionComponent = () => {
  const [name, onChangeName] = useState('');
  const [err, setErr] = useState<AxiosError>(null);
  const classes = useStyles();

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeName(e.target.value);
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    chatActions
      .checkUserID(name)
      .then(() => {
        const instance = getWebSocketHandler().init(name);
        instance.addEventListener('open', () => {
          history.push('/room');
        });
      })
      .catch((err: AxiosError) => setErr(err));
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
            error={!!err}
            helperText={err?.response.data}
            autoFocus
            value={name}
            onChange={handleChangeName}
          />
          <Button type='submit' fullWidth variant='contained' color='primary' className={classes.submit}>
            Войти
          </Button>
        </form>
      </div>
    </Container>
  );
};

export { SignIn };
