const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('id="studentModal"');
const cIdx = html.indexOf('id="completionConfirmModal"');
const sClose = html.indexOf('<!-- /#studentModal -->');

console.log('studentModal at:', sIdx);
console.log('studentModal closing comment at:', sClose);
console.log('completionConfirmModal at:', cIdx);
console.log('Is completionConfirmModal AFTER studentModal closing?', cIdx > sClose);

