'use strict';

/**
 * play controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { getWssInstance } = require('../../../websocket');

module.exports = createCoreController('api::play.play', ({ strapi }) => ({
  async playEmit(ctx) {
    const email = ctx.request.body?.email || ctx.request.query?.email;
    if (!email) {
      ctx.status = 400;
      ctx.send({ error: 'Email is required' });
      return;
    }

    // Broadcast to all websocket clients
    const wss = getWssInstance();
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ email }));
        }
      });
    }

    ctx.send({ message: 'Email broadcasted', email });
  },
}));
