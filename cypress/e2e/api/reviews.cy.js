const apiReviews = `${Cypress.env("apiUrl")}/reviews`;

describe("Reviews API", () => {
  context("GET /reviews", () => {
    it("devrait récupèrer les avis postés sur le site", () => {
      cy.request("GET", apiReviews).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).length.to.be.greaterThan(1);
      });
    });
  });

  context("POST /reviews", () => {
    const reviewData = {
      title: "Titre test",
      comment: "Commentaire test",
      rating: 5,
    };

    let authToken;

    before(() => {
      cy.apiLogin().then((loginData) => {
        authToken = loginData.token;
      });
    });

    it("devrait créer un nouvel avis", () => {
      cy.request({
        method: "POST",
        url: apiReviews,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: reviewData,
      }).then((response) => {
        expect(response.status).to.eq(200);

        expect(response.body).to.have.property("id");
        expect(response.body).to.have.property("date");
        expect(response.body).to.have.property("title");
        expect(response.body).to.have.property("comment");
        expect(response.body).to.have.property("rating");
        expect(response.body).to.have.property("author");

        expect(response.body.title).to.eq(reviewData.title);
        expect(response.body.comment).to.eq(reviewData.comment);
        expect(response.body.rating).to.eq(reviewData.rating);
      });
    });

    it("devrait renvoyer une erreur 401", () => {
      cy.request({
        method: "POST",
        url: apiReviews,
        body: reviewData,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property("message");
        expect(response.body.message).to.contain("JWT Token not found");
      });
    });

    it("devrait renvoyer une erreur 400", () => {
      cy.request({
        method: "POST",
        url: apiReviews,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    // Devrait renvoyer une 400 bad request, à noter dans le bilan de campagne
    // Quand les changements seront fait, le test echouera et pourra alors être modifier
    it("devrait renvoyer une erreur 500", () => {
      cy.request({
        method: "POST",
        url: apiReviews,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          title: "Rating test",
          comment: "Test sans rating",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(500);
      });
    });
  });
});
