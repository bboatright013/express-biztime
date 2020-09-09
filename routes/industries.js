const express = require("express");

const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");


router.get("/",
      async function (req, res, next) {
  try {
    const results = await db.query(
      `SELECT name, company_code FROM industries 
      LEFT JOIN markets ON code = industry_code`);

    return res.json(results.rows);
  }

  catch (err) {
    return next(err);
  }
});



router.post("/", async function (req, res, next) {
  try {
    let { code, name } = req.body;

    const result = await db.query(
      `INSERT INTO industries (code, name) 
      VALUES ($1, $2) 
      RETURNING code, name`, [code, name]);

    return res.status(201).json({"industry": result.rows[0]});
  }

  catch (err) {
    return next(err);
  }
});

router.patch("/:code", async function (req, res, next) {
    try {
      const { company_code } = req.body;

  
      const result = await db.query(
            `INSERT INTO markets
             VALUES ($1, $2)
             RETURNING company_code, industry_code`,
          [req.params.code, company_code]
      );
  
      return res.json(result.rows[0]);
    }
  
    catch (err) {
      return next(err);
    }
  });



module.exports = router;
