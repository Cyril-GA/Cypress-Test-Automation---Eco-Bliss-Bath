const apiLogin = `${Cypress.env("apiUrl")}/login`;

context("POST /login", () => {
  it("devrait se connecter avec des identifiants valides", () => {
    cy.request({
      method: "POST",
      url: apiLogin,
      body: {
        username: Cypress.env("email"),
        password: Cypress.env("password"),
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");
      expect(response.body.token).to.be.a("string");
    });
  });

  it("devait échouer avec des identifiants invalides", () => {
    cy.request({
      method: "POST",
      url: apiLogin,
      body: {
        username: "wrong@test.fr",
        password: "wrongpassword",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.contain("Invalid credentials");
    });
  });

  it("devrait échouer si les champs sont manquants", () => {
    cy.request({
      method: "POST",
      url: apiLogin,
      body: {},
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});
