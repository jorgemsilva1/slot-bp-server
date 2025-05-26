module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/csv/append',
      handler: 'csv.append',
      config: {
        auth: false,   // or true if you require authentication
      },
    },
  ],
};
