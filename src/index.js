"use strict";

const {createServer: HttpsServer} = require("https");
const fs = require("fs");
const {WebSocketServer} = require("ws");
module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {

    const https = require('node:https');
    const fs = require('node:fs');
    const options = {
      cert: fs.readFileSync('/etc/letsencrypt/live/bp-strapi.dvagar.cc/fullchain.pem'),
      key: fs.readFileSync('/etc/letsencrypt/live/bp-strapi.dvagar.cc/privkey.pem')
    };

    https.createServer(options, (req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    }).listen(1338);
    const wss = new WebSocketServer(
      {
        server: https
      });
    strapi.wss = wss;

    wss.on("connection", function connection(ws) {
      ws.on("message", async function message(data) {
        const playerEmail = data.toString();
        ws.id = playerEmail;

        const player = await strapi.query("api::player.player").findOne({
          where: { email: playerEmail },
        });

        if (player) {
          const today = new Date();
          const startOfToday = new Date(today.setHours(0, 0, 0, 0));
          const endOfToday = new Date(today.setHours(23, 59, 59, 999));

          const plays = await strapi.query("api::play.play").findMany({
            where: {
              player: { id: player.id },
              created_at: {
                $gte: startOfToday,
                $lte: endOfToday,
              },
            },
          });

          if (plays?.length >= 5 || plays?.find((play) => play.won)) {
            ws.send("limit");
          }
        }

        if (!player) {
          await strapi.query("api::player.player").create({
            data: { email: playerEmail },
          });
        }
      });
    });
  },
};
