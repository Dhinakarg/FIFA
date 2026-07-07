const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (!global.fetch) {
  global.fetch = jest.fn();
}
if (!global.Response) {
  global.Response = class {};
}
if (!global.Request) {
  global.Request = class {};
}
if (!global.Headers) {
  global.Headers = class {};
}

require('@testing-library/jest-dom');
