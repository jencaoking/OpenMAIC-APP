export const schema = {
  version: 2,
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
    // Phase 6.2: 多模态消息附件表，与 messages 通过 message_id 关联。
    // 一条消息可携带多个附件（如多张图片）。
    message_attachments: {
      columns: {
        message_id: 'string',
        kind: 'string',
        // 本地 file:// URI，用于离线展示
        local_uri: 'string',
        // 后端 Asset 引用（asset:// 协议），同步后填充
        asset_ref: 'string?',
        mime_type: 'string',
        width: 'number',
        height: 'number',
        byte_size: 'number',
        source: 'string',
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
