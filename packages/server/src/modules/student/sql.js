import { orderedFor } from '../../sql/helpers';
import knex from '../../sql/connector';

export default class Student {
  studentsPagination(limit, after) {
    let where = '';
    if (after > 0) {
      where = `id < ${after}`;
    }

    return knex
      .select('id', 'title', 'firstName', 'lastName', 'content')
      .from('student')
      .whereRaw(where)
      .orderBy('id', 'desc')
      .limit(limit);
  }

  async getNotesForStudentIds(studentIds) {
    const res = await knex
      .select('id', 'content', 'student_id AS studentId')
      .from('note')
      .whereIn('student_id', studentIds);

    return orderedFor(res, studentIds, 'studentId', false);
  }

  getTotal() {
    return knex('student')
      .countDistinct('id as count')
      .first();
  }

  getNextPageFlag(id) {
    return knex('student')
      .countDistinct('id as count')
      .where('id', '<', id)
      .first();
  }

  student(id) {
    return knex
      .select('id', 'title', 'firstName', 'lastName', 'content')
      .from('student')
      .where('id', '=', id)
      .first();
  }

  addStudent({ title, content, firstName, lastName }) {
    return knex('student')
      .insert({ title, firstName, lastName, content })
      .returning('id');
  }

  deleteStudent(id) {
    return knex('student')
      .where('id', '=', id)
      .del();
  }

  editStudent({ id, title, firstName, lastName, content }) {
    return knex('student')
      .where('id', '=', id)
      .update({
        title: title,
        content: content,
        firstName: firstName,
        lastName: lastName
      });
  }

  addNote({ content, studentId }) {
    return knex('note')
      .insert({ content, student_id: studentId })
      .returning('id');
  }

  getNote(id) {
    return knex
      .select('id', 'content')
      .from('note')
      .where('id', '=', id)
      .first();
  }

  deleteNote(id) {
    return knex('note')
      .where('id', '=', id)
      .del();
  }

  editNote({ id, content }) {
    return knex('note')
      .where('id', '=', id)
      .update({
        content: content
      });
  }
}
