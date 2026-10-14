import {test} from 'node:test';
import assert from 'node:assert/strict';
import {needsMfa,mfaPath} from '../lib/mfa-policy.ts';
test('verified MFA cannot proceed with a first-factor or missing assurance',()=>{assert.equal(needsMfa([{status:'verified'}],'aal1'),true);assert.equal(needsMfa([{status:'verified'}],undefined),true);assert.equal(needsMfa([{status:'verified'}],'aal2'),false);});
test('unverified enrollment does not lock the account',()=>{assert.equal(needsMfa([{status:'unverified'}],'aal1'),false);assert.equal(needsMfa(undefined,'aal1'),false);});
test('MFA continuation preserves only valid authorization IDs',()=>{assert.equal(mfaPath('//evil.example'),'/mfa');assert.equal(mfaPath('a'.repeat(20), 'failed'),'/mfa?authorization_id='+ 'a'.repeat(20)+'&notice=failed');});
