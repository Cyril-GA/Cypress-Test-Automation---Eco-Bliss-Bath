describe("Login UI", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("Affiche la page de connexion", () => {
    cy.get('[data-cy="login-input-username"]')
      .should("have.attr", "type", "text")
      .and("be.visible");

    cy.get("[data-cy='login-input-password']")
      .should("have.attr", "type", "password")
      .and("be.visible");

    cy.get("[data-cy='login-submit']").should("be.visible");
  });

  it("Redirige vers page d'accueil après login valide", () => {
    cy.get('[data-cy="login-input-username"]').type(Cypress.env("email"));
    cy.get("[data-cy='login-input-password']").type(Cypress.env("password"));
    cy.get("[data-cy='login-submit']").click();

    cy.location("pathname").should("eq", "/");
  });

  it("Affiche une erreur si les champs sont vides", () => {
    cy.get("[data-cy='login-submit']").click();

    cy.contains("Merci de remplir correctement tous les champs");
    cy.get('label[for="username"]')
      .should("contain", "Email")
      .and("have.class", "error");
    cy.get('label[for="password"]')
      .should("contain", "Mot de passe")
      .and("have.class", "error");
  });

  it("Affiche une erreur si le mot de passe est vide", () => {
    cy.get('[data-cy="login-input-username"]').type(Cypress.env("email"));
    cy.get("[data-cy='login-submit']").click();

    cy.contains("Merci de remplir correctement tous les champs");
    cy.get('label[for="password"]')
      .should("contain", "Mot de passe")
      .and("have.class", "error");
  });

  it("Affiche une erreur si l'identifiant est vide", () => {
    cy.get('[data-cy="login-input-password"]').type(Cypress.env("password"));
    cy.get("[data-cy='login-submit']").click();

    cy.contains("Merci de remplir correctement tous les champs");
    cy.get('label[for="username"]')
      .should("contain", "Email")
      .and("have.class", "error");
  });
});
