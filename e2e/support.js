import '@deploysentinel/cypress-debugger/support'
import '@synthetixio/synpress/support/index'
import 'cypress-localstorage-commands'

beforeEach(() => {
  cy.restoreLocalStorage()
})

afterEach(() => {
  cy.saveLocalStorage()
})
