const express = require("express");

const router = new express.Router();
const db = require("../db");


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

    return res.json(results.rows);
  }

  catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { name, code, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
      VALUES ($1, $2, $3) 
      RETURNING code, name`, [code, name, description]);

    return res.json(result.rows);
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
