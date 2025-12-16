const apiProducts = `${Cypress.env("apiUrl")}/products`;

describe("Products API", () => {
  context("GET /products", () => {
    it("Devrait renvoyer une liste de produits", () => {
      cy.request("GET", apiProducts).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body).length.to.be.greaterThan(1);
        expect(response.body[0]).to.have.all.keys(
          "id",
          "name",
          "availableStock",
          "skin",
          "aromas",
          "ingredients",
          "description",
          "price",
          "picture",
          "varieties"
        );
      });
    });
  });

  context("GET /products/random", () => {
    it("Récupère 3 produits aléatoires", () => {
      cy.request("GET", apiProducts + `/random`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.lengthOf(3);
        response.body.forEach((product) => {
          expect(product).to.have.all.keys(
            "id",
            "name",
            "availableStock",
            "skin",
            "aromas",
            "ingredients",
            "description",
            "price",
            "picture",
            "varieties"
          );
        });
      });
    });
  });

  context("GET /products/{id}", () => {
    before(() => {
      cy.request("GET", apiProducts)
        .its("body")
        .then((products) => {
          const randomProduct = Cypress._.sample(products);
          cy.wrap(randomProduct.id).as("productId");
        });
    });
    it("Récupère le détail d'un produit via un Id", function () {
      cy.request("GET", `${apiProducts}/${this.productId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("object");
        expect(response.body).to.have.all.keys(
          "id",
          "name",
          "availableStock",
          "skin",
          "aromas",
          "ingredients",
          "description",
          "price",
          "picture",
          "varieties"
        );
      });
    });

    it("Renvoie une erreur avec un Id inéxistant", () => {
      let invalidID = 1;
      cy.request({
        method: "GET",
        url: `${apiProducts}/${invalidID}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.contain("404 Not Found");
      });
    });
  });
});
