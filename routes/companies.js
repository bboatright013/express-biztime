const express = require("express");

const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");


router.get("/",
      async function (req, res, next) {
  try {
    const results = await db.query(
      `SELECT code, name 
       FROM companies`);

    return res.json(results.rows);
  }

  catch (err) {
    return next(err);
  }
});

router.get("/:code",
      async function (req, res, next) {
  try {
    const code = req.params.code;

    const results = await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code=$1`, [code]);
    const their_invoices = await db.query(
        `SELECT id, amt, paid, add_date, paid_date
        FROM invoices
        WHERE comp_code = $1`, [code]
    );
    const their_industries = await db.query(
        `SELECT industries.name FROM industries JOIN markets
        ON industries.code = industry_code JOIN companies
        ON company_code = companies.code
        WHERE companies.code= $1`, [code]
    );
    if(results.rows.length === 0){
        throw new ExpressError("A company does not have that code", 404);
    }
    const company = results.rows[0];
    company.invoices = their_invoices.rows; 
    company.industries = their_industries.rows;
    return res.json(company);
  }

  catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let { name, description } = req.body;
    let code = slugify(name, {lower: true});


    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
      VALUES ($1, $2, $3) 
      RETURNING code, name`, [code, name, description]);

    return res.status(201).json({"company": result.rows[0]});
  }

  catch (err) {
    return next(err);
  }
});

router.patch("/:code", async function (req, res, next) {
    try {
      const { name, description } = req.body;
  
      const result = await db.query(
            `UPDATE companies SET name=$1, description=$3
             WHERE code = $2
             RETURNING code, name`,
          [name, req.params.code, description]
      );
  
      return res.json(result.rows[0]);
    }
  
    catch (err) {
      return next(err);
    }
  });

  router.delete("/:code", async function (req, res, next) {
    try {
      const result = await db.query(
          "DELETE FROM companies WHERE code = $1",
          [req.params.code]
      );
  
      return res.json({message: "Deleted"});
    }
  
    catch (err) {
      return next(err);
    }
  });

module.exports = router;
