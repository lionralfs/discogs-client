import { test } from 'wru';
var tests = [];
var files = ['error', 'queue', 'util', 'client', 'database'];

for (var i in files) {
    tests = tests.concat(require('./' + files[i] + '.js'));
}

test(tests);
