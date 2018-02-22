import { expect } from 'chai';
import { step } from 'mocha-steps';
import _ from 'lodash';

import Renderer from '../../../testHelpers/Renderer';
import POSTS_SUBSCRIPTION from '../graphql/StudentsSubscription.graphql';
import POST_SUBSCRIPTION from '../graphql/StudentSubscription.graphql';
import COMMENT_SUBSCRIPTION from '../graphql/NoteSubscription.graphql';

const createNode = id => ({
  id: `${id}`,
  title: `Student title ${id}`,
  content: `Student content ${id}`,
  notes: [
    { id: id * 1000 + 1, content: 'Student note 1', __typename: 'Note' },
    { id: id * 1000 + 2, content: 'Student note 2', __typename: 'Note' }
  ],
  __typename: 'Student'
});

const mutations = {
  editStudent: true,
  addNote: true,
  editNote: true,
  onNoteSelect: true
};

const mocks = {
  Query: () => ({
    students(ignored, { after }) {
      const totalCount = 4;
      const edges = [];
      for (let i = +after + 1; i <= +after + 2; i++) {
        edges.push({
          cursor: i,
          node: createNode(i),
          __typename: 'StudentEdges'
        });
      }
      return {
        totalCount,
        edges,
        pageInfo: {
          endCursor: edges[edges.length - 1].cursor,
          hasNextPage: true,
          __typename: 'StudentPageInfo'
        },
        __typename: 'Students'
      };
    },
    student(obj, { id }) {
      return createNode(id);
    }
  }),
  Mutation: () => ({
    deleteStudent: (obj, { id }) => createNode(id),
    deleteNote: (obj, { input }) => input,
    ...mutations
  })
};

describe('Students and notes example UI works', () => {
  const renderer = new Renderer(mocks, {});
  let app;
  let content;

  beforeEach(() => {
    // Reset spy mutations on each step
    Object.keys(mutations).forEach(key => delete mutations[key]);
    if (app) {
      app.update();
      content = app.find('#content').last();
    }
  });

  step('Students page renders without data', () => {
    app = renderer.mount();
    content = app.find('#content').last();
    renderer.history.push('/students');

    content.text().should.equal('Loading...');
  });

  step('Students page renders with data', () => {
    expect(content.text()).to.include('Student title 1');
    expect(content.text()).to.include('Student title 2');
    expect(content.text()).to.include('2 / 4');
  });

  step('Clicking load more works', () => {
    const loadMoreButton = content.find('#load-more').last();
    loadMoreButton.simulate('click');
  });

  step('Clicking load more loads more students', () => {
    expect(content.text()).to.include('Student title 3');
    expect(content.text()).to.include('Student title 4');
    expect(content.text()).to.include('4 / 4');
  });

  step('Check subscribed to student list updates', () => {
    expect(renderer.getSubscriptions(POSTS_SUBSCRIPTION)).has.lengthOf(1);
  });

  step('Updates student list on student delete from subscription', () => {
    const subscription = renderer.getSubscriptions(POSTS_SUBSCRIPTION)[0];
    subscription.next({
      data: {
        studentsUpdated: {
          mutation: 'DELETED',
          node: createNode(2),
          __typename: 'UpdateStudentPayload'
        }
      }
    });

    expect(content.text()).to.not.include('Student title 2');
    expect(content.text()).to.include('3 / 3');
  });

  step('Updates student list on student create from subscription', () => {
    const subscription = renderer.getSubscriptions(POSTS_SUBSCRIPTION)[0];
    subscription.next(
      _.cloneDeep({
        data: {
          studentsUpdated: {
            mutation: 'CREATED',
            node: createNode(2),
            __typename: 'UpdateStudentPayload'
          }
        }
      })
    );

    expect(content.text()).to.include('Student title 2');
    expect(content.text()).to.include('4 / 4');
  });

  step('Clicking delete optimistically removes student', () => {
    mutations.deleteStudent = (obj, { id }) => {
      return createNode(id);
    };

    const deleteButtons = content.find('.delete-button');
    expect(deleteButtons).has.lengthOf(12);
    deleteButtons.last().simulate('click');

    expect(content.text()).to.not.include('Student title 4');
    expect(content.text()).to.include('3 / 3');
  });

  step('Clicking delete removes the student', () => {
    expect(content.text()).to.include('Student title 3');
    expect(content.text()).to.not.include('Student title 4');
    expect(content.text()).to.include('3 / 3');
  });

  step('Clicking on student works', () => {
    const studentLinks = content.find('.student-link');
    studentLinks.last().simulate('click', { button: 0 });
  });

  step('Clicking on student opens student form', () => {
    const studentForm = content.find('form[name="student"]');

    expect(content.text()).to.include('Edit Student');
    expect(
      studentForm
        .find('[name="title"]')
        .last()
        .instance().value
    ).to.equal('Student title 3');
    expect(
      studentForm
        .find('[name="content"]')
        .last()
        .instance().value
    ).to.equal('Student content 3');
  });

  step('Check subscribed to student updates', () => {
    expect(renderer.getSubscriptions(POST_SUBSCRIPTION)).has.lengthOf(1);
  });

  step('Updates student form on student updated from subscription', () => {
    const subscription = renderer.getSubscriptions(POST_SUBSCRIPTION)[0];
    subscription.next({
      data: {
        studentUpdated: {
          id: '3',
          title: 'Student title 203',
          content: 'Student content 204',
          __typename: 'Student'
        }
      }
    });
    const studentForm = content.find('form[name="student"]');
    expect(
      studentForm
        .find('[name="title"]')
        .last()
        .instance().value
    ).to.equal('Student title 203');
    expect(
      studentForm
        .find('[name="content"]')
        .last()
        .instance().value
    ).to.equal('Student content 204');
  });

  step('Student editing form works', done => {
    mutations.editStudent = (obj, { input }) => {
      expect(input.id).to.equal(3);
      expect(input.title).to.equal('Student title 33');
      expect(input.content).to.equal('Student content 33');
      done();
      return input;
    };

    const studentForm = app.find('form[name="student"]').last();
    studentForm
      .find('[name="title"]')
      .last()
      .simulate('change', { target: { name: 'title', value: 'Student title 33' } });
    studentForm
      .find('[name="content"]')
      .last()
      .simulate('change', { target: { name: 'content', value: 'Student content 33' } });
    studentForm.simulate('submit');
  });

  step('Check opening student by URL', () => {
    renderer.history.push('/student/3');
  });

  step('Opening student by URL works', () => {
    const studentForm = content.find('form[name="student"]');

    expect(content.text()).to.include('Edit Student');
    expect(
      studentForm
        .find('[name="title"]')
        .last()
        .instance().value
    ).to.equal('Student title 33');
    expect(
      studentForm
        .find('[name="content"]')
        .last()
        .instance().value
    ).to.equal('Student content 33');
    expect(content.text()).to.include('Edit Student');
  });

  step('Note adding works', done => {
    mutations.addNote = (obj, { input }) => {
      expect(input.studentId).to.equal(3);
      expect(input.content).to.equal('Student note 24');
      done();
      return input;
    };

    const noteForm = content.find('form[name="note"]');
    noteForm
      .find('[name="content"]')
      .last()
      .simulate('change', { target: { name: 'content', value: 'Student note 24' } });
    noteForm.last().simulate('submit');
  });

  step('Note adding works after submit', () => {
    expect(content.text()).to.include('Student note 24');
  });

  step('Updates note form on note added got from subscription', () => {
    const subscription = renderer.getSubscriptions(COMMENT_SUBSCRIPTION)[0];
    subscription.next({
      data: {
        noteUpdated: {
          mutation: 'CREATED',
          id: 3003,
          studentId: 3,
          node: {
            id: 3003,
            content: 'Student note 3',
            __typename: 'Note'
          },
          __typename: 'UpdateNotePayload'
        }
      }
    });

    expect(content.text()).to.include('Student note 3');
  });

  step('Updates note form on note deleted got from subscription', () => {
    const subscription = renderer.getSubscriptions(COMMENT_SUBSCRIPTION)[0];
    subscription.next({
      data: {
        noteUpdated: {
          mutation: 'DELETED',
          id: 3003,
          studentId: 3,
          node: {
            id: 3003,
            content: 'Student note 3',
            __typename: 'Note'
          },
          __typename: 'UpdateNotePayload'
        }
      }
    });
    expect(content.text()).to.not.include('Student note 3');
  });

  step('Note deleting optimistically removes note', () => {
    const deleteButtons = content.find('.delete-note');
    expect(deleteButtons).has.lengthOf(9);
    deleteButtons.last().simulate('click');

    app.update();
    content = app.find('#content').last();
    expect(content.text()).to.not.include('Student note 24');
    expect(content.find('.delete-note')).has.lengthOf(6);
  });

  step('Clicking note delete removes the note', () => {
    expect(content.text()).to.not.include('Student note 24');
    expect(content.find('.delete-note')).has.lengthOf(6);
  });

  step('Note editing works', async done => {
    mutations.editNote = (obj, { input }) => {
      expect(input.studentId).to.equal(3);
      expect(input.content).to.equal('Edited note 2');
      done();
      return input;
    };
    const editButtons = content.find('.edit-note');
    expect(editButtons).has.lengthOf(6);
    editButtons.last().simulate('click');
    editButtons.last().simulate('click');
    const noteForm = content.find('form[name="note"]');
    expect(
      noteForm
        .find('[name="content"]')
        .last()
        .instance().value
    ).to.equal('Student note 2');
    noteForm
      .find('[name="content"]')
      .last()
      .simulate('change', { target: { name: 'content', value: 'Edited note 2' } });
    noteForm.simulate('submit');
  });

  step('Note editing works', () => {
    expect(content.text()).to.include('Edited note 2');
  });

  step('Clicking back button takes to student list', () => {
    expect(content.text()).to.include('Edited note 2');
    const backButton = content.find('#back-button');
    backButton.last().simulate('click', { button: 0 });
    app.update();
    content = app.find('#content').last();
    expect(content.text()).to.include('Student title 3');
  });
});
