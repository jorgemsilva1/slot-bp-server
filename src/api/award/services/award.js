'use strict';

/**
 * award service
 */

const { createCoreService } = require('@strapi/strapi').factories;

const fs = require('fs');
const path = require('path');

module.exports = createCoreService('api::award.award', ({ strapi }) => ({
  async update(params, data, { files } = {}) {

    const allAwards = await strapi.entityService.findMany('api::award.award', {});

    // Extract the quantities and prepare the row for the CSV file
    const qtys = allAwards.map(award => award.qty);
    const currentDate = new Date().toISOString();
    const csvRow = `${currentDate},${qtys.join(',')}\n`;

    const os = require('os');
    const path = require('path');

// Build path to the user's Desktop
    const filePath = path.join(os.homedir(), 'Desktop', 'awards_data.csv');

    // Check if the file exists to determine if we should include the header
    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
      // Prepare the header row (date, qty1, qty2, qty3, ...)
      const header = `date,${allAwards.map((award, index) => `${award.name}`).join(',')}\n`;
      fs.writeFileSync(filePath, header + csvRow);
    } else {
      // Append the new row to the existing file
      fs.appendFileSync(filePath, csvRow);
    }

    return await super.update(params, data, {files});
  },
}));
