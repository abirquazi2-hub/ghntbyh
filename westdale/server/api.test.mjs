import test from 'node:test';
import assert from 'node:assert/strict';
import { validate, rateLimiter, csrf } from './lib.mjs';

const good = { name: 'A B', email: 'a@b.ca', topic: 'Insurance', contactMethod: 'Email', consent: true, message: 'hi' };

test('validate accepts good input and normalizes', () => {
  const r = validate({ ...good, email: ' A@B.CA ' });
  assert.ok(r.ok); assert.equal(r.value.email, 'a@b.ca');
});
test('validate rejects bad email, topic, missing consent', () => {
  const r = validate({ ...good, email: 'nope', topic: 'Hack', consent: false });
  assert.deepEqual(Object.keys(r.errors).sort(), ['consent', 'email', 'topic']);
});
test('validate strips newlines from single-line fields and caps length', () => {
  const r = validate({ ...good, name: 'A\r\nBcc: x@y.z' + 'x'.repeat(500) });
  assert.ok(!/[\r\n]/.test(r.value.name)); assert.ok(r.value.name.length <= 100);
});
test('rate limiter blocks after limit and recovers', () => {
  let t = 0; const l = rateLimiter(2, 1000, () => t);
  assert.ok(l('ip')); assert.ok(l('ip')); assert.ok(!l('ip')); t = 1500; assert.ok(l('ip'));
});
test('csrf token lifecycle', () => {
  let t = 1000; const c = csrf('s3cret', () => t); const { nonce, token } = c.issue();
  assert.equal(c.check(token, nonce), 'too-fast'); t += 5000;
  assert.equal(c.check(token, nonce), 'ok');
  assert.equal(c.check(token, 'other'), 'invalid');
  assert.equal(c.check(token.slice(0, -2) + 'xx', nonce), 'invalid');
  t += 3 * 3600e3; assert.equal(c.check(token, nonce), 'expired');
});
