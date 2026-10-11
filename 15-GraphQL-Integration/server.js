const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 4000;

  // Create an ApolloServer instance
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Ensure we wait for our server to start
  await server.start();

  // Set up our Express middleware to handle CORS, body parsing,
  // and our expressMiddleware function.
  app.use(
    '/graphql',
    cors(),
    express.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  // Modified server startup
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
