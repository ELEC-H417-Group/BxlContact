const crypto = require('crypto');

// xiaoming's keys:
var alice = crypto.createDiffieHellman(512);
var alice_keys = ming.generateKeys();

var prime = ming.getPrime();
var generator = ming.getGenerator();

console.log('Prime: ' + prime.toString('hex'));
console.log('Generator: ' + generator.toString('hex'));

// xiaohong's keys:
var bob = crypto.createDiffieHellman(prime, generator);
var bob_keys = bob.generateKeys();


// exchange and generate secret:
var alice_secret = alice.computeSecret(bob.getPublicKey());
var bob_secret = bob.computeSecret(alice.getPublicKey);

// print secret:
console.log('Secret of Xiao Ming: ' + alise_secret.toString('hex'));
console.log('Secret of Xiao Hong: ' + bob_secret.toString('hex'));