'use strict';

/**
 * play service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { WebSocket } = require('ws')
module.exports = createCoreService('api::play.play',({ strapi }) => ({
  async create(...ctx){
    // Extract player email from ctx
    const playerEmail = ctx[0].data.player;

    const player = await strapi.query('api::player.player').findOne({
      where: { email: playerEmail }
    });

    if (player) {
      ctx[0].data.player = player.id;
    } else {
      throw new Error(`Player with email ${playerEmail} not found`);
    }

    const clients = strapi.wss.clients
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN && playerEmail === client.id) {
        const award = await strapi.query('api::award.award').findOne({
          where: { id: ctx[0].data.prize_id }
        });
        client.send(award?.name);

        if(player){
          const today = new Date();
          const startOfToday = new Date(today.setHours(0, 0, 0, 0));
          const endOfToday = new Date(today.setHours(23, 59, 59, 999));

          const plays = await strapi.query('api::play.play').findMany({
            where: {
              player: { id: player.id },
              created_at: {
                $gte: startOfToday,
                $lte: endOfToday
              }
            }
          });

          if(plays?.length > 5){
            client.send('limit')
          }
        }
      }
    }

    return await super.create(...ctx)
  },

}),);
