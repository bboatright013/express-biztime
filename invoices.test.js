process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("./app");
const db = require("./db");

let testCompany = { code : "test", name : "Test Company", description: "A hot up and coming startup in the software field"}

let testInvoice = { id : 1, comp_code : "test", amt : 1000, paid: false}

beforeAll(async function() {
    let result = await db.query(`
      INSERT INTO
        companies (code,name,description)
        VALUES ('${testCompany.code}','${testCompany.name}','${testCompany.description}')
        RETURNING code, name`);

    sampleCompany = result.rows[0];
  });

beforeEach(async function() {
    let result = await db.query(`
      INSERT INTO
        invoices (comp_code,amt,paid)
        VALUES ('${testInvoice.comp_code}','${testInvoice.amt}','${testInvoice.paid}')
        RETURNING id, comp_code, amt, paid`);
        let moreResults = await db.query(`
        UPDATE invoices
        SET id = 1, add_date = '2020-09-08T04:00:00.000Z'
        WHERE comp_code = 'test'
        `);
    sameplInvoice1 = moreResults.rows;
    sampleinvoice2 = result.rows[0];
  });

afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM invoices");
  });
  
  afterAll(async function() {
    // close db connection
    await db.query("DELETE FROM companies");
    await db.end();
  });

  describe("GET /invoices", function(){
      test("Gets a list of invoices", async function(){
        const response = await request(app).get('/invoices');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "invoices": [
              {
                "id": 1,
                "comp_code": "test"
              }]
          })
      })
  });

  describe("GET /invoices/:id", function(){
    test("Gets an invoice with details", async function(){
      const response = await request(app).get(`/invoices/${testInvoice.id}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        "invoice": {
          "id": 1,
          "company": {
            "code": "test",
            "name": "Test Company",
            "description": "A hot up and coming startup in the software field"
          },
          "amt": 1000,
          "paid": false,
          "add_date": "2020-09-08T04:00:00.000Z",
          "paid_date": null
        }
      })
    })
    test("Gives good error when non real code given", async function(){
        const response = await request(app).get('/invoices/0000');
        expect(response.statusCode).toEqual(404);
    })
})


describe("POST /invoices", function(){
    test("Add an invoice", async function(){
      const response = await request(app)
      .post('/invoices')
      .send({ "comp_code" : "test", "amt" : 1000, "paid": false});

      expect(response.statusCode).toEqual(201);
    })
})

describe("PUT /invoices/:id", function(){
    test("Update an invoice", async function(){
      const response = await request(app)
      .put(`/invoices/${testInvoice.id}`)
      .send({"amt" : 500, "paid":false});
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        "invoice": {
          "id": 1,
          "comp_code": "test",
          "amt": 500,
          "paid": false,
          "add_date": "2020-09-08T04:00:00.000Z",
          "paid_date": null
        }
      })
    })
    test("Gives good error when non real code given", async function(){
        const response = await request(app).put('/invoices/5000');
        expect(response.statusCode).toEqual(404);
    })
})

describe("DELETE /invoices/:id", function(){
    test("Delete an invoice", async function(){
      const response = await request(app)
      .delete(`/invoices/${testInvoice.id}`)

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({status: "deleted"})
    })
    test("Gives good error when non real code given", async function(){
        const response = await request(app).get('/invoices/51243');
        expect(response.statusCode).toEqual(404);
    })
})