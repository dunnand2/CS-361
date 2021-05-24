const app = require("../server/app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { assert } = require("chai");

const { expect } = chai;
chai.use(chaiHttp);

describe("Test GET route /api", () => {
    it("Returns Hello World on GET Request", (done) => {
        chai.request(app)
            .get("/api")
            .end((err, response) => {
                assert.equal(response.status, 200);
            done();
            })
    })
})