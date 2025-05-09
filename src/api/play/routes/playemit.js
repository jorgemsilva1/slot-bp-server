module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/playemit',
      handler: 'play.playEmit',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
