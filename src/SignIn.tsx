import React, { useState } from 'react';
import { history } from 'Utils';
import { getWebSocketHandler } from './ws';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

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

const SignIn = () => {
  const [name, onChangeName] = useState('');
  const classes = useStyles();

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeName(e.target.value);
  };

  const handleRegister = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const instance = getWebSocketHandler().init(name);
    instance.addEventListener('open', () => {
      history.push('/room');
    });
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
        <form className={classes.form} noValidate>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            label='Введите ваше имя'
            name='name'
            autoFocus
            value={name}
            onChange={handleChangeName}
          />
          <Button fullWidth variant='contained' color='primary' className={classes.submit} onClick={handleRegister}>
            Войти
          </Button>
        </form>
      </div>
    </Container>
  );
};

export { SignIn };
