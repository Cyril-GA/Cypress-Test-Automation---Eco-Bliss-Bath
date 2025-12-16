const apiHealth = `${Cypress.env("apiUrl")}/api/health`;

context("GET /health", () => {
  it("Devrait renvoyer un statut OK", () => {
    cy.request("GET", apiHealth).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
