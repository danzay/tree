import type { ComponentProps } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { Form } from 'react-aria-components/Form'
import { FieldError, Input, Label, TextField } from 'react-aria-components/TextField'
import { AuthErrorMessage, useInvitationMutation } from '@/features/auth'
import { InvitationResult } from '../invitation-result/InvitationResult'
import styles from './InvitationSettings.module.scss'

export function InvitationSettings() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const invitationMutation = useInvitationMutation()
  const invitationError = invitationMutation.error
  const invitationPending = invitationMutation.isPending
  const invitation = invitationMutation.data

  const handleInvitation: NonNullable<ComponentProps<typeof Form>['onSubmit']> = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    invitationMutation.mutate(String(data.get('email') ?? ''))
    setCopied(false)
  }

  const handleCopy = (invitationUrl: string) => {
    void navigator.clipboard.writeText(invitationUrl).then(() => setCopied(true))
  }

  return (
    <section className={styles.card}>
      <div>
        <p className={styles.eyebrow}>{t('account.registration.eyebrow')}</p>
        <h2>{t('account.registration.title')}</h2>
        <p className={styles.description}>{t('account.registration.description')}</p>
      </div>
      <Form className={styles.form} onSubmit={handleInvitation}>
        <TextField className={styles.field} name="email" type="email" isRequired>
          <Label>{t('account.registration.inviteEmail')}</Label>
          <Input autoComplete="email" />
          <FieldError />
        </TextField>
        <Button className={styles.create} type="submit" isDisabled={invitationPending}>
          {t('account.actions.createInvitation')}
        </Button>
      </Form>
      {invitationError && (
        <AuthErrorMessage
          className={styles.error}
          error={invitationError}
          fallbackKey="account.errors.invitation"
        />
      )}
      {invitation && (
        <InvitationResult invitation={invitation} copied={copied} onCopy={handleCopy} />
      )}
    </section>
  )
}
