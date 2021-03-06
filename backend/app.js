const express = require("express");
if (process.env.NODE_ENV === "development")
  var ApolloServer = require("apollo-server").ApolloServer;
else ApolloServer = require("apollo-server-express").ApolloServer;
const mongoose = require("mongoose");
const typeDefs = require("./typeDefs");
const resolvers = require("./controllers/resolvers");
const context = require("./controllers/context");
const { MONGODB_URI, IS_TESTING } = require("./util/config");
const path = require("path");

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
if (!IS_TESTING) console.log("connecting to mongoose");
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    if (!IS_TESTING) console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === "development") {
  server.listen().then(({ url }) => {
    if (!IS_TESTING) console.log(`Server ready at ${url}`);
  });
} else {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  server.applyMiddleware({ app, path: "/graphql" });
  app.use(express.static("build"));
  console.log(`Port is ${PORT}`);
  app.listen(PORT, () => console.log("Server is ready"));
  app.get("/*", (_, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}
module.exports = { server, mongoose };
