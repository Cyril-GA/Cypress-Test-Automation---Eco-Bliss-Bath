describe("Smoke Tests", () => {
  context("Vérifier la présence du bouton connexion et la redirection", () => {
    beforeEach(() => {
      cy.visit("/");
    });
    it('Le bouton "Connection" devrait être présent', () => {
      cy.get('[data-cy="nav-link-login"]')
        .should("contain", "Connexion")
        .and("be.visible");
    });
    it("Redirige vers la page de connexion", () => {
      cy.get('[data-cy="nav-link-login"]').click();

      cy.url().should("include", "/login");
    });
  });

  context("Vérifie les éléments du formulaire", () => {
    beforeEach(() => {
      cy.visit("/login");
      cy.url().should("include", "/login");
    });
    it("Vérifie le champ username", () => {
      cy.get('[data-cy="login-input-username"]')
        .should("have.attr", "type", "text")
        .and("be.visible");
    });
    it("Vérifie le champs password", () => {
      cy.get('[data-cy="login-input-password"]')
        .should("have.attr", "type", "password")
        .and("be.visible");
    });
    it("Vérifie le bouton de connexion", () => {
      cy.get('[data-cy="login-submit"]').should("exist").and("be.visible");
    });
  });

  context("Vérifie la présence des boutons d'ajout au panier", () => {
    beforeEach(() => {
      cy.visit("/products");
      cy.contains("Nos produits").should("be.visible");
    });
    it("contient le bouton ajouter au panier", () => {
      cy.get("[data-cy='product']")
        .first()
        .find('[data-cy="product-link"]')
        .click();

      cy.get('[data-cy="detail-product-add"]').should("be.visible");
    });
  });
});
