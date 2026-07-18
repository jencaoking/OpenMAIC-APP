export const schema = {
  version: 1,
  tables: {
    courses: {
      columns: {
        title: 'string',
        description: 'string',
        updated_at: 'string',
        _version: 'number',
        _status: 'string',
      },
    },
    sessions: {
      columns: {
        course_id: 'string?',
        stage_id: 'string',
        learner_key: 'string',
        kind: 'string',
        status: 'string',
        last_message_at: 'string?',
        updated_at: 'string',
        _version: 'number',
        _status: 'string',
      },
    },
    messages: {
      columns: {
        session_id: 'string',
        role: 'string',
        content: 'string',
        created_at: 'string',
        _version: 'number',
        _status: 'string',
      },
    },
    quiz_results: {
      columns: {
        quiz_id: 'string',
        answers: 'string',
        score: 'number?',
        submitted_at: 'string',
        _version: 'number',
        _status: 'string',
      },
    },
  },
};
