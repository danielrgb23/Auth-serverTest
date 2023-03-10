import { GetServerSideProps } from 'next';
import { FormEvent, useContext, useState } from 'react';
import { parseCookies } from 'nookies';

import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/Home.module.css';
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password
    }

    await signIn(data)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.main}>
      <label >
        E-mail
        <input type='email' value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label>
        Senha
        <input type='password' value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <button type='submit'>Entrar</button>

    </form>
  )
}

export const getServerSideProps = withSSRGuest(async (ctx: any) => {
  // console.log(ctx.serverSide)

  return {
    props: {
      
    }
  }
})
