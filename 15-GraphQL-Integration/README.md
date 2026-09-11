# 15. GraphQL Integration (Apollo Server)

This section demonstrates how to build a GraphQL API using Node.js, Express, and Apollo Server (`@apollo/server`). 
GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.

## 🚀 Running the App

To run this demo:

```bash
# from the repository root
npm run start:graphql
```

Then visit [http://localhost:4000/graphql](http://localhost:4000/graphql) in your browser to interact with the **Apollo Sandbox**.

## 💡 Example Queries

Inside the Apollo Sandbox, try running the following operations:

### Fetch All Books

```graphql
query GetBooks {
  books {
    id
    title
    author
  }
}
```

### Fetch a Specific Book

```graphql
query GetBook {
  book(id: "1") {
    title
    author
  }
}
```

### Add a New Book

```graphql
mutation AddNewBook {
  addBook(title: "The Great Gatsby", author: "F. Scott Fitzgerald") {
    id
    title
    author
  }
}
```

## 🧠 Core Concepts Explored
- **Schema (`schema.js`)**: Defines the shape of the data using `typeDefs`.
- **Resolvers (`resolvers.js`)**: Functions that resolve a value for a type or field in a schema.
- **Server (`server.js`)**: Integrating Apollo Server as middleware within an Express app.
