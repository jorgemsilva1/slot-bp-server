'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = {
  async append(ctx) {
    // 1. Validate payload
    const data = ctx.request.body;
    if (!data || typeof data !== 'object') {
      return ctx.badRequest('A JSON object is required in the request body.');
    }

    // 2. Build CSV row: timestamp + all values
    const currentDate = new Date().toISOString();
    const values = Object.values(data.data);
    const csvRow = `${currentDate},${values.join(',')}\n`;

    // 3. Build file path (Desktop)
    const filePath = path.join(os.homedir(), 'Desktop', 'plays_data.csv');

    // 4. Check existence & write header if needed
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      // Header: date plus each key name
      const headerCols = Object.keys(data).join(',');
      const header = `date,${headerCols}\n`;
      fs.writeFileSync(filePath, header + csvRow);
    } else {
      // Append only the row
      fs.appendFileSync(filePath, csvRow);
    }

    // 5. Response
    ctx.send({ ok: true, message: 'CSV updated', row: csvRow.trim() });
  },
};
