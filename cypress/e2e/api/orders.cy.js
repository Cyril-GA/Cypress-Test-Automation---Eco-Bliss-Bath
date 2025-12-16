let apiOrders = `${Cypress.env("apiUrl")}/orders`;

describe("Orders API", () => {
  context("GET /orders avec utilisateur standard", () => {
    let authToken;

    before(() => {
      cy.apiLogin().then((loginData) => {
        authToken = loginData.token;
      });
    });

    it("Devrait renvoyer 401 Unauthorized", () => {
      cy.request({
        method: "GET",
        url: apiOrders,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.contain("JWT Token not found");
      });
    });

    it("Récupère le panier en cours chez l'utilisateur connecté", () => {
      cy.request({
        method: "GET",
        url: apiOrders,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.all.keys(
          "id",
          "firstname",
          "lastname",
          "address",
          "zipCode",
          "city",
          "date",
          "validated",
          "orderLines"
        );
        expect(response.body.orderLines).to.be.an("Array");
      });
    });
  });

  context("GET /orders avec un nouvel utilisateur (panier non créé)", () => {
    // Utilisateur connecté, n'ayant jamais eu de panier
    let newUser = {};
    let newUserToken;

    before(() => {
      // Crée un user unique
      cy.registerNewUser().then((data) => {
        newUser = data;
        // Login avec ce user
        return cy.apiLogin(newUser.email, newUser.password).then((login) => {
          newUserToken = login.token;
        });
      });
    });

    // Vérification sur le newUSer
    it("Devrait renvoyer 404 si le panier n'a jamais été créé", () => {
      cy.request({
        method: "GET",
        url: apiOrders,
        headers: { Authorization: `bearer ${newUserToken}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  context("POST /orders", () => {
    let authToken;
    let orderLineId;

    before(() => {
      cy.setupCartWithProduct().then((data) => {
        authToken = data.authToken;
        orderLineId = data.orderLineId;
      });
    });

    it("Devrait échouer sans authentification", () => {
      cy.request({
        method: "POST",
        url: apiOrders,
        failOnStatusCode: false,
      }).then((response) => {
        // Note : Devrait idéalement être 401 pas 500
        expect(response.status).to.be.oneOf([401, 500]);
      });
    });

    // Devrait renvoyer 404 mais renvoie 400 ?
    it("Renvoie une erreur 404 Not Found sans données entrées", () => {
      cy.request({
        method: "POST",
        url: apiOrders,
        headers: { Authorization: `bearer ${authToken}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.contain("404 Not Found");
      });
    });

    it("Renvoie un status 200 avec un commande valide", () => {
      cy.setupCartWithProduct().then(({ authToken }) => {
        cy.generateUniqueUser().then((user) => {
          cy.request({
            method: "POST",
            url: apiOrders,
            headers: { Authorization: `bearer ${authToken}` },
            body: {
              firstname: user.firstname,
              lastname: user.lastname,
              address: user.address,
              zipCode: user.zipCode,
              city: user.city,
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    });
  });

  context("PUT /orders/add", () => {
    let authToken;
    before(() => {
      cy.apiLogin().then((loginData) => {
        authToken = loginData.token;
      });
    });

    it("Renvoie une erreur 401 Unauthorized si aucun utilisateur connecté", () => {
      cy.request({
        method: "PUT",
        url: `${apiOrders}/add`,
        body: {
          product: 5,
          quantity: 1,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("Rajoute un article au panier", () => {
      cy.request({
        method: "PUT",
        url: `${apiOrders}/add`,
        body: {
          product: 5,
          quantity: 1,
        },
        headers: { Authorization: `bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("orderLines");
        expect(response.body.orderLines).to.be.an("array");
      });
    });

    it("Renvoie une erreur 400 sans articles ajouté", () => {
      cy.request({
        method: "PUT",
        url: `${apiOrders}/add`,
        headers: { Authorization: `bearer ${authToken}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property("error");
        expect(response.body.error).to.have.property("product");
        expect(response.body.error.product).to.be.an("array");
        expect(response.body.error.product[0]).to.contain(
          "This value should not be blank"
        );
      });
    });
  });

  context("DELETE /orders/{id}/delete", () => {
    let authToken;
    let orderLineId;
    const wrongId = 99999;

    before(() => {
      cy.setupCartWithProduct().then((data) => {
        authToken = data.authToken;
        orderLineId = data.orderLineId;
      });
    });

    it("Supprime un produit du panier", () => {
      cy.request({
        method: "DELETE",
        url: `${apiOrders}/${orderLineId}/delete`,
        headers: { Authorization: `bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("object");
        expect(response.body).to.have.property("orderLines");
        expect(response.body.orderLines).to.be.an("array");
      });
    });

    it("Renvoie Error 404 si l'id orderLines est incorrect", () => {
      cy.request({
        method: "DELETE",
        url: `${apiOrders}/${wrongId}/delete`,
        headers: { Authorization: `bearer ${authToken}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.contain("Produit non trouvé");
      });
    });

    it("Envoie une erreur 500 au /delete sans token", () => {
      cy.request({
        method: "DELETE",
        url: `${apiOrders}/${orderLineId}/delete`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(500);
      });
    });
  });

  context("PUT /orders/{id}/change-quantity", () => {
    let authToken;
    let orderLineId;
    const wrongId = 99999;
    const newValue = 2;

    before(() => {
      // Connexion
      cy.setupCartWithProduct().then((data) => {
        authToken = data.authToken;
        orderLineId = data.orderLineId;
      });
    });

    it("Met à jour la quantité du produit", () => {
      cy.request({
        method: "PUT",
        url: `${apiOrders}/${orderLineId}/change-quantity`,
        headers: { Authorization: `bearer ${authToken}` },
        body: { quantity: newValue },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("object");
        expect(response.body).to.have.property("orderLines");
        expect(response.body.orderLines[0]).to.have.property("quantity");
        expect(response.body.orderLines).to.be.an("array");
        expect(response.body.orderLines[0].quantity).to.eq(newValue);
      });
    });

    it("Renvoie Error 404 si l'id orderLines est incorrect", () => {
      cy.request({
        method: "PUT",
        url: `${apiOrders}/${wrongId}/change-quantity`,
        headers: { Authorization: `bearer ${authToken}` },
        body: { quantity: 3 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.contain("Produit non trouvé");
      });
    });

    it("Envoie une erreur 500 sans token", () => {
      cy.request({
        method: "PUT",
        url: `${apiOrders}/${orderLineId}/change-quantity`,
        body: { quantity: 3 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(500);
      });
    });
  });
});
