"use strict";

/**
 * play service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const { WebSocket } = require("ws");
module.exports = createCoreService("api::play.play", ({ strapi }) => ({
  async create(...ctx) {
    // Extract player email from ctx
    const playerEmail = ctx[0].data.player;

    const player = await strapi.query("api::player.player").findOne({
      where: { email: playerEmail },
    });

    if (player) {
      ctx[0].data.player = player.id;
    } else {
      throw new Error(`Player with email ${playerEmail} not found`);
    }

    let award;

    if (ctx[0].data.prize_id) {
      award = await strapi.query("api::award.award").findOne({
        where: { id: ctx[0].data.prize_id },
      });
    }

    const clients = strapi.wss.clients;
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN && playerEmail === client.id) {
        if (ctx[0].data.prize_id) {
          award = await strapi.query("api::award.award").findOne({
            where: { id: ctx[0].data.prize_id },
          });
          client.send(award?.name);
        }

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

          if (plays?.length >= 4 || plays?.find((play) => play.won)) {
            if (!award) {
              client.send("limit");
            } else {
              setTimeout(() => {
                client.send("limit");
              }, 5000);
            }
          }

          if (ctx[0].data.won) {
            setTimeout(() => {
              client.send("limit");
            }, 5000);
          }
        }
      }
    }

    const res = await super.create(...ctx);
    if (award) {
      const SibApiV3Sdk = require("@getbrevo/brevo");

      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      let apiKey = apiInstance.authentications["apiKey"];
      apiKey.apiKey = process.env.BREVO_KEY;

      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.subject = "Prémio Bacana PLAY!";
      sendSmtpEmail.templateId = 12;
      sendSmtpEmail.sender = {
        email: "guilherme@dvagar.cc",
        name: "Bacana Play",
      };
      sendSmtpEmail.to = [{ email: playerEmail }];
      sendSmtpEmail.params = { prize_name: award.name, prize_id: res.id };

      apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {},
        function (error) {
          console.error(error);
        }
      );
    }
    return res;
  },
}));
