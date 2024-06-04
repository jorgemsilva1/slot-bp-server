'use strict';

/**
 * award controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { parseISO, startOfDay, endOfDay } = require('date-fns');

module.exports = createCoreController('api::award.award', ({ strapi }) => ({
  async find(ctx) {
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      // Fetch all awards
      const awards = await strapi.entityService.findMany('api::award.award', {
        populate: { plays: true, icon: true }
      });

      // Filter awards based on the number of plays
      const filteredAwards = await Promise.all(
        awards.map(async award => {
          const playCount = await strapi.entityService.count('api::play.play', {
            filters: {
              prize_id: award.id,
              created_at: {
                $gte: startOfToday,
                $lte: endOfToday,
              }
            }
          });
          return playCount < award.daily_max || award.daily_max === null ? award : null;
        })
      );

      // Remove null values
      ctx.body = filteredAwards.filter(award => award !== null);
    } catch (err) {
      ctx.body = err;
    }
  },
}));
