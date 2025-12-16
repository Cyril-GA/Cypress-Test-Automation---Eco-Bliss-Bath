describe("Remove from Cart UI", () => {
  beforeEach(() => {
    cy.loginUI(Cypress.env("email"), Cypress.env("password"));
    cy.ensureEmptyCart();
  });

  context("Panier avec un produit", () => {
    beforeEach(() => {
      cy.addRandomProductsToCart(3, { unique: true });
      cy.visit("/cart");
      cy.contains("Commande");
    });

    it("Peut supprimer un produit du panier", () => {
      cy.intercept("DELETE", "**/orders/*/delete").as("deleteLine");

      cy.get('[data-cy="cart-line"]').should("be.visible");

      cy.get('[data-cy="cart-line-delete"]').first().click();

      cy.wait("@deleteLine");

      cy.get('[data-cy="cart-line"]').should("have.length", 2);
    });
  });

  context("Panier vide", () => {
    beforeEach(() => {
      cy.visit("/cart");
      cy.contains("Commande");
    });

    it("Affiche un message indiquant que le panier est vide", () => {
      cy.get('[data-cy="cart-empty"]').should(
        "contain",
        "Votre panier est vide"
      );
    });

    it("Affiche un lien de redirection vers les produits", () => {
      cy.get('[data-cy="cart-empty"]')
        .find("a")
        .contains("Consultez nos produits")
        .should("be.visible");
    });

    it("Le liens 'Consultez nos produits' redirige vers les produits", () => {
      cy.get('[data-cy="cart-empty"] a').should("be.visible").click();

      cy.url().should("include", "/products");
      cy.contains("Nos produits").should("be.visible");
    });
  });

  context("Cas limites", () => {
    it("Le bouton de suppression est bien présent sur chaque ligne", () => {
      cy.addRandomProductsToCart(2, { unique: true });

      cy.get('[data-cy="cart-line"]').each(($line) => {
        cy.wrap($line)
          .find('[data-cy="cart-line-delete"]')
          .should("exist")
          .and("be.visible");
      });
    });
  });
});
