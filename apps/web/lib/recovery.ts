export function recoveryToken(value:unknown){return typeof value==='string' && /^[a-f0-9]{32,256}$/i.test(value)?value:undefined;}
export function newPassword(password:unknown,confirmation:unknown){return typeof password==='string' && password.length>=12 && password.length<=128 && password===confirmation?password:undefined;}
