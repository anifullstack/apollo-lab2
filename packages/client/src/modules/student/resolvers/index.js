import NOTE_QUERY_CLIENT from '../graphql/NoteQuery.client.graphql';

const TYPE_NAME = 'NoteState';

const defaults = {
  note: {
    id: null,
    content: '',
    __typename: TYPE_NAME
  }
};

const resolvers = {
  Query: {
    noteState: (_, args, { cache }) => {
      const { note: { note } } = cache.readQuery({ query: NOTE_QUERY_CLIENT });
      return {
        note: note,
        __typename: TYPE_NAME
      };
    }
  },
  Mutation: {
    onNoteSelect: async (_, { note }, { cache }) => {
      await cache.writeData({
        data: {
          note: {
            ...note,
            __typename: TYPE_NAME
          }
        }
      });

      return null;
    }
  }
};

export default {
  defaults,
  resolvers
};
