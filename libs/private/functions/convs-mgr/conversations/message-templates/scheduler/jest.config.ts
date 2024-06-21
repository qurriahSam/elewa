/* eslint-disable */
export default {
  displayName:
    'private-functions-convs-mgr-conversations-message-templates-scheduler',
  preset: '../../../../../../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory:
    '../../../../../../../coverage/libs/private/functions/convs-mgr/conversations/message-templates/scheduler',
};
