import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { Form } from 'react-aria-components/Form'
import { FieldError, Input, Label, TextField } from 'react-aria-components/TextField'
import { AuthErrorMessage, useRegistrationMutation } from '@/features/auth'
import { getFormDataString } from '@/shared/lib/form-data/getFormDataString'
import styles from './RegistrationForm.module.scss'

interface RegistrationFormProps {
  invitationToken: string
}

export function RegistrationForm({ invitationToken }: RegistrationFormProps) {
  const { t } = useTranslation()
  const registrationMutation = useRegistrationMutation()
  const registrationError = registrationMutation.error
  const registrationPending = registrationMutation.isPending
  const registrationActionKey = registrationPending
    ? 'auth.actions.creatingAccount'
    : 'auth.actions.register'

  const handleSubmit: NonNullable<ComponentProps<typeof Form>['onSubmit']> = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const token = getFormDataString(data, 'invitationToken').trim()
    registrationMutation.mutate({
      displayName: getFormDataString(data, 'displayName'),
      email: getFormDataString(data, 'email'),
      password: getFormDataString(data, 'password'),
      invitationToken: token,
    })
  }

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <TextField className={styles.field} name="displayName" isRequired minLength={2}>
        <Label>{t('auth.fields.displayName')}</Label>
        <Input autoComplete="name" />
        <FieldError />
      </TextField>
      <TextField className={styles.field} name="email" type="email" isRequired>
        <Label>{t('auth.fields.email')}</Label>
        <Input autoComplete="email" />
        <FieldError />
      </TextField>
      <TextField className={styles.field} name="password" type="password" isRequired minLength={12}>
        <Label>{t('auth.fields.password')}</Label>
        <Input autoComplete="new-password" />
        <FieldError />
      </TextField>
      <TextField
        className={styles.field}
        name="invitationToken"
        defaultValue={invitationToken}
        isRequired
      >
        <Label>{t('auth.fields.invitationCode')}</Label>
        <Input autoComplete="off" />
        <FieldError />
      </TextField>
      {registrationError && (
        <AuthErrorMessage
          className={styles.error}
          error={registrationError}
          fallbackKey="auth.errors.registration"
        />
      )}
      <Button className={styles.submit} type="submit" isDisabled={registrationPending}>
        {t(registrationActionKey)}
      </Button>
    </Form>
  )
}
