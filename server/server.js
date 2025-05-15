import app from "./src/app.js";
import { config } from "./src/config/config.js";

const startServer = () => {
  const PORT = config.PORT || 8080;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
