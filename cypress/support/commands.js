import { fakerFR as faker } from "@faker-js/faker";

Cypress.Commands.add(
  "apiLogin",
  (username = Cypress.env("email"), password = Cypress.env("password")) => {
    const apiLogin = `${Cypress.env("apiUrl")}/login`;

    return cy
      .request({
        method: "POST",
        url: apiLogin,
        body: { username, password },
      })
      .then((response) => {
        const token = response.body.token;
        Cypress.env("authToken", token);
        return { token, username };
      });
  }
);

Cypress.Commands.add("generateUniqueUser", () => {
  faker.seed(Date.now());

  return {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: faker.internet.password({ length: 6, memorable: true }),
    differentPassword: faker.internet.password({ length: 6, memorable: true }),
    address: faker.location.streetAddress(),
    zipCode: faker.location.zipCode(),
    city: faker.location.city(),
  };
});

Cypress.Commands.add(
  "registerNewUser",
  (
    email = faker.internet.email(),
    firstname = faker.person.firstName(),
    lastname = faker.person.lastName(),
    password = faker.internet.password({ length: 6, memorable: true })
  ) => {
    const apiRegister = `${Cypress.env("apiUrl")}/register`;

    return cy
      .request({
        method: "POST",
        url: apiRegister,
        body: {
          email,
          firstname,
          lastname,
          plainPassword: { first: password, second: password },
        },
      })
      .then(() => {
        return { email, password };
      });
  }
);

Cypress.Commands.add("setupCartWithProduct", (productId = 5, quantity = 1) => {
  return cy.apiLogin().then((loginData) => {
    const authToken = loginData.token;

    return cy
      .request({
        method: "PUT",
        url: `${Cypress.env("apiUrl")}/orders/add`,
        headers: { Authorization: `bearer ${authToken}` },
        body: { product: productId, quantity: quantity },
      })
      .then(() => {
        return cy
          .request({
            method: "GET",
            url: `${Cypress.env("apiUrl")}/orders`,
            headers: { Authorization: `bearer ${authToken}` },
          })
          .then((response) => {
            return {
              authToken: authToken,
              orderLineId: response.body.orderLines[0].id,
              order: response.body,
            };
          });
      });
  });
});

Cypress.Commands.add("loginUI", (email, password) => {
  cy.visit("/login");

  cy.get('[data-cy="login-input-username"]').type(email);
  cy.get('[data-cy="login-input-password"]').type(password);

  cy.get('[data-cy="login-submit"]').click();

  cy.url().should("eq", Cypress.config().baseUrl + "/");
});

Cypress.Commands.add("ensureEmptyCart", () => {
  // Attendre l’appel API du panier
  cy.intercept("GET", "**/orders").as("getCart");

  cy.visit("/cart");
  cy.wait("@getCart").its("response.statusCode").should("eq", 200);

  // Attendre que l'un des deux états soit visible : empty ou content
  cy.get("body").then(($body) => {
    const hasEmpty = $body.find('[data-cy="cart-empty"]').length > 0;
    const hasContent = $body.find("#cart-content").length > 0;

    if (hasEmpty && !hasContent) {
      cy.log("Panier déjà vide");
      return;
    }

    cy.log("Panier non vide → Suppression des articles…");

    cy.intercept("DELETE", "**/orders/*/delete").as("deleteItem");

    const deleteNext = () => {
      cy.get("body").then(($b) => {
        const lines = $b.find('[data-cy="cart-line"]');

        if (lines.length === 0) {
          cy.log("Panier vidé");
          return;
        }

        cy.get('[data-cy="cart-line-delete"]').first().click();

        cy.wait("@deleteItem")
          .its("response.statusCode")
          .should("be.oneOf", [200, 204]);

        deleteNext();
      });
    };

    deleteNext();
  });

  // Vérification finale : interface affichant un panier vide
  cy.get('[data-cy="cart-empty"]', { timeout: 10000 }).should("be.visible");
});

Cypress.Commands.add("addRandomProductsToCart", (count = 1, options = {}) => {
  const { unique = false } = options;

  cy.intercept("GET", "**/products").as("getProducts");
  cy.intercept("PUT", "**/orders/add").as("addToCart");

  cy.visit("/products");
  cy.wait("@getProducts");

  const addedIndexes = []; // Stocker les produits déjà ajoutés

  cy.get('[data-cy="product"]').should("have.length.greaterThan", 0);

  for (let i = 0; i < count; i++) {
    cy.log(`Ajout du produit ${i + 1}/${count}`);

    if (i > 0) {
      cy.visit("/products");
      cy.wait("@getProducts");
    }

    cy.get('[data-cy="product"]').then(($products) => {
      let randomIndex;

      if (unique) {
        // Trouver un index non utilisé
        let attempts = 0;
        do {
          randomIndex = Math.floor(Math.random() * $products.length);
          attempts++;

          // Sécurité : si tous les produits sont déjà ajoutés
          if (attempts > $products.length * 2) {
            cy.log(`Impossible de trouver ${count} produits uniques`);
            return;
          }
        } while (addedIndexes.includes(randomIndex));

        addedIndexes.push(randomIndex);
        cy.log(`Produit unique: index ${randomIndex}`);
      } else {
        randomIndex = Math.floor(Math.random() * $products.length);
        cy.log(`Produit: index ${randomIndex}`);
      }

      cy.wrap($products.eq(randomIndex))
        .find('[data-cy="product-link"]')
        .should("be.visible")
        .click();
    });

    cy.get('[data-cy="detail-product-name"]').should("be.visible");
    cy.get('[data-cy="detail-product-add"]').should("be.enabled").click();

    cy.wait("@addToCart").its("response.statusCode").should("eq", 200);
  }

  // Vérification finale
  cy.visit("/cart");
  cy.get('[data-cy="cart-line"]').should("have.length", count);
  cy.log(`${count} produit(s) ${unique ? "unique(s)" : ""} ajouté(s)`);
});

Cypress.Commands.add("goToFirstProduct", () => {
  // Utiliser en étant déjà sur la liste des produits

  // Clique sur le premier article
  cy.get("[data-cy='product']")
    .first()
    .find('[data-cy="product-link"]')
    .click();

  // Vérifie qu'on est bien sur la page produit
  cy.get('[data-cy="detail-product-name"]').should("be.visible");
});
