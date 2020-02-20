import React, { useState, ChangeEvent } from 'react';
import { history } from './Utils';
import { getWebSocketHandler } from './ws';

const Login = () => {
  const [name, onChangeName] = useState('');
  const [email, onChangeEmail] = useState('');

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeName(e.target.value);
  };

  const handleChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeEmail(e.target.value);
  };

  const handleRegister = () => {
    const instance = getWebSocketHandler().init();
    instance.addEventListener('open', () => {
      history.push('/room');
    });
  };

  return (
    <>
      <div>
        Имя: <input value={name} onChange={handleChangeName} />
      </div>
      <div>
        Email: <input value={email} onChange={handleChangeEmail} />
      </div>
      <button onClick={handleRegister}>Войти</button>
    </>
  );
};

export { Login };
