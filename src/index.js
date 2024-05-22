"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const io = require("socket.io")(strapi.server.httpServer, {
      cors: {
        // cors setup
        origin: [process.env.SLOT_URL, process.env.CLIENT_URL], // Replace with your client's origin
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", function (socket) {
      //Listening for a connection from the frontend
      socket.on("prize-won", async (awardId) => {
        if (!awardId) return socket.emit("bp-prize", null);

        // Listening for a join connection
        const item = await strapi.entityService.findOne(
          "api::award.award",
          awardId
        );

        socket.emit("bp-prize", { prize: item.name });
      });

      socket.on("can-play", (bool) => {
        if (!bool) {
          console.log("NÃO PODE JOGAR");
          socket.emit("block", true);
        }
      });
    });
  },
};
