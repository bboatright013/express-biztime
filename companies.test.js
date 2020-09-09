process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("./app");
const db = require("./db");

let testCompany = { code : "test", name : "Test Company", description: "A hot up and coming startup in the software field"}


beforeEach(async function() {
    let result = await db.query(`
      INSERT INTO
        companies (code,name,description)
        VALUES ('${testCompany.code}','${testCompany.name}','${testCompany.description}')
        RETURNING code, name`);
    sampleCompany = result.rows[0];
  });

afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM companies");
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });

  describe("GET /companies", function(){
      test("Gets a list of companies", async function(){
        const response = await request(app).get('/companies');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual([
            {
              "code": "test",
              "name": "Test Company"
            }
          ])
      })
  });

  describe("GET /companies/:code", function(){
    test("Gets a company with details", async function(){
      const response = await request(app).get(`/companies/${testCompany.code}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        "code": "test",
        "name": "Test Company",
        "description": "A hot up and coming startup in the software field",
        "invoices": [],
        "industries": []
      })
    })
    test("Gives good error when non real code given", async function(){
        const response = await request(app).get('/companies/notatest');
        expect(response.statusCode).toEqual(404);
    })
})


describe("POST /companies", function(){
    test("Add a company", async function(){
      const response = await request(app)
      .post('/companies')
      .send({"name" : "Tasty Company",
            "description": "a tasty startup"});
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({ "company" :
      {
        "code": "tasty-company",
        "name": "Tasty Company"
      }})
    })
})

describe("PATCH /companies/:code", function(){
    test("Update a company", async function(){
      const response = await request(app)
      .patch(`/companies/${testCompany.code}`)
      .send({"name" : "Tasty Company",
            "description": "a tasty startup"});
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
          "code" : "test",
        "name": "Tasty Company"})
    })
    test("Gives good error when non real code given", async function(){
        const response = await request(app).get('/companies/notatest');
        expect(response.statusCode).toEqual(404);
    })
})

describe("DELETE /companies/:code", function(){
    test("Delete a company", async function(){
      const response = await request(app)
      .delete(`/companies/${testCompany.code}`)

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({message: "Deleted"})
    })
    test("Gives good error when non real code given", async function(){
        const response = await request(app).get('/companies/notatest');
        expect(response.statusCode).toEqual(404);
    })
})