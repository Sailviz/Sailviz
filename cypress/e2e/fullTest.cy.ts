describe("full test", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });
  it("Admin Set Up Series", () => {
    cy.Login("alex@alexpegg.uk", "arst");
    cy.location("pathname").should("equal", "/AdminDashboard");
    cy.get("[id=settingsbutton]").click();
    cy.get("[id=createSeriesButton").click();
    let seriesname = "Test" + Math.floor(Math.random() * 10000).toString();
    cy.log(seriesname);
    cy.get("[id=clubTable]").find("[value=NewSeries]").as("seriesname");
    cy.get("@seriesname").clear().type(seriesname).blur();
    cy.writeFile(
      "cypress/fixtures/data.json",
      JSON.stringify({ seriesname: seriesname })
    );
    cy.get("[id=leftBar]").contains("li", seriesname).click();
    cy.get("#seriesAddRace").click();
    cy.wait(1000);
    cy.get("#seriesAddRace").click();
    cy.wait(1000);
    cy.get("#seriesAddRace").click();
    cy.get("[id=leftBar]")
      .contains("li", seriesname)
      .children()
      .filter("ul")
      .as("racenodes");
    cy.get("@racenodes").should("have.length", 2);
    // CODE FOR MAKING A PURSUIT RACE
    // cy.get("@racenodes").eq(1).click();
    // cy.get("[id=raceType]").type("Pursuit{enter}");
  });

  it("Sign on sheet", () => {
    cy.Login("SignOn", "arst");
    cy.location("pathname").should("equal", "/SignOn");

    cy.AddEntry("A Pegg", "C Hargreaves", "RS 400", "1236", [1, 1, 1]);
    cy.AddEntry("R Gimmler", "", "RS AERO 7", "2553", [1, 1, 1]);
    cy.AddEntry("E Baxter", "", "ILCA 7 / Laser", "1774465", [1, 1, 0]);
    cy.AddEntry("P Mallaband", "R Panting", "FIREBALL", "15160", [1, 1, 0]);
    cy.AddEntry("T Stanislaus", "T Pontet", "29ER", "1286", [1, 1, 1]);
    cy.AddEntry("D Sadler", "T Owen", "RS FEVA XL", "7713", [1, 1, 1]);
  });

  it("Race Officer", () => {
    cy.Login("OD@alexpegg.uk", "arst");
    cy.location("pathname").should("equal", "/Dashboard");
  });

  it("Admin delete series", () => {
    cy.readFile("cypress/fixtures/data.json").then((body: any) => {
      const seriesname = body.seriesname;
      cy.log(seriesname);
      cy.Login("alex@alexpegg.uk", "arst");
      cy.location("pathname").should("equal", "/AdminDashboard");
      cy.get("[id=settingsbutton]").click();
      cy.get("[id=clubTable]")
        .find("[value=" + seriesname + "]")
        .as("seriesname");
      cy.get("@seriesname").parent().parent().children().last().click();
    });
  });
});
