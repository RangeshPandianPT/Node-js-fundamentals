// Simple mock database
let books = [
  {
    id: '1',
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    id: '2',
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
    book: (_, args) => books.find(book => book.id === args.id),
  },
  Mutation: {
    addBook: (_, args) => {
      const newBook = {
        id: String(books.length + 1),
        title: args.title,
        author: args.author,
      };
      books.push(newBook);
      return newBook;
    }
  }
};

module.exports = resolvers;
