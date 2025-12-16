describe("Test XSS - Avis", () => {
  beforeEach(() => {
    cy.loginUI(Cypress.env("email"), Cypress.env("password"));
    cy.visit("/reviews");
    cy.contains("Votre avis");
  });
  it("crée un commentaire sans conserver le script", () => {
    const uniqueId = Date.now();
    const payloadTitle = `Ceci est un test XSS - ${uniqueId}`;
    const payloadComment = '<script>alert("XSS")</script>';

    cy.get('[data-cy="review-input-rating-images"] img').first().click();
    cy.get('[data-cy="review-input-title"]').type(payloadTitle);
    cy.get('[data-cy="review-input-comment"]').type(payloadComment);

    cy.on("window:alert", () => {
      throw new Error("Une fenêtre d'alerte s'est affichée !");
    });

    cy.get('[data-cy="review-submit"]').click();

    cy.get('[data-cy="review-detail"]')
      .contains('[data-cy="review-title"]', `${uniqueId}`)
      .parents('[data-cy="review-detail"]')
      .within(() => {
        cy.get('[data-cy="review-comment"]').invoke("text").should("eq", "");
      });
  });
});
