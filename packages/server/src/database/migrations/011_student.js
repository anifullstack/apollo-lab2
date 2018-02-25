exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .createTable('student', table => {
        table.increments();
        table.string('title');
        table.string('firstName');
        table.string('lastName');

        table.string('content');
        table.timestamps(false, true);
      })
      .createTable('journal', table => {
        table.increments();
        table
          .integer('student_id')
          .unsigned()
          .references('id')
          .inTable('student')
          .onDelete('CASCADE');
        table.date('activityDate');
        table.string('subject');
        table.string('activity');
        table.string('status');
        table.string('content');
        table.timestamps(false, true);
      })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('journal'), knex.schema.dropTable('student')]);
};
