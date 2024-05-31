'use strict';

const axios = require("axios");
/**
 * player controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::player.player', ({strapi}) => ({
  async validate(ctx){
    const { username } = ctx.params;
    const response = await axios.get(`https://service.safe-communication.com/helpers/user-details?username=${username}`)
    ctx.send(response);
  }
}));
