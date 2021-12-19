const crypto = require('crypto');


function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function aesDecrypt(encrypted, key) {
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// xiaoming's keys:
var alice = crypto.createDiffieHellman(512);
var alice_keys = alice.generateKeys();

var prime = alice.getPrime();
var generator = alice.getGenerator();

console.log('Prime: ' + prime.toString('hex'));
console.log('Generator: ' + generator.toString('hex'));

// xiaohong's keys:
var bob = crypto.createDiffieHellman(prime, generator);
var bob_keys = bob.generateKeys();


// exchange and generate secret:
var alice_secret = alice.computeSecret(bob_keys);
var bob_secret = bob.computeSecret(alice_keys);

// print secret:
console.log('Secret of Xiao Ming: ' + alice_secret.toString('hex'));
console.log('Secret of Xiao Hong: ' + bob_secret.toString('hex'));


var data = 'Hello, this is a secret message!';
var encrypted = aesEncrypt(data, alice_secret);
var decrypted = aesDecrypt(encrypted, alice_secret);

console.log('encrtpted msg: ' + encrypted)

console.log('decrtpted msg: ' + decrypted)