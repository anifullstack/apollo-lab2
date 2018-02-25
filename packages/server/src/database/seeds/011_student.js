import { truncateTables } from '../../sql/helpers';
import casual from 'casual';


export async function seed(knex, Promise) {
  await truncateTables(knex, Promise, ['student', 'comment']);

  await Promise.all(
    [...Array(20).keys()].map(async ii => {
      const student = await knex('student')
        .returning('id')
        .insert({
          title: `Student title ${ii + 1}`,
          firstName: `${casual.first_name}`,
          lastName: `${casual.last_name}`,
          content: `Student content ${ii + 1}`
        });

      await Promise.all(
        [...Array(2).keys()].map(async jj => {
          return knex('note')
            .returning('id')
            .insert({
              student_id: student[0],
              content: `Note title ${jj + 1} for student ${student[0]}`
            });
        })
      );
    })
  );
}
