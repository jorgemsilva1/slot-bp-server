module.exports = ({ env }) => ({
  io: {
    enabled: true,
    config: {
      contentTypes: [{ uid: "api::award.award", actions: ["create"] }],
      events: [
        {
          name: "prize-won",
          handler: ({ strapi }, socket, data) => {
            console.log("SOCKET", data);
            // socket.emit("hello", "world");
          },
        },
      ],
    },
  },
});
