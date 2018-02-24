import { withFilter } from 'graphql-subscriptions';
import { createBatchResolver } from 'graphql-resolve-batch';

const STUDENT_SUBSCRIPTION = 'student_subscription';
const STUDENTS_SUBSCRIPTION = 'students_subscription';
const NOTE_SUBSCRIPTION = 'note_subscription';

export default pubsub => ({
  Query: {
    async students(obj, { limit, after }, context) {
      let edgesArray = [];
      let students = await context.Student.studentsPagination(limit, after);

      students.map(student => {
        edgesArray.push({
          cursor: student.id,
          node: {
            id: student.id,
            title: student.title,
            firstName: student.firstName,
            lastName: student.lastName,
            content: student.content
          }
        });
      });

      const endCursor = edgesArray.length > 0 ? edgesArray[edgesArray.length - 1].cursor : 0;

      const values = await Promise.all([context.Student.getTotal(), context.Student.getNextPageFlag(endCursor)]);

      return {
        totalCount: values[0].count,
        edges: edgesArray,
        pageInfo: {
          endCursor: endCursor,
          hasNextPage: values[1].count > 0
        }
      };
    },
    student(obj, { id }, context) {
      return context.Student.student(id);
    }
  },
  Student: {
    notes: createBatchResolver((sources, args, context) => {
      return context.Student.getNotesForStudentIds(sources.map(({ id }) => id));
    })
  },
  Mutation: {
    async addStudent(obj, { input }, context) {
      const [id] = await context.Student.addStudent(input);
      const student = await context.Student.student(id);
      // publish for student list
      pubsub.publish(STUDENTS_SUBSCRIPTION, {
        studentsUpdated: {
          mutation: 'CREATED',
          id,
          node: student
        }
      });
      return student;
    },
    async deleteStudent(obj, { id }, context) {
      const student = await context.Student.student(id);
      const isDeleted = await context.Student.deleteStudent(id);
      if (isDeleted) {
        // publish for student list
        pubsub.publish(STUDENTS_SUBSCRIPTION, {
          studentsUpdated: {
            mutation: 'DELETED',
            id,
            node: student
          }
        });
        return { id: student.id };
      } else {
        return { id: null };
      }
    },
    async editStudent(obj, { input }, context) {
      await context.Student.editStudent(input);
      const student = await context.Student.student(input.id);
      // publish for student list
      pubsub.publish(STUDENTS_SUBSCRIPTION, {
        studentsUpdated: {
          mutation: 'UPDATED',
          id: student.id,
          node: student
        }
      });
      // publish for edit student page
      pubsub.publish(STUDENT_SUBSCRIPTION, { studentUpdated: student });
      return student;
    },
    async addNote(obj, { input }, context) {
      const [id] = await context.Student.addNote(input);
      const note = await context.Student.getNote(id);
      // publish for edit student page
      pubsub.publish(NOTE_SUBSCRIPTION, {
        noteUpdated: {
          mutation: 'CREATED',
          id: note.id,
          studentId: input.studentId,
          node: note
        }
      });
      return note;
    },
    async deleteNote(obj, { input: { id, studentId } }, context) {
      await context.Student.deleteNote(id);
      // publish for edit student page
      pubsub.publish(NOTE_SUBSCRIPTION, {
        noteUpdated: {
          mutation: 'DELETED',
          id,
          studentId,
          node: null
        }
      });
      return { id };
    },
    async editNote(obj, { input }, context) {
      await context.Student.editNote(input);
      const note = await context.Student.getNote(input.id);
      // publish for edit student page
      pubsub.publish(NOTE_SUBSCRIPTION, {
        noteUpdated: {
          mutation: 'UPDATED',
          id: input.id,
          studentId: input.studentId,
          node: note
        }
      });
      return note;
    }
  },
  Subscription: {
    studentUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(STUDENT_SUBSCRIPTION),
        (payload, variables) => {
          return payload.studentUpdated.id === variables.id;
        }
      )
    },
    studentsUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(STUDENTS_SUBSCRIPTION),
        (payload, variables) => {
          return variables.endCursor <= payload.studentsUpdated.id;
        }
      )
    },
    noteUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NOTE_SUBSCRIPTION),
        (payload, variables) => {
          return payload.noteUpdated.studentId === variables.studentId;
        }
      )
    }
  }
});
