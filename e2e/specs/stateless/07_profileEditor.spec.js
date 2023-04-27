import { acceptMetamaskAccess, connectFromExisting } from '../../setup'

const CYPRESS_WAIT_TIME = 20000

const oldResolver = '0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB'
const newResolver = '0x0E801D84Fa97b50751Dbf25036d067dCf18858bF'

describe('Profile Editor', () => {
  before(() => {
    acceptMetamaskAccess(2, true)
  })

  describe('unwrapped', () => {
    describe('migration', () => {
      it('should force a name on the old registry to go to update registry', () => {
        cy.visit('/legacy.test')
        connectFromExisting()
        cy.contains('Edit profile').click()
        cy.contains('Registry out of date').should('be.visible')
        cy.findByTestId('warning-overlay-back-button').should('have.text', 'Cancel').click()
        cy.findByTestId('profile-editor').should('not.exist')
      })

      it('should force a name without a resolver to update their resolver', () => {
        cy.visit('/tld/reverse')
        connectFromExisting()

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('not.have.text', newResolver)

        // Closing overlay button should close editor
        cy.findByTestId('profile-tab').click()
        cy.contains('Edit profile').click()
        cy.contains('No resolver set').should('be.visible')
        cy.findByTestId('warning-overlay-back-button').should('have.text', 'Cancel').click()

        cy.contains('Edit profile').click()
        cy.findByTestId('warning-overlay-next-button').click()
        cy.findByTestId('transaction-modal-confirm-button').should('not.be.disabled').click()
        cy.confirmMetamaskTransaction()
        cy.findByTestId('transaction-modal-complete-button').click()
        cy.wait(CYPRESS_WAIT_TIME)

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('have.text', newResolver)
      })

      it('should check if a name has been migrated, but whose resolver has not been migrated', () => {
        cy.visit('/migrated-resolver-to-be-updated.eth')
        connectFromExisting()

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('have.text', oldResolver)

        cy.findByTestId('profile-tab').click()

        // Check profile records
        cy.findByTestId('profile-snippet-description').should('have.text', 'Hello2')
        cy.findByTestId('profile-snippet-url').should('have.text', 'twitter.com')
        cy.findByTestId('address-profile-button-eth').should('have.text', '0x709...c79C8')
        cy.findByTestId('address-profile-button-btc').should('have.text', 'bc1qj...pwa6n')
        cy.findByTestId('other-profile-button-ETC_LEGACY').should(
          'have.text',
          'ETC_LEGACY0x3C4...293BC',
        )
        cy.findByTestId('other-profile-button-email').should('have.text', 'emailfakeemail@fake....')

        cy.contains('Edit profile').click()
        cy.findByTestId('warning-overlay-next-button').click()
        cy.contains('Profile records on new resolver').should('be.visible')
        cy.findByTestId('warning-overlay-next-button').click()
        cy.findByTestId('transaction-modal-confirm-button').should('not.be.disabled').click()
        cy.confirmMetamaskTransaction()
        cy.findByTestId('transaction-modal-complete-button').click()
        cy.wait(CYPRESS_WAIT_TIME)

        // Check profile records
        cy.findByTestId('profile-snippet-description').should('have.text', 'Hello2')
        cy.findByTestId('profile-snippet-url').should('have.text', 'twitter.com')
        cy.findByTestId('address-profile-button-btc').should('have.text', 'bc1qj...pwa6n')
        cy.findByTestId('other-profile-button-ETC_LEGACY').should(
          'have.text',
          'ETC_LEGACY0x3C4...293BC',
        )
        cy.findByTestId('other-profile-button-email').should('have.text', 'emailfakeemail@fake....')

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('have.text', newResolver)
      })

      it('should be able to migrate unwrapped to new resolver', () => {
        cy.visit('/test123.eth')
        connectFromExisting()

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('have.text', oldResolver)

        cy.findByTestId('profile-tab').click()

        // Check profile records
        cy.findByTestId('profile-snippet-description').should('have.text', 'Hello2')
        cy.findByTestId('profile-snippet-url').should('have.text', 'twitter.com')
        cy.findByTestId('address-profile-button-eth').should('have.text', '0x709...c79C8')
        cy.findByTestId('address-profile-button-btc').should('have.text', 'bc1qj...pwa6n')
        cy.findByTestId('other-profile-button-ETC_LEGACY').should(
          'have.text',
          'ETC_LEGACY0x3C4...293BC',
        )
        cy.findByTestId('other-profile-button-email').should('have.text', 'emailfakeemail@fake....')

        cy.contains('Edit profile').click()
        cy.findByTestId('warning-overlay-next-button').click()
        cy.contains('Transfer current profile').should('be.visible')
        cy.findByTestId('warning-overlay-next-button').click()

        cy.findByTestId('transaction-dialog-intro-trailing-btn').should('not.be.disabled').click()
        cy.findByTestId('transaction-modal-confirm-button').should('not.be.disabled').click()
        cy.confirmMetamaskTransaction()
        cy.findByTestId('transaction-modal-complete-button').click()
        cy.wait(CYPRESS_WAIT_TIME)
        cy.findByTestId('transaction-modal-confirm-button').should('not.be.disabled').click()
        cy.confirmMetamaskTransaction()
        cy.findByTestId('transaction-modal-complete-button').click()
        cy.wait(CYPRESS_WAIT_TIME)

        // Check profile records
        cy.findByTestId('profile-snippet-description').should('have.text', 'Hello2')
        cy.findByTestId('profile-snippet-url').should('have.text', 'twitter.com')
        cy.findByTestId('address-profile-button-eth').should('have.text', '0x709...c79C8')
        cy.findByTestId('address-profile-button-btc').should('have.text', 'bc1qj...pwa6n')
        cy.findByTestId('other-profile-button-ETC_LEGACY').should(
          'have.text',
          'ETC_LEGACY0x3C4...293BC',
        )
        cy.findByTestId('other-profile-button-email').should('have.text', 'emailfakeemail@fake....')

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('have.text', newResolver)
      })
    })

    describe('update', () => {
      it('should be able to update profile without migration', () => {
        cy.visit('/to-be-wrapped.eth')
        connectFromExisting()

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('have.text', oldResolver)

        cy.findByTestId('profile-tab').click()

        // Check profile records
        cy.findByTestId('profile-snippet-description').should('have.text', 'Hello2')
        cy.findByTestId('profile-snippet-url').should('have.text', 'twitter.com')
        cy.findByTestId('address-profile-button-eth').should('have.text', '0x709...c79C8')
        cy.findByTestId('address-profile-button-btc').should('have.text', 'bc1qj...pwa6n')
        cy.findByTestId('other-profile-button-ETC_LEGACY').should(
          'have.text',
          'ETC_LEGACY0x3C4...293BC',
        )
        cy.findByTestId('other-profile-button-email').should('have.text', 'emailfakeemail@fake....')

        // Update and add records
        cy.contains('Edit profile').click()
        cy.findByTestId('warning-overlay-skip-button').click()
         
        cy.findByTestId('profile-record-input-description')
          .get('textarea')
          .type('{selectall}{backspace}new name')
        cy.findByTestId('profile-record-input-input-ETH').type(
          '{selectall}{backspace}0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        )
        cy.findByTestId('show-add-profile-records-modal-button').click({ force: true })
        cy.findByTestId('profile-record-option-com.twitter').click()
        cy.findByTestId('add-profile-records-button').should('not.be.disabled').click()
        cy.findByTestId('profile-record-input-input-com.twitter').type('ensdomains')
        cy.findByTestId('profile-submit-button').should('not.be.disabled').click()

        cy.findByTestId('transaction-modal-confirm-button').should('not.be.disabled').click()
        cy.confirmMetamaskTransaction()
        cy.findByTestId('transaction-modal-complete-button').click()
        cy.wait(CYPRESS_WAIT_TIME)

        // Check profile records
        cy.findByTestId('profile-snippet-description').should('have.text', 'new name')
        cy.findByTestId('profile-snippet-url').should('have.text', 'twitter.com')
        cy.findByTestId('address-profile-button-eth').should('have.text', '0xf39...92266')
        cy.findByTestId('address-profile-button-btc').should('have.text', 'bc1qj...pwa6n')
        cy.findByTestId('other-profile-button-ETC_LEGACY').should(
          'have.text',
          'ETC_LEGACY0x3C4...293BC',
        )
        cy.findByTestId('other-profile-button-email').should('have.text', 'emailfakeemail@fake....')

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('have.text', oldResolver)
      })
    })
  })

  describe('wrapped', () => {
    describe('migration', () => {
      it('should be able to migrate wrapped name to new resolver', () => {
        cy.visit('/wrapped.eth')
        cy.findByTestId('more-tab').click()
        cy.findByTestId('edit-resolver-button').click()
        cy.findByTestId('custom-resolver-radio').should('not.be.disabled').click()
        cy.findByTestId('dogfood').type(oldResolver)
        cy.findByTestId('update-button').should('not.be.disabled').click()
        cy.findByTestId('transaction-modal-confirm-button').click()
        cy.confirmMetamaskTransaction()
        cy.findByTestId('transaction-modal-complete-button').click()
        cy.wait(CYPRESS_WAIT_TIME)
        cy.findByTestId('name-details-text').should('have.text', oldResolver)

        cy.findByTestId('profile-tab').click()
        cy.contains('Edit profile').click()
        cy.contains('Resolver incompatible').should('be.visible')
        cy.findByTestId('warning-overlay-next-button').click()

        cy.findByTestId('transaction-modal-confirm-button').should('not.be.disabled').click()
        cy.confirmMetamaskTransaction()
        cy.findByTestId('transaction-modal-complete-button').click()
        cy.wait(CYPRESS_WAIT_TIME)

        cy.findByTestId('more-tab').click()
        cy.findByTestId('name-details-text').should('have.text', newResolver)
      })
    })

    describe('update', () => {
      it('should be able to update account', () => {
        cy.visit('/wrapped.eth')
        connectFromExisting()
        cy.contains('Edit profile').click()

        cy.findByTestId('show-add-profile-records-modal-button').click({ force: true })
        cy.findByTestId('profile-record-option-name').click()
        cy.findByTestId('profile-record-option-abi').click({ force: true })
        cy.findByTestId('add-profile-records-button').should('not.be.disabled').click()

        cy.findByTestId('profile-record-input-input-name').type('Test Name')
        cy.findByTestId('profile-record-input-input-abi').type('[{"test":"test"}]', {
          parseSpecialCharSequences: false,
        })
        cy.findByTestId('profile-submit-button').should('not.be.disabled').click()

        cy.findByTestId('transaction-modal-confirm-button').should('not.be.disabled').click()
        cy.confirmMetamaskTransaction()
        cy.findByTestId('transaction-modal-complete-button').click()
        cy.wait(CYPRESS_WAIT_TIME)

        cy.findByTestId('profile-snippet-nickname').should('have.text', 'Test Name')

        cy.findByTestId('records-tab').click()
        cy.findByTestId('name-details-text').should('have.text', '[{"test":"test"}]')
      })
    })
  })
})
