const {Page} = require('../models/page')
const {Store} = require('../models/store')
const express = require('express')
const mongoose = require('mongoose')
const router  = express.Router()
router.get('/', (req,res) =>{
    Page.find((error, pages) => {
        if (error) console.log(error);
        res.json(pages);
      })
})

router.post('/', async (req,res) =>{
    let page = new Page({
        name: req.body.name,
        path: req.body.path,
        icon: req.body.icon,
      });
      page = await page.save();
    
      if (!page) return res.status(404).status.send("The page cannot be created");
    
      res.send(page);
})

router.put('/:id', async (req,res) =>{
    let page = new Page({
        name: req.body.name,
        path: req.body.path,
        icon: req.body.icon,
      });
      page = await page.save();
    
      if (!page) return res.status(404).status.send("The page cannot be created");
    
      res.send(page);
})



module.exports = router

