import { revert } from './clean'

export const acceptMetamaskAccess = (account = 1, runRevert = false) => {
  cy.clearLocalStorageSnapshot()
  cy.visit('/')
  cy.wait(1000)
  cy.window().then((win) => win.ethereum.selectedAddress && cy.disconnectMetamaskWalletFromDapp())
  cy.switchMetamaskAccount(account).then(() => {
    runRevert &&
      cy.wrap(revert()).then(([currBlock, revertBlock]) => cy.task('log', [currBlock, revertBlock]))
  })
  cy.resetMetamaskAccount()
  cy.findByTestId('connect-button').click()
  cy.contains('MetaMask').click()
  cy.wait(1000)
  cy.window()
    .then((win) => (!win.ethereum ? [] : win.ethereum.request({ method: 'eth_accounts' })))
    .then((accounts) => {
      if (!accounts.length) {
        cy.acceptMetamaskAccess()
      }
    })
  cy.saveLocalStorage()
}

export const connectFromExisting = () => {
  cy.get('body', {
    timeout: 250,
  }).then(($body) => {
    const button = $body.find('[data-testid="connect-button"]')
    if (button.length) {
      cy.wrap(button).click()
      cy.contains('MetaMask').click()
    }
  })
}
