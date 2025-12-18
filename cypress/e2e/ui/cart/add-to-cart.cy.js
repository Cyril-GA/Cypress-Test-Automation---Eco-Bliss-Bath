describe("Add to Cart UI", () => {
  beforeEach(() => {
    cy.loginUI(Cypress.env("email"), Cypress.env("password"));
    cy.ensureEmptyCart();
    cy.visit("/");

    cy.contains("Déconnexion").should("be.visible");
  });

  it("Affiche la page Panier", () => {
    cy.get('[data-cy="nav-link-cart"]').click();

    cy.url().should("include", "/cart");
    cy.contains("Commande");
  });

  it("Bloque l'ajout au panier si le stock est inférieur à 1", () => {
    cy.visit("/products");
    cy.contains("Nos produits").should("be.visible");

    // Clique sur le premier article
    cy.goToFirstProduct();

    cy.get('[data-cy="detail-product-stock"]')
      .invoke("text")
      .then((text) => {
        const stock = parseInt(text, 10);

        if (stock <= 0) {
          cy.get('[data-cy="detail-product-add"]').should("be.disabled");
        } else {
          cy.get('[data-cy="detail-product-add"]').should("be.enabled");
        }
      });
  });

  it("Ajoute un produit au panier", () => {
    cy.visit("/products");
    cy.contains("Nos produits").should("be.visible");

    cy.goToFirstProduct();

    // Sauvegarder l'URL du produit
    cy.url().as("productUrl");

    cy.get('[data-cy="detail-product-stock"]')
      .invoke("text")
      .then((text) => {
        const initialStock = parseInt(text, 10);
        cy.log(`Stock initial: ${initialStock}`);
        cy.wrap(initialStock).as("initialStock");
      });

    // Ajoute au panier
    cy.get('[data-cy="detail-product-add"]').click();

    // Vérifie que le panier s'est mis à jour
    cy.url().should("include", "/cart");

    // Vérifie que le produit est bien présent
    cy.get('[data-cy="cart-line"]').should("be.visible");
    cy.get('[data-cy="cart-line-quantity"]')
      .invoke("val")
      .then((value) => {
        expect(Number(value)).to.be.gte(1);
      });

    cy.get('[data-cy="cart-total"]').should("be.visible");

    // Retourner sur le produit
    cy.get("@productUrl").then((url) => {
      cy.visit(url);
    });
    cy.get('[data-cy="detail-product-name"]').should("be.visible");

    // Vérifier que le stock a diminué
    cy.get("@initialStock").then((initialStock) => {
      cy.get('[data-cy="detail-product-stock"]')
        .invoke("text")
        .then((text) => {
          const newStock = parseInt(text, 10);
          cy.log(`Nouveau stock: ${newStock}`);
          expect(newStock).to.eq(initialStock - 1);
        });
    });
  });

  it("Verifie la calcul du prix total", () => {
    cy.visit("/products");
    cy.get("[data-cy='product']")
      .first()
      .find('[data-cy="product-link"]')
      .click();

    cy.get('[data-cy="detail-product-name"]').should("be.visible");
    cy.get('[data-cy="detail-product-price"]')
      .invoke("text")
      .then((text) => parseFloat(text.replace(/[€\s]/g, "").replace(",", ".")))
      .as("unitPrice");

    // Modifie la quantité
    cy.get('[data-cy="detail-product-quantity"]').clear().type("3");
    cy.get('[data-cy="detail-product-add"]').click();

    cy.url().should("include", "/cart");

    cy.get('[data-cy="cart-line"]')
      .first()
      .within(() => {
        cy.get('[data-cy="cart-line-quantity"]')
          .invoke("val")
          .then(parseInt)
          .as("quantity");
      });

    cy.get("@quantity").then((qty) => {
      cy.get("@unitPrice").then((price) => {
        const expectedTotal = qty * price;

        cy.get('[data-cy="cart-total"]')
          .invoke("text")
          .then((text) =>
            parseFloat(text.replace(/[€\s/g]/, "").replace(",", "."))
          )
          .should("equal", expectedTotal);
      });
    });
  });
});
