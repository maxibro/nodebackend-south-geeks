(async () => {
  const { app } = require("./middleware/config/Application");
  const application = await app();
})();
