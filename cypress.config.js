const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    email: "test2@test.fr",
    password: "testtest",
    apiUrl: "http://localhost:8081",
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:4200/#",
  },
});
