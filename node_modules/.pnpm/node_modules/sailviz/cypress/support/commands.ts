declare namespace Cypress {
  interface Chainable {
    Login(username: string, password: string): Chainable<JQuery<HTMLElement>>;
    AddEntry(
      helm: string,
      crew: string,
      boat: string,
      sailNum: string,
      races: Array<number>
    ): Chainable<JQuery<HTMLElement>>;
    CleverType(id: string, text: string): Chainable<JQuery<HTMLElement>>;
  }
}

Cypress.Commands.add("Login", (username, password) => {
  cy.intercept("/api/Authenticate").as("Auth");
  cy.get("section").click();
  cy.get("form").get("input").eq(0).type(username);
  cy.get("form").get("input").eq(1).type(password);
  cy.get("form").get("input").eq(2).click();
  cy.wait("@Auth")
    .its("response.body")
    .should("have.all.keys", "club", "error", "token", "user");
  cy.wait(500);
  cy.getCookie("token").should("exist");
});

Cypress.Commands.add("AddEntry", (helm, crew, boat, sailNum, races) => {
  cy.get("[id=addEntry]").click();
  cy.get("[id=Helm]").type(helm);
  if (crew != "") {
    cy.get("[id=Crew]").type(crew);
  }
  cy.get("[id=Class]").type(boat + "{enter}");
  cy.get("[id=SailNum]").type(sailNum);

  cy.get(".tgl-btn").should("have.length", races.length).as("raceSelectors");

  console.log(races);
  Cypress._.times(races.length, (i) => {
    if (races[i]) {
      cy.get("@raceSelectors").eq(i).click();
    }
    i++;
  });
  cy.wrap(races).each((i) => {});

  cy.get("#confirmEntry").click();

  Cypress._.times(races.length, (i) => {
    if (races[i]) {
      cy.get("[id^=signOnTable-]")
        .eq(i)
        .find("tbody")
        .children({ timeout: 10000 })
        .and("contain", helm)
        .and("contain", crew)
        .and("contain", boat, { matchCase: false })
        .and("contain", sailNum);
    }
    i++;
  });
});

Cypress.Commands.add("CleverType", (id, text) => {
  Cypress._.times(text.length, (i) => {
    cy.get(id).type(text[i] || "");
  });
});
