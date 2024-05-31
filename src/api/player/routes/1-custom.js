"use-strict"

module.exports = {
  routes: [{
    method: 'GET',
    path: '/players/validate/:username', // Ensure '/players/validate' is a static path
    handler: 'custom.validate',
  },]
}
