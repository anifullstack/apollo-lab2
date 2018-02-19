import { withFilter } from 'graphql-subscriptions';

const KARMA_SUBSCRIPTION = 'karma_subscription';
const KARMAS_SUBSCRIPTION = 'karmas_subscription';

/*eslint-disable no-unused-vars*/
export default pubsub => ({
  Query: {
    async karmas(obj, { limit, after }, context) {
      let edgesArray = [];
      let karmas = await context.Karma.karmasPagination(limit, after);

      karmas.map(karma => {
        edgesArray.push({
          cursor: karma.id,
          node: {
            id: karma.id,
            title: karma.title,
            content: karma.content
          }
        });
      });

      const endCursor = edgesArray.length > 0 ? edgesArray[edgesArray.length - 1].cursor : 0;

      const values = await Promise.all([context.Karma.getTotal(), context.Karma.getNextPageFlag(endCursor)]);

      return {
        totalCount: values[0].count,
        edges: edgesArray,
        pageInfo: {
          endCursor: endCursor,
          hasNextPage: values[1].count > 0
        }
      };
    },
    karma(obj, { id }, context) {
      return context.Karma.karma(id);
    }
  },
  Karma: {},
  Mutation: {
    async addKarma(obj, { input }, context) {
      const [id] = await context.Karma.addKarma(input);
      const karma = await context.Karma.karma(id);
      // publish for post list
      pubsub.publish(KARMAS_SUBSCRIPTION, {
        karmasUpdated: {
          mutation: 'CREATED',
          id,
          node: karma
        }
      });
      return karma;
    },
    async deleteKarma(obj, { id }, context) {
      const karma = await context.Karma.karma(id);
      const isDeleted = await context.Karma.deleteKarma(id);
      if (isDeleted) {
        // publish for post list
        pubsub.publish(KARMAS_SUBSCRIPTION, {
          karmasUpdated: {
            mutation: 'DELETED',
            id,
            node: karma
          }
        });
        return { id: karma.id };
      } else {
        return { id: null };
      }
    }
  },
  Subscription: {
    karmaUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(KARMA_SUBSCRIPTION),
        (payload, variables) => {
          return payload.karmaUpdated.id === variables.id;
        }
      )
    },
    karmasUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(KARMAS_SUBSCRIPTION),
        (payload, variables) => {
          return variables.endCursor <= payload.karmasUpdated.id;
        }
      )
    }
  }
});
