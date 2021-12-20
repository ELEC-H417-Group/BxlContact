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

String.prototype.hashCode = function() {
    if (Array.prototype.reduce) {
        return this.split("").reduce(function(a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
    }
    var hash = 0;
    if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

var user1 = 'wang'

var user2 = 'nico'

var code1 = user1.hashCode() + user2.hashCode()
var code2 = user2.hashCode() + user1.hashCode()
var msg = 'good morning!'
var encrypted = aesEncrypt(msg, code1 + '')
var decrypted = aesDecrypt(en, code2 + '')

console.log(dem)