/// <reference types="cypress" />

describe('main page', () => {
    it('visit the main page', () => {
        const url = Cypress.env('api_url');
        console.log(url);

        cy.intercept(url).as('scores');
        
        cy.visit('/');
        cy.wait('@scores');
        
        cy.get('body').contains('average score'); 
    });
});
