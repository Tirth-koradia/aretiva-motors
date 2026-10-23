import { useMutation } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { register } from '../api/authApi'

export function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const registrationMutation = useMutation({
    mutationFn: register,
    onSuccess: () => navigate('/login'),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    registrationMutation.mutate({ full_name: fullName, email, password })
  }

  const errorMessage =
    registrationMutation.error instanceof Error
      ? registrationMutation.error.message
      : 'We could not create your account. Please try again.'

  return (
    <main className="bg-canvas text-ink flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
      <div className="border-ink/15 bg-canvas grid w-full max-w-5xl overflow-hidden border lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="bg-mist border-ink/15 relative hidden overflow-hidden border-r p-10 lg:block">
          <div
            aria-hidden="true"
            className="border-brand/30 absolute -top-16 -left-24 h-72 w-72 rounded-full border"
          />
          <div
            aria-hidden="true"
            className="bg-accent absolute right-10 bottom-10 h-24 w-24"
          />
          <Link
            className="font-display text-brand relative text-2xl tracking-wide"
            to="/"
          >
            Aretiva Motors
          </Link>
          <div className="relative mt-28 max-w-xs">
            <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
              The considered route
            </p>
            <h1 className="font-display mt-5 text-5xl leading-[0.92] tracking-[-0.04em]">
              Begin with a better way to browse.
            </h1>
            <p className="text-ink/65 mt-7 leading-7">
              Build a private shortlist and explore each vehicle with every
              useful detail in one place.
            </p>
          </div>
        </aside>

        <section className="px-6 py-10 sm:px-12 sm:py-14">
          <Link
            className="font-display text-brand text-2xl tracking-wide lg:hidden"
            to="/"
          >
            Aretiva Motors
          </Link>
          <p className="text-brand mt-10 text-xs font-semibold tracking-[0.24em] uppercase lg:mt-0">
            Create an account
          </p>
          <h1 className="font-display mt-4 text-5xl tracking-[-0.035em]">
            Your gallery awaits.
          </h1>
          <p className="text-ink/65 mt-4 max-w-lg leading-7">
            Create a customer account to enter the showroom. Administrator
            access is managed separately.
          </p>

          <form className="mt-9 grid gap-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold" htmlFor="full-name">
                Full name
              </label>
              <input
                autoComplete="name"
                className="border-ink/25 bg-canvas focus:border-brand mt-2 min-h-12 w-full rounded-sm border px-4 transition-colors outline-none"
                id="full-name"
                name="full-name"
                onChange={(event) => setFullName(event.target.value)}
                required
                value={fullName}
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="register-email">
                Email address
              </label>
              <input
                autoComplete="email"
                className="border-ink/25 bg-canvas focus:border-brand mt-2 min-h-12 w-full rounded-sm border px-4 transition-colors outline-none"
                id="register-email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="register-password"
              >
                Password
              </label>
              <input
                autoComplete="new-password"
                className="border-ink/25 bg-canvas focus:border-brand mt-2 min-h-12 w-full rounded-sm border px-4 transition-colors outline-none"
                id="register-password"
                minLength={12}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              <p className="text-ink/55 mt-2 text-xs">
                Use at least 12 characters.
              </p>
            </div>

            {registrationMutation.isError ? (
              <p
                className="border-accent bg-accent/10 rounded-sm border px-4 py-3 text-sm"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              className="bg-brand text-canvas hover:bg-ink mt-2 min-h-12 rounded-sm px-6 font-semibold transition-colors disabled:cursor-wait disabled:opacity-70"
              disabled={registrationMutation.isPending}
              type="submit"
            >
              {registrationMutation.isPending
                ? 'Creating your account…'
                : 'Create customer account'}
            </button>
          </form>

          <p className="text-ink/65 mt-7 text-sm">
            Already registered?{' '}
            <Link
              className="text-brand decoration-accent font-semibold underline underline-offset-4"
              to="/login"
            >
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
