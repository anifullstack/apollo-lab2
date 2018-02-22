exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .createTable('student', table => {
        table.increments();
        table.string('title');
        table.string('content');
        table.timestamps(false, true);
      })
      .createTable('note', table => {
        table.increments();
        table
          .integer('student_id')
          .unsigned()
          .references('id')
          .inTable('student')
          .onDelete('CASCADE');
        table.string('content');
        table.timestamps(false, true);
      })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('note'), knex.schema.dropTable('student')]);
};
