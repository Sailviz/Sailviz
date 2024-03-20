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
    cy.wait(2000);
    cy.get("#ToggleSidebar").click();
    cy.wait(2000);
    cy.get("ul").contains(": 1").click();
    cy.get("#OOD").should("be.visible");
    cy.get("#OOD").clear().type("race officer").blur();
    cy.get("#AOD").clear().type("assistant Race officer").blur();
    cy.get("#SO").clear().type("safety officer").blur();
    cy.get("#ASO").clear().type("assistant Safety officer").blur();
    cy.get("#OOD").should("have.value", "Race Officer");
    cy.get("#AOD").should("have.value", "Assistant Race Officer");
    cy.get("#SO").should("have.value", "Safety Officer");
    cy.get("#ASO").should("have.value", "Assistant Safety Officer");

    cy.get("#RacePanelButton").click();
    cy.location("pathname").should("contain", "/HRace");
    cy.wait(5000);
    cy.get("#RaceStateButton").click();
    cy.wait(300000);
    //5 minute countdown has finished
    cy.wait(565000);
    cy.get("#EntrantCards")
      .contains("R Gimmler")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(42000);
    cy.get("#EntrantCards")
      .contains("T Stanislaus")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(15000);
    cy.get("#EntrantCards")
      .contains("P Mallaband")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(4000);
    cy.get("#EntrantCards")
      .contains("A Pegg")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(46000);
    cy.get("#EntrantCards")
      .contains("E Baxter")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(52000);
    cy.get("#EntrantCards")
      .contains("D Sadler")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(349000);
    cy.get("#EntrantCards")
      .contains("R Gimmler")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(67000);
    cy.get("#EntrantCards")
      .contains("P Mallaband")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(45000);
    cy.get("#EntrantCards")
      .contains("A Pegg")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(33000);
    cy.get("#EntrantCards")
      .contains("T Stanislaus")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(6000);
    cy.get("#EntrantCards")
      .contains("E Baxter")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(207000);
    cy.get("#EntrantCards")
      .contains("D Sadler")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(245000);
    cy.get("#EntrantCards")
      .contains("R Gimmler")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(41000);
    cy.get("#EntrantCards")
      .contains("P Mallaband")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(54000);
    cy.get("#EntrantCards")
      .contains("A Pegg")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(38000);
    cy.get("#EntrantCards")
      .contains("E Baxter")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(12000);
    cy.get("#EntrantCards")
      .contains("T Stanislaus")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(294000);
    cy.get("#EntrantCards")
      .contains("D Sadler")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.get("#ModeButton").click();
    cy.wait(131000);
    cy.get("#EntrantCards")
      .contains("R Gimmler")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(17000);
    cy.get("#EntrantCards")
      .contains("P Mallaband")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(93000);
    cy.get("#EntrantCards")
      .contains("T Stanislaus")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(4000);
    cy.get("#EntrantCards")
      .contains("A Pegg")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(19000);
    cy.get("#EntrantCards")
      .contains("E Baxter")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();
    cy.wait(529000);
    cy.get("#EntrantCards")
      .contains("D Sadler")
      .parent()
      .parent()
      .find(".cursor-pointer")
      .click();

    cy.wait(5000);
    cy.get("#CalcResultsButton").click();
  });

  it("Admin check Results", () => {
    cy.readFile("cypress/fixtures/data.json").then((body: any) => {
      const seriesname = body.seriesname;
      cy.log(seriesname);
      cy.Login("alex@alexpegg.uk", "arst");
      cy.wait(1000);
      cy.location("pathname").should("equal", "/AdminDashboard");
      cy.get("[id=leftBar]")
        .contains("li", seriesname)
        .children()
        .filter("ul")
        .as("racenodes");
      cy.get("@racenodes").eq(0).click();
    });
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
