import { useMutation } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { login } from '../api/authApi'
import { saveSession } from '../session'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      saveSession(session)
      navigate('/showroom')
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    loginMutation.mutate({ email, password })
  }

  const errorMessage =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : 'We could not sign you in. Please try again.'

  return (
    <main className="bg-canvas text-ink grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <section className="bg-brand text-canvas relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="border-canvas/20 absolute -top-28 -right-24 h-96 w-96 rounded-full border"
        />
        <div
          aria-hidden="true"
          className="border-accent absolute right-24 bottom-28 h-52 w-52 rotate-12 border"
        />
        <Link className="font-display relative text-2xl tracking-wide" to="/">
          Aretiva Motors
        </Link>
        <div className="relative max-w-md">
          <p className="text-canvas/65 text-xs font-semibold tracking-[0.24em] uppercase">
            Private showroom access
          </p>
          <h1 className="font-display mt-6 text-6xl leading-[0.9] tracking-[-0.04em]">
            Every detail,
            <br />
            considered.
          </h1>
          <p className="text-canvas/75 mt-7 max-w-sm leading-7">
            Your saved collection, vehicle history, and the gallery are ready
            when you are.
          </p>
        </div>
        <p className="text-canvas/65 relative text-sm">
          Engineered through every iteration.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            className="font-display text-brand text-2xl tracking-wide lg:hidden"
            to="/"
          >
            Aretiva Motors
          </Link>
          <p className="text-brand mt-12 text-xs font-semibold tracking-[0.24em] uppercase lg:mt-0">
            Welcome back
          </p>
          <h1 className="font-display mt-4 text-5xl tracking-[-0.035em]">
            Enter the gallery.
          </h1>
          <p className="text-ink/65 mt-4 leading-7">
            Use the details you registered with to continue.
          </p>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold" htmlFor="email">
                Email address
              </label>
              <input
                autoComplete="email"
                className="border-ink/25 bg-canvas focus:border-brand mt-2 min-h-12 w-full rounded-sm border px-4 transition-colors outline-none"
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <input
                autoComplete="current-password"
                className="border-ink/25 bg-canvas focus:border-brand mt-2 min-h-12 w-full rounded-sm border px-4 transition-colors outline-none"
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {loginMutation.isError ? (
              <p
                className="border-accent bg-accent/10 rounded-sm border px-4 py-3 text-sm"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              className="bg-brand text-canvas hover:bg-ink min-h-12 w-full rounded-sm px-6 font-semibold transition-colors disabled:cursor-wait disabled:opacity-70"
              disabled={loginMutation.isPending}
              type="submit"
            >
              {loginMutation.isPending
                ? 'Entering the showroom…'
                : 'Enter the showroom'}
            </button>
          </form>

          <p className="text-ink/65 mt-8 text-sm">
            New to Aretiva?{' '}
            <Link
              className="text-brand decoration-accent font-semibold underline underline-offset-4"
              to="/register"
            >
              Create an account
            </Link>
          </p>
          <Link
            className="text-ink/65 mt-8 inline-block text-sm underline underline-offset-4"
            to="/"
          >
            Back to the introduction
          </Link>
        </div>
      </section>
    </main>
  )
}
