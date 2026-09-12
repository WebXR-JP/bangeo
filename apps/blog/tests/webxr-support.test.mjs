// Run with Node.js 22.18+ (native TypeScript stripping):
// node --test apps/blog/tests/webxr-support.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkWebXRSupport } from '../src/lib/webxr-support.ts';

async function withBrowser(xr, windowValue, run) {
 const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
 const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
 Object.defineProperty(globalThis, 'navigator', { value: { xr }, configurable: true });
 Object.defineProperty(globalThis, 'window', { value: windowValue, configurable: true });
 try { await run(); } finally {
  if (oldNavigator) Object.defineProperty(globalThis, 'navigator', oldNavigator);
  else delete globalThis.navigator;
  if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow);
  else delete globalThis.window;
 }
}
async function collect(timeout = 100) {
 const results = {};
 await checkWebXRSupport((id, state) => { results[id] = state; }, timeout);
 return results;
}
test('missing WebXR does not report reference spaces or sessions as supported', async () => {
 await withBrowser(undefined, {}, async () => {
  const results = await collect();
  for (const id of ['inline', 'immersive-vr', 'immersive-ar', 'local-floor', 'bounded-floor', 'unbounded']) {
   assert.equal(results[id], 'unsupported');
  }
 });
});
test('immersive support does not prove optional reference space support', async () => {
 await withBrowser({ isSessionSupported: async () => true }, {}, async () => {
  const results = await collect();
  assert.equal(results['immersive-vr'], 'supported');
  for (const id of ['local-floor', 'bounded-floor', 'unbounded']) assert.equal(results[id], 'unknown');
 });
});
test('a rejected probe is inconclusive while an explicit false is unsupported', async () => {
 await withBrowser({ isSessionSupported: async (mode) => {
  if (mode === 'immersive-vr') throw new Error('permission denied');
  return false;
 } }, {}, async () => {
  const results = await collect();
  assert.equal(results['immersive-vr'], 'unknown');
  assert.equal(results['immersive-ar'], 'unsupported');
 });
});
test('a hung probe does not block other results and late completion cannot overwrite its timeout', async () => {
 let finish;
 await withBrowser({ isSessionSupported: (mode) => mode === 'inline'
  ? new Promise(resolve => { finish = resolve; }) : Promise.resolve(true)
 }, { XRHand: class {} }, async () => {
  const results = {};
  const done = checkWebXRSupport((id, state) => { results[id] = state; }, 20);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(results['hand-input'], 'supported');
  assert.equal(results['immersive-vr'], 'supported');
  assert.equal(results.inline, undefined);
  await done;
  assert.equal(results.inline, 'unknown');
  finish(true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(results.inline, 'unknown');
 });
});
test('XRInputSource alone does not prove the gamepad extension exists', async () => {
 class InputSource {}
 await withBrowser(undefined, { XRInputSource: InputSource }, async () => {
  assert.equal((await collect()).gamepads, 'unsupported');
  Object.defineProperty(InputSource.prototype, 'gamepad', { get: () => null });
  assert.equal((await collect()).gamepads, 'supported');
 });
});
