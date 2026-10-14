import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recoveryToken,newPassword} from '../lib/recovery.ts';
test('rejects duplicate, malformed and oversized recovery tokens',()=>{assert.equal(recoveryToken(['a'.repeat(64)]),undefined);assert.equal(recoveryToken('bad'),undefined);assert.equal(recoveryToken('a'.repeat(257)),undefined);assert.equal(recoveryToken('a'.repeat(64)),'a'.repeat(64));});
test('password confirmation and length are validated without trimming passwords',()=>{assert.equal(newPassword('short','short'),undefined);assert.equal(newPassword('a'.repeat(129),'a'.repeat(129)),undefined);assert.equal(newPassword('a'.repeat(12),'b'.repeat(12)),undefined);assert.equal(newPassword(' a'.repeat(6),' a'.repeat(6)),' a'.repeat(6));});
