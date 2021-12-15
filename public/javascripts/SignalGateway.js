

/*var libsignal = require('libsignal-protocol.js')


async function initializeAsync(){
    await _generateIdentityAsync()

    var preKeyBundle = await this._generatePreKeyBundleAsync()

    signalServerStore.registerNewPreKeyBundle(1, preKeyBundle)

}

async function _generateIdentityAsync() {
    var results  = await Promise.all([
        window.libsignal.KeyHelper.generateIdentityKeyPair(),
        window.libsignal.KeyHelper.generateRegistrationId(),
    ])
}*/
//  <script src="libsignal-protocol.js"></script>
var KeyHelper = libsignal.KeyHelper;

function generateIdentity(store) {
    return Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ]).then(function(result) {
        store.put('identityKey', result[0]);
        store.put('registrationId', result[1]);
    });
}

function generatePreKeyBundle(store, preKeyId, signedPreKeyId) {
    return Promise.all([
        store.getIdentityKeyPair(),
        store.getLocalRegistrationId()
    ]).then(function(result) {
        var identity = result[0];
        var registrationId = result[1];

        return Promise.all([
            KeyHelper.generatePreKey(preKeyId),
            KeyHelper.generateSignedPreKey(identity, signedPreKeyId),
        ]).then(function(keys) {
            var preKey = keys[0]
            var signedPreKey = keys[1];

            store.storePreKey(preKeyId, preKey.keyPair);
            store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);

            return {
                identityKey: identity.pubKey,
                registrationId : registrationId,
                preKey:  {
                    keyId     : preKeyId,
                    publicKey : preKey.keyPair.pubKey
                },
                signedPreKey: {
                    keyId     : signedPreKeyId,
                    publicKey : signedPreKey.keyPair.pubKey,
                    signature : signedPreKey.signature
                }
            };
        });
    });
}

var ALICE_ADDRESS = new libsignal.SignalProtocolAddress("xxxxxxxxx", 1);
var BOB_ADDRESS   = new libsignal.SignalProtocolAddress("yyyyyyyyyyyyy", 1);

    var aliceStore = new libsignal.SignalProtocolStore();

    var bobStore = new libsignal.SignalProtocolStore();
    var bobPreKeyId = 1337;
    var bobSignedKeyId = 1;

    var Curve = libsignal.Curve;

        Promise.all([
            generateIdentity(aliceStore),
            generateIdentity(bobStore),
        ]).then(function() {
            return generatePreKeyBundle(bobStore, bobPreKeyId, bobSignedKeyId);
        }).then(function(preKeyBundle) {
            var builder = new libsignal.SessionBuilder(aliceStore, BOB_ADDRESS);
            return builder.processPreKey(preKeyBundle).then(function() {

              var originalMessage = util.toArrayBuffer("my message ......");
              var aliceSessionCipher = new libsignal.SessionCipher(aliceStore, BOB_ADDRESS);
              var bobSessionCipher = new libsignal.SessionCipher(bobStore, ALICE_ADDRESS);

              aliceSessionCipher.encrypt(originalMessage).then(function(ciphertext) {

                  // check for ciphertext.type to be 3 which includes the PREKEY_BUNDLE
                  return bobSessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');

              }).then(function(plaintext) {

                  alert(plaintext);

              });

              bobSessionCipher.encrypt(originalMessage).then(function(ciphertext) {

                  return aliceSessionCipher.decryptWhisperMessage(ciphertext.body, 'binary');

              }).then(function(plaintext) {

                  assertEqualArrayBuffers(plaintext, originalMessage);

              });

            });
        });