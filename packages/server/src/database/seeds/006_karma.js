import { truncateTables } from '../../sql/helpers';

export async function seed(knex, Promise) {
  await truncateTables(knex, Promise, ['karma']);

  await Promise.all(
    [...Array(20).keys()].map(async ii => {
      const karma = await knex('karma')
        .returning('id')
        .insert({
          title: `Karma title ${ii + 1}`,
          content: `Karma content ${ii + 1}`
        });
      console.log('006_karma', karma);
    })
  );
}
