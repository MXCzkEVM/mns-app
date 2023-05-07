import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Helper, Typography } from '@ensdomains/thorin'

import { Spacer } from '@app/components/@atoms/Spacer'
import { Outlink } from '@app/components/Outlink'

import { Steps } from './Steps'
import { AlignedDropdown, ButtonContainer, CheckButton } from './shared'
import { isDnsSecEnabled } from './utils'

const HelperLinks = [
  {
    label: 'Namecheap',
    href: 'https://www.namecheap.com/support/knowledgebase/article.aspx/9722/2232/managing-dnssec-for-domains-pointed-to-custom-dns/',
  },
  {
    label: 'Domain.com',
    href: 'https://manage.vip.domain.com/kb/answer/1909',
  },
  {
    label: 'Google domains',
    href: 'https://support.google.com/domains/answer/6387342',
  },
  {
    label: 'Dreamhost',
    href: 'https://help.dreamhost.com/hc/en-us/articles/219539467-DNSSEC-overview',
  },
  {
    label: 'Hover',
    href: 'https://help.hover.com/hc/en-us/articles/217281647-DNSSEC-services',
  },
  {
    label: 'GoDaddy',
    href: 'https://godaddy.com/help/enable-dnssec-on-my-domain-6420',
  },
  {
    label: 'Bluehost',
    href: 'https://cp.cn.bluehost.com/kb/answer/1909',
  },
  {
    label: 'Cloudflare',
    href: 'https://developers.cloudflare.com/dns/additional-options/dnssec/#enable-dnssec',
  },
  {
    label: 'HostGator',
    href: 'https://www.hostgator.com/help/article/resellerclub-dnssec-domain-name-system-security-extensions',
  },
]

enum Errors {
  NOT_CHECKED,
  DNSSEC_NOT_ENABLED,
}

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const EnableDNSSEC = ({
  setCurrentStep,
  name,
}: {
  setCurrentStep: (arg: number) => void
  name: string
}) => {
  const [errorState, setErrorState] = useState(Errors.NOT_CHECKED)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation('dnssec')

  const handleCheck = async () => {
    setIsLoading(true)
    const hasDnsSecEnabled = await isDnsSecEnabled(name as string)
    if (hasDnsSecEnabled) {
      setCurrentStep(1)
      return
    }
    setErrorState(Errors.DNSSEC_NOT_ENABLED)
    setIsLoading(false)
  }

  return (
    <Container>
      <Typography fontVariant="extraLargeBold">{t('enableDNSSEC.title')}</Typography>
      <Spacer $height="4" />
      <Typography>{t('enableDNSSEC.instruction')}</Typography>
      <Spacer $height="3" />
      <Typography>{t('enableDNSSEC.registrarHelp')}</Typography>
      <Spacer $height="5" />
      <AlignedDropdown
        width={200}
        height={200}
        direction="down"
        // needed for no line breaks in buttons
        items={HelperLinks.map((link) => ({
          label: link.label,
          wrapper: (children, key) => (
            <a
              target="_blank"
              rel="noreferrer"
              href={link.href}
              key={key}
              // needed for buttons to maintain the width of the dropdown
              style={{ width: '100%', textAlign: 'left' }}
            >
              {children}
            </a>
          ),
        }))}
        label={t('general.domainRegistrar')}
      />
      <Spacer $height="3" />
      <Outlink target="_blank" href={`https://who.is/whois/${name}`}>
        {t('enableDNSSEC.findRegistrar')}
      </Outlink>
      <Spacer $height="5" />
      {errorState === Errors.DNSSEC_NOT_ENABLED && (
        <>
          <Helper type="info">{t('enableDNSSEC.DNSSECNotEnabled')}</Helper>
          <Spacer $height="6" />
        </>
      )}
      <Steps
        {...{
          currentStep: 0,
          stepStatus: ['inProgress', 'notStarted', 'notStarted', 'notStarted'],
        }}
      />
      <Spacer $height="5" />
      <ButtonContainer>
        <CheckButton
          onClick={handleCheck}
          size="small"
          loading={isLoading}
          disabled={!name}
          data-testid="dnssec-check-button"
        >
          {t('action.check', { ns: 'common' })}
        </CheckButton>
      </ButtonContainer>
    </Container>
  )
}
