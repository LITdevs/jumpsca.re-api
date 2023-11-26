import express from 'express';
import Database from "../../db.js";
import NotFoundReply from "../../classes/Reply/NotFoundReply.js";
import axios from "axios";

const router = express.Router();

const database = new Database();

router.post('/webhook/:siteId', async (req, res) => {
    let site = await database.Site.findOne({secret: req.query?.key, siteId: req.params.siteId});
    if (!site) return res.reply(new NotFoundReply())
    // noinspection HttpUrlsUsage
    let response = await axios.post(`http://asuna.yggdrasil.cat:5000/deploy/${req.params.siteId}`, JSON.stringify({
        domains: site.deployConfig.domains,
        repoUrl: req.body.repository.url,
        serveFolder: site.deployConfig.serveFolder,
        buildCommand: site.deployConfig.buildCommand
    }), {
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.DEPLOY_KEY
        }
    })
    console.log(response.data)
    res.sendStatus(200)
});

export default router;