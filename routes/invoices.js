const express = require("express");

const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");




router.get("/",
      async function (req, res, next) {
  try {
    const results = await db.query(
      `SELECT id, comp_code 
       FROM invoices`);

    return res.json({ invoices : results.rows});
  }

  catch (err) {
    return next(err);
  }
});

router.get("/:id",
      async function (req, res, next) {

  try {
    const id = req.params.id;

    const inv_results = await db.query(
      `SELECT *
       FROM invoices
       INNER JOIN companies
       ON (invoices.comp_code=companies.code)
       WHERE id=$1
       `, [id]);
    if (inv_results.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${id}`,404);
      }

      const data = inv_results.rows[0];
      const invoice = {
        id: data.id,
        company: {
          code: data.comp_code,
          name: data.name,
          description: data.description,
        },
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
      };

    return res.json({ 'invoice' : invoice});
  }

  catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
    try {
        let {comp_code, amt} = req.body;
    
        const result = await db.query(
              `INSERT INTO invoices (comp_code, amt) 
               VALUES ($1, $2) 
               RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]);
    
        return res.status(201).json({"invoice": result.rows[0]});
      }
  catch (err) {
    return next(err);
  }
});

router.put("/:id", async function (req, res, next) {
    try {
        const {amt, paid} = req.body;
        const id = req.params.id;

        const currResult = await db.query(
            `SELECT paid
             FROM invoices
             WHERE id = $1`,
          [id]);
        if (currResult.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`,404);
          }
        const currPaidDate = currResult.rows[0].paid_date;

        if (!currPaidDate && paid) {
            paidDate = new Date();
          } else if (!paid) {
            paidDate = null
          } else {
            paidDate = currPaidDate;
          }
        const result = await db.query(
            `UPDATE invoices
            SET amt=$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
             [amt, paid, paidDate, id]);
  
        return res.json({"invoice": result.rows[0]});
    }catch (err) {
      return next(err);
    }
  
  });
  
  
  router.delete("/:id", async function (req, res, next) {
    try {
      let id = req.params.id;
  
      const result = await db.query(
            `DELETE FROM invoices
             WHERE id = $1
             RETURNING id`,
          [id]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${id}`, 404);
      }
  
      return res.json({"status": "deleted"});
    }
  
    catch (err) {
      return next(err);
    }
  });
  
module.exports = router;
