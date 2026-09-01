import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { FieldError, Input, Label, TextField } from 'react-aria-components/TextField'
import { Form } from 'react-aria-components/Form'
import { AuthErrorMessage, useLoginMutation } from '@/features/auth'
import { getFormDataString } from '@/shared/lib/form-data/getFormDataString'
import styles from './LoginForm.module.scss'

export function LoginForm() {
  const { t } = useTranslation()
  const loginMutation = useLoginMutation()
  const loginError = loginMutation.error
  const loginPending = loginMutation.isPending
  const loginActionKey = loginPending ? 'auth.actions.signingIn' : 'auth.actions.signIn'

  const handleSubmit: NonNullable<ComponentProps<typeof Form>['onSubmit']> = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    loginMutation.mutate({
      email: getFormDataString(data, 'email'),
      password: getFormDataString(data, 'password'),
    })
  }

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <TextField className={styles.field} name="email" type="email" isRequired>
        <Label>{t('auth.fields.email')}</Label>
        <Input autoComplete="email" />
        <FieldError />
      </TextField>
      <TextField className={styles.field} name="password" type="password" isRequired minLength={12}>
        <Label>{t('auth.fields.password')}</Label>
        <Input autoComplete="current-password" />
        <FieldError />
      </TextField>
      {loginError && (
        <AuthErrorMessage
          className={styles.error}
          error={loginError}
          fallbackKey="auth.errors.login"
        />
      )}
      <Button className={styles.submit} type="submit" isDisabled={loginPending}>
        {t(loginActionKey)}
      </Button>
    </Form>
  )
}
