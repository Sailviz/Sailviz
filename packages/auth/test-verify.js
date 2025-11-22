const { scrypt, randomFillSync, timingSafeEqual } = require("crypto");

function scryptAsync(password, salt, opts) {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      opts.dkLen,
      { N: opts.N, r: opts.r, p: opts.p, maxmem: opts.maxmem },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey);
      }
    );
  });
}

const hex = {
  encode: (buf) => Buffer.from(buf).toString("hex"),
  decode: (hexstr) => Buffer.from(hexstr, "hex"),
};

const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
};

async function generateKey(password, salt) {
  return await scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    r: config.r,
    p: config.p,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2,
  });
}

async function hashPassword(password) {
  const saltBuf = new Uint8Array(16);
  randomFillSync(saltBuf);
  const saltHex = hex.encode(saltBuf);
  const key = await generateKey(password, saltHex);
  return `${saltHex}:${hex.encode(key)}`;
}

async function verifyPassword(hash, password) {
  const [salt, keyHex] = hash.split(":");
  if (!salt || !keyHex) throw new Error("Invalid hash");
  const targetKey = await generateKey(password, salt);
  const expected = hex.decode(keyHex);
  if (targetKey.length !== expected.length) return false;
  return timingSafeEqual(targetKey, expected);
}

async function run() {
  const argv = process.argv.slice(2);

  const hash = argv[0];
  const password = argv[1];
  if (!password) {
    console.error(
      "Usage: node test-verify.js <hash> <password>\nOr set PASSWORD env var."
    );
    process.exit(2);
  }

  try {
    const ok = await verifyPassword(hash, password);
    console.log(
      ok ? "Password matches (PASS)" : "Password does NOT match (FAIL)"
    );
  } catch (err) {
    console.error("Error verifying password:", err.message || err);
    process.exit(1);
  }
}

run();
