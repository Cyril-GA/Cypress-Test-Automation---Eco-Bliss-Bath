const apiRegister = `${Cypress.env("apiUrl")}/register`;
const apiUser = `${Cypress.env("apiUrl")}/me`;

describe("Users API", () => {
  context("POST /register", () => {
    it("Devrait inscrire un utilisateur", () => {
      cy.generateUniqueUser().then((user) => {
        cy.request({
          method: "POST",
          url: apiRegister,
          body: {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            plainPassword: { first: user.password, second: user.password },
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("id");
          expect(response.body).to.have.property("username");
          expect(response.body).to.have.property("firstname");
          expect(response.body).to.have.property("lastname");
          expect(response.body).to.have.property("plainPassword");

          expect(response.body.id).to.be.a("number");
          expect(response.body.username).to.eq(user.email);
          expect(response.body.firstname).to.eq(user.firstname);
          expect(response.body.lastname).to.eq(user.lastname);
          expect(response.body.plainPassword).to.eq(user.password);
        });
      });
    });

    context("Validation des champs obligatoires", () => {
      const requiredFields = [
        { field: "email" },
        { field: "firstname" },
        { field: "lastname" },
      ];

      requiredFields.forEach(({ field }) => {
        it(`Devrait échouer si le champ "${field}" est vide`, () => {
          cy.generateUniqueUser().then((user) => {
            const userData = {
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
              plainPassword: { first: user.password, second: user.password },
            };

            // Supprimer le champ à tester
            delete userData[field];

            cy.request({
              method: "POST",
              url: apiRegister,
              body: userData,
              failOnStatusCode: false,
            }).then((response) => {
              expect(response.status).to.eq(400);
              expect(response.body).to.have.property(field);
              expect(response.body[field]).to.include(
                "This value should not be blank."
              );
            });
          });
        });
      });
    });

    it("Devrait renvoyer une erreur 400 si plainPassword vide", () => {
      cy.generateUniqueUser().then((user) => {
        cy.request({
          method: "POST",
          url: apiRegister,
          body: {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property("plainPassword");
          expect(response.body.plainPassword).to.have.property("first");
          expect(response.body.plainPassword.first).to.contain(
            "This value should not be blank."
          );
        });
      });
    });

    it("Devrait renvoyer une erreur 400 si les deux password sont différents", () => {
      cy.generateUniqueUser().then((user) => {
        cy.request({
          method: "POST",
          url: apiRegister,
          body: {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            plainPassword: {
              first: user.password,
              second: user.differentPassword,
            },
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property("plainPassword");
          expect(response.body.plainPassword).to.have.property("first");
          expect(response.body.plainPassword.first).to.contain(
            "Les mots de passe doivent correspondre"
          );
        });
      });
    });

    it("Devrait échouer si l'email est déjà utilisé", () => {
      cy.generateUniqueUser().then((user) => {
        cy.request({
          method: "POST",
          url: apiRegister,
          body: {
            email: user.email,
            firstname: "testUser",
            lastname: user.lastname,
            plainPassword: { first: user.password, second: user.password },
          },
        }).then((response) => {
          expect(response.status).to.eq(200);

          cy.request({
            method: "POST",
            url: apiRegister,
            body: {
              email: user.email,
              firstname: "anotherUser",
              lastname: user.lastname,
              plainPassword: { first: user.password, second: user.password },
            },
            failOnStatusCode: false,
          }).then((duplicateResponse) => {
            expect(duplicateResponse.status).to.eq(400);
            expect(duplicateResponse.body).to.have.property("email");
            expect(duplicateResponse.body.email).to.contain(
              "Cette adresse mail est déjà utilisée"
            );
          });
        });
      });
    });
  });

  context("GET /me", () => {
    let authToken;
    let loginUsername;

    before(() => {
      cy.apiLogin().then((loginData) => {
        authToken = loginData.token;
        loginUsername = loginData.username;
      });
    });

    it("Devrait récuperer les infos de l'utilisateur connecté", () => {
      cy.request({
        method: "GET",
        url: apiUser,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);

        // Vérifier la présence de toute les propriétés
        expect(response.body).to.have.all.keys(
          "id",
          "email",
          "userIdentifier",
          "username",
          "roles",
          "password",
          "salt",
          "firstname",
          "lastname"
        );

        expect(response.body.email).to.eq(loginUsername);
      });
    });

    it("Devrait renvoyer une erreur 500 sans utilisateur connecté", () => {
      cy.request({
        method: "GET",
        url: apiUser,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(500);
        expect(response.body).to.contain("Internal Server Error");
      });
    });
  });
});
