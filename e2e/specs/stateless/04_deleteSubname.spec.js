import { acceptMetamaskAccess, connectFromExisting } from '../../setup'

describe('Delete subnames', () => {
  before(() => {
    acceptMetamaskAccess(2, true)
  })

  it('should be able to delete subname', () => {
    cy.visit('/with-subnames.eth')
    connectFromExisting()
    cy.findByTestId('subnames-tab').click()
    cy.findByTestId('name-item-xyz.with-subnames.eth').click()
    cy.wait(500)

    cy.get('button').contains('Delete subname', { timeout: 10000 }).click()

    cy.findByTestId('transaction-modal-confirm-button').click()
    cy.confirmMetamaskTransaction()
    cy.findByTestId('transaction-modal-complete-button').click()

    cy.findByTestId('profile-actions').should('not.exist')
    cy.go('back')

    cy.findByTestId('name-item-xyz.with-subnames.eth').should('not.exist')
  })

  describe('wrapped subname', () => {
    it('should be able to delete subname as parent owner', () => {
      cy.visit('/xyz.wrapped.eth')

      // Manager button should exist
      cy.findByTestId('owner-profile-button-name.manager').should('be.visible')

      cy.get('button').contains('Delete subname', { timeout: 10000 }).click()
      cy.findByTestId('transaction-modal-confirm-button').click()
      cy.confirmMetamaskTransaction()
      cy.findByTestId('transaction-modal-complete-button').click()
      cy.wait(10000)

      // Button should not exist
      cy.findByTestId('owner-profile-button-name.manager').should('not.exist')
    })

    it('should be able to delete subname as name owner', () => {
      acceptMetamaskAccess(1)
      cy.visit('/sub.wrapped.eth')

      // Manager button exists
      cy.findByTestId('owner-profile-button-name.manager').should('be.visible')

      cy.get('button').contains('Delete subname', { timeout: 10000 }).click()
      cy.findByTestId('transaction-modal-confirm-button').click()
      cy.confirmMetamaskTransaction()
      cy.findByTestId('transaction-modal-complete-button').click()
      cy.wait(10000)

      // Button should not exist
      cy.findByTestId('owner-profile-button-name.manager').should('not.exist')
    })
  })

  describe('wrapped subname with PCC burned', () => {
    it('should NOT allow parent owner to delete', () => {
      acceptMetamaskAccess(2)
      cy.visit('/wrapped.eth')
      cy.findByTestId('permissions-tab').click()
      cy.findByTestId('button-revoke-permissions').click()
      cy.findByTestId('permissions-next-button').click()
      cy.findByTestId('checkbox-CANNOT_UNWRAP').click()
      cy.findByTestId('permissions-next-button').should('not.be.disabled').click()
      cy.findByTestId('permissions-next-button').should('have.text', 'Skip0').click()
      cy.findByTestId('transaction-modal-confirm-button').click()
      cy.confirmMetamaskTransaction()
      cy.findByTestId('transaction-modal-complete-button').click()
      cy.wait(10000)

      cy.visit('/test.wrapped.eth')
      cy.findByTestId('permissions-tab').click()
      cy.findByTestId('button-revoke-pcc').click()
      cy.findByTestId('permissions-next-button').click()
      cy.findByTestId('checkbox-pcc').click()
      cy.findByTestId('permissions-next-button').should('not.be.disabled').click()
      cy.findByText('Set name expiry').should('be.visible')
      cy.findByTestId('permissions-next-button').click()
      cy.findByTestId('permissions-next-button').should('have.text', 'Skip0').click()
      cy.findByTestId('transaction-modal-confirm-button').click()
      cy.confirmMetamaskTransaction()
      cy.findByTestId('transaction-modal-complete-button').click()
      cy.wait(10000)

      cy.visit('/test.wrapped.eth')
      cy.get('button').contains('Delete subname', { timeout: 10000 }).should('not.exist')
    })

    const reloadUntilExists = (max = 3, attempt = 0) => {
      cy.get('button').then(($buttons) => {
        const button = $buttons.find((el) => el.innerText === 'Delete subname')
        if (!button && attempt < max) {
          cy.reload()
          reloadUntilExists(max, attempt + 1)
        }
      })
    }

    it('should allow name owner to delete', () => {
      acceptMetamaskAccess(1)
      cy.visit('/test.wrapped.eth')
      
      reloadUntilExists()
      cy.findByTestId('profile-action-Delete subname').should('be.visible').click({force: true})

      // Delete emancipated name warning
      cy.findByText('This subname cannot be recreated').should('be.visible')
      cy.findByTestId('delete-emancipated-subname-button').should('not.be.disabled').click()
      cy.findByTestId('transaction-modal-confirm-button').click()
      cy.confirmMetamaskTransaction()
      cy.findByTestId('transaction-modal-complete-button').click()
      cy.wait(10000)

      cy.findByTestId('owner-profile-button-name.manager').should('not.exist')
    })

    it('should not allow parent owner to delete if PCC is expired', () => {
      // this is because once PCC expires, the name is effectively deleted
      acceptMetamaskAccess(2)
      cy.visit('/day-expired.wrapped-expired-subnames.eth')
      cy.get('button').contains('Delete subname', { timeout: 10000 }).should('not.exist')
    })
  })
})
