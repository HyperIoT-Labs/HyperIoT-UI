import { actionDescription } from './role-action-descriptions';

describe('actionDescription', () => {
  it('describes the actions of each resource', () => {
    expect(actionDescription('HProject', 'save')).toBe('Create a project.');
    expect(actionDescription('Area', 'save')).toBe('Create an area.');
    expect(actionDescription('HyperIoTWebSocketChannel', 'CREATE_CHANNEL')).toBe('Create a WebSocket channel.');
  });

  it('marks the actions the backend does not use', () => {
    expect(actionDescription('Rule', 'action_run')).toBe('Unused: granting it has no effect.');
    expect(actionDescription('Role', 'permission')).toBe('Unused: granting it has no effect.');
  });

  it('has no description for unknown resources or actions', () => {
    expect(actionDescription('HProject', 'unknown_action')).toBeUndefined();
    expect(actionDescription('Unknown', 'save')).toBeUndefined();
    expect(actionDescription('HProject', 'toString')).toBeUndefined();
  });
});
