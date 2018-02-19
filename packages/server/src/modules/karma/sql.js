import knex from '../../sql/connector';

export default class Karma {
  karmasPagination(limit, after) {
    let where = '';
    if (after > 0) {
      where = `id < ${after}`;
    }

    return knex
      .select('id', 'title', 'content')
      .from('karma')
      .whereRaw(where)
      .orderBy('id', 'desc')
      .limit(limit);
  }

  getTotal() {
    return knex('karma')
      .countDistinct('id as count')
      .first();
  }

  getNextPageFlag(id) {
    return knex('karma')
      .countDistinct('id as count')
      .where('id', '<', id)
      .first();
  }

  post(id) {
    return knex
      .select('id', 'title', 'content')
      .from('karma')
      .where('id', '=', id)
      .first();
  }

  addKarma({ title, content }) {
    return knex('karma')
      .insert({ title, content })
      .returning('id');
  }

  deleteKarma(id) {
    return knex('post')
      .where('id', '=', id)
      .del();
  }

  editKarma({ id, title, content }) {
    return knex('karma')
      .where('id', '=', id)
      .update({
        title: title,
        content: content
      });
  }
}
