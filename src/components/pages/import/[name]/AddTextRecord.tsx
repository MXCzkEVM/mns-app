import { isAddress } from '@ethersproject/address'
import { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useAccount } from 'wagmi'

import { DNSProver } from '@ensdomains/dnsprovejs'
import { Button, Helper, Typography } from '@ensdomains/thorin'

import { Spacer } from '@app/components/@atoms/Spacer'
import { IconCopyAnimated } from '@app/components/IconCopyAnimated'
import { Outlink } from '@app/components/Outlink'
import { useCopied } from '@app/hooks/useCopied'
import { useBreakpoint } from '@app/utils/BreakpointProvider'
import { shortenAddress } from '@app/utils/utils'

import { Steps } from './Steps'
import { AlignedDropdown, ButtonContainer, CheckButton } from './shared'
import { DNS_OVER_HTTP_ENDPOINT, getDnsOwner } from './utils'

const HelperLinks = [
  {
    label: 'registrars.namecheap',
    href: 'https://www.namecheap.com/support/knowledgebase/article.aspx/317/2237/how-do-i-add-txtspfdkimdmarc-records-for-my-domain/',
  },
  {
    label: 'registrars.domaindotcom',
    href: 'https://www.domain.com/help/article/dns-management-how-to-update-txt-spf-records',
  },
  {
    label: 'registrars.googledomains',
    href: 'https://support.google.com/domains/answer/3290350?hl=en',
  },
  {
    label: 'registrars.dreamhost',
    href: 'https://help.dreamhost.com/hc/en-us/articles/360035516812-Adding-custom-DNS-records',
  },
  {
    label: 'registrars.hover',
    href: 'https://help.hover.com/hc/en-us/articles/217282457-Managing-DNS-records-',
  },
  {
    label: 'registrars.godaddy',
    href: 'https://godaddy.com/help/manage-dns-records-680',
  },
  {
    label: 'registrars.bluehost',
    href: 'https://www.bluehost.com/help/article/dns-management-add-edit-or-delete-dns-entries',
  },
  {
    label: 'registrars.cloudflare',
    href: 'https://developers.cloudflare.com/dns/additional-options/dnssec/#enable-dnssec',
  },
  {
    label: 'registrars.hostgator',
    href: 'https://www.hostgator.com/help/article/changing-dns-records',
  },
]

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ButtonInner = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    height: 48px;
    padding: 0 ${theme.space['2.5']};
  `,
)

const ButtonRow = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.space['2.5']};
    width: 100%;
  `,
)

const CopyableRightContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.space['1.5']};
  `,
)

const Copyable = ({
  label,
  value,
  displayValue,
}: {
  label: string
  value: string
  displayValue: string
}) => {
  const { copy, copied } = useCopied()
  return (
    <Button colorStyle="background" onClick={() => copy(value)} size="flexible" fullWidthContent>
      <ButtonInner>
        <Typography>{label}</Typography>
        <CopyableRightContainer>
          <Typography fontVariant="small">{displayValue}</Typography>
          <IconCopyAnimated color="grey" copied={copied} size="3.5" />
        </CopyableRightContainer>
      </ButtonInner>
    </Button>
  )
}

enum Errors {
  NOT_CHECKED = 'NOT_CHECKED',
  SUBDOMAIN_NOT_SET = 'SUBDOMAIN_NOT_SET',
  DNS_RECORD_DOES_NOT_EXIST = 'DNS_RECORD_DOES_NOT_EXIST',
  DNS_RECORD_INVALID = 'DNS_RECORD_INVALID',
}

export const AddTextRecord = ({
  currentStep,
  setCurrentStep,
  syncWarning,
  setSyncWarning,
  name,
}: {
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  syncWarning: boolean
  setSyncWarning: Dispatch<SetStateAction<boolean>>
  name: string
}) => {
  const { address } = useAccount()
  const [errorState, setErrorState] = useState<Errors>(Errors.NOT_CHECKED)
  const breakpoints = useBreakpoint()
  const { t } = useTranslation('dnssec')
  const [isCheckLoading, setIsCheckLoading] = useState(false)

  const handleCheck = async () => {
    try {
      setErrorState(Errors.NOT_CHECKED)
      setIsCheckLoading(true)
      // isSubdomainSet(name as string)
      const prover = DNSProver.create(DNS_OVER_HTTP_ENDPOINT)
      const result = await prover.queryWithProof('TXT', `_ens.${name}`)
      const dnsOwner = getDnsOwner(result)
      setIsCheckLoading(false)

      if (parseInt(dnsOwner) === 0) {
        // DNS record is not set
        setSyncWarning(false)
        setErrorState(Errors.DNS_RECORD_DOES_NOT_EXIST)
      } else if (!isAddress(dnsOwner)) {
        // Invalid DNS record
        setSyncWarning(false)
        setErrorState(Errors.DNS_RECORD_INVALID)
      } else if (dnsOwner.toLowerCase() === address?.toLowerCase()) {
        // DNS record is set and matches the address
        setSyncWarning(false)
        setCurrentStep(currentStep + 1)
      } else {
        // Out of sync
        setSyncWarning(true)
        return
      }
    } catch (e) {
      console.error('_ens check error: ', e)
      if ((e as Error).message.includes('NXDOMAIN')) {
        setErrorState(Errors.SUBDOMAIN_NOT_SET)
      }
      setSyncWarning(false)
      setIsCheckLoading(false)
    }
  }

  return (
    <Container>
      <Typography fontVariant="headingFour">{t('addTextRecord.title')}</Typography>
      <Spacer $height="3" />
      <Typography>{t('addTextRecord.explanation')}</Typography>
      <Spacer $height="3" />
      <AlignedDropdown
        // needed for no line breaks in buttons
        width={200}
        height={200}
        align="left"
        items={HelperLinks.map((link) => ({
          label: t(link.label),
          onClick: () => null,
          wrapper: (children, key) => (
            <a
              href={link.href}
              target="_blank"
              key={key}
              rel="noreferrer"
              // needed for buttons to maintain the width of the dropdown
              style={{ width: '100%', textAlign: 'left' }}
            >
              {children}
            </a>
          ),
        }))}
        label="Domain Registrar"
      />
      <Spacer $height="3" />
      <Outlink target="_blank" href={`https://who.is/whois/${name}`}>
        {t('registrars.findYourRegistrar')}
      </Outlink>
      <Spacer $height="5" />
      <ButtonRow>
        <Button colorStyle="background" size="flexible" fullWidthContent>
          <ButtonInner>
            <Typography>{t('addTextRecord.type')}</Typography>
            <Typography fontVariant="small">{t('addTextRecord.txt')}</Typography>
          </ButtonInner>
        </Button>
        <Copyable {...{ label: 'Name', value: '_ens', displayValue: '_ens' }} />
      </ButtonRow>
      <Spacer $height="2" />
      {address && (
        <Copyable
          {...{
            label: 'Value',
            value: `a=${address}`,
            displayValue: `a=${
              breakpoints.sm ? address : shortenAddress(address, undefined, 6, 6)
            }`,
          }}
        />
      )}
      <Spacer $height="6" />
      {syncWarning && (
        <>
          <Helper type="warning" style={{ textAlign: 'center' }}>
            <Typography>{t('addTextRecord.syncWarningOne')}</Typography>
            <Typography fontVariant="small" color="grey">
              {t('addTextRecord.syncWarningTwo')}
            </Typography>
          </Helper>
          <Spacer $height="6" />
        </>
      )}
      {errorState !== Errors.NOT_CHECKED && (
        <>
          <Helper type="error" style={{ textAlign: 'center' }}>
            <Typography>{t(`addTextRecord.errors.${errorState}.title`)}</Typography>
            <Typography fontVariant="small" color="grey">
              {t(`addTextRecord.errors.${errorState}.content`)}
            </Typography>
          </Helper>
          <Spacer $height="6" />
        </>
      )}
      <Steps {...{ stepStatus: ['completed', 'inProgress', 'notStarted', 'notStarted'] }} />
      <Spacer $height="6" />
      <ButtonContainer>
        {syncWarning && (
          <CheckButton
            onClick={() => {
              setCurrentStep(currentStep + 1)
            }}
            size="small"
          >
            {t('action.continue', { ns: 'common' })}
          </CheckButton>
        )}
        <CheckButton
          onClick={handleCheck}
          size="small"
          disabled={currentStep === 2}
          loading={isCheckLoading}
          data-testid="dnssec-check-button"
        >
          {t('action.check', { ns: 'common' })}
        </CheckButton>
        <CheckButton
          onClick={() => {
            setCurrentStep(currentStep - 1)
          }}
          colorStyle="accentSecondary"
          size="small"
        >
          {t('navigation.back', { ns: 'common' })}
        </CheckButton>
      </ButtonContainer>
    </Container>
  )
}
