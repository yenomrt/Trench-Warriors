/**
 * This blob of a file is pulled together from different files from the metaplex
 * repository.
 * Metaplex does not have a NPM package at the current time to make this easier, so instead of
 * trying to reference their stuff, I copied all of the minimum necessary code into this file.
 */
const { BinaryReader, BinaryWriter, deserializeUnchecked } = require("borsh");
const { PublicKey } = require("@solana/web3.js");
const base58 = require("bs58");

const METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const METADATA_PREFIX = "metadata";

const PubKeysInternedMap = new Map();

// Borsh extension for pubkey stuff
BinaryReader.prototype.readPubkey = function () {
  const reader = this;
  const array = reader.readFixedArray(32);
  return new PublicKey(array);
};

BinaryWriter.prototype.writePubkey = function (value) {
  const writer = this;
  writer.writeFixedArray(value.toBuffer());
};

BinaryReader.prototype.readPubkeyAsString = function () {
  const reader = this;
  const array = reader.readFixedArray(32);
  return base58.encode(array);
};

BinaryWriter.prototype.writePubkeyAsString = function (value) {
  const writer = this;
  writer.writeFixedArray(base58.decode(value));
};

const toPublicKey = (key) => {
  if (typeof key !== "string") {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};

const findProgramAddress = async (seeds, programId) => {
  const key =
    "pda-" +
    seeds.reduce((agg, item) => agg + item.toString("hex"), "") +
    programId.toString();

  const result = await PublicKey.findProgramAddress(seeds, programId);

  return [result[0].toBase58(), result[1]];
};

const MetadataKey = {
  Uninitialized: 0,
  MetadataV1: 4,
  EditionV1: 1,
  MasterEditionV1: 2,
  MasterEditionV2: 6,
  EditionMarker: 7,
};

class Creator {
  constructor(args) {
    this.address = args.address;
    this.verified = args.verified;
    this.share = args.share;
  }
}

class Data {
  constructor(args) {
    this.name = args.name;
    this.symbol = args.symbol;
    this.uri = args.uri;
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
    this.creators = args.creators;
  }
}

class Metadata {
  constructor(args) {
    this.key = MetadataKey.MetadataV1;
    this.updateAuthority = args.updateAuthority;
    this.mint = args.mint;
    this.data = args.data;
    this.primarySaleHappened = args.primarySaleHappened;
    this.isMutable = args.isMutable;
    this.editionNonce = args.editionNonce;
  }
}

const METADATA_SCHEMA = new Map([
  [
    Data,
    {
      kind: "struct",
      fields: [
        ["name", "string"],
        ["symbol", "string"],
        ["uri", "string"],
        ["sellerFeeBasisPoints", "u16"],
        ["creators", { kind: "option", type: [Creator] }],
      ],
    },
  ],
  [
    Creator,
    {
      kind: "struct",
      fields: [
        ["address", "pubkeyAsString"],
        ["verified", "u8"],
        ["share", "u8"],
      ],
    },
  ],
  [
    Metadata,
    {
      kind: "struct",
      fields: [
        ["key", "u8"],
        ["updateAuthority", "pubkeyAsString"],
        ["mint", "pubkeyAsString"],
        ["data", Data],
        ["primarySaleHappened", "u8"], // bool
        ["isMutable", "u8"], // bool
      ],
    },
  ],
]);

async function getMetadataAccount(tokenMint) {
  return (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        toPublicKey(METADATA_PROGRAM_ID).toBuffer(),
        toPublicKey(tokenMint).toBuffer(),
      ],
      toPublicKey(METADATA_PROGRAM_ID)
    )
  )[0];
}

const METADATA_REPLACE = new RegExp("\u0000", "g");
const decodeMetadata = (buffer) => {
  const metadata = deserializeUnchecked(
    METADATA_SCHEMA,
    Metadata,
    buffer
  );

  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, "");
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, "");
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, "");
  return metadata;
};

module.exports = {
  METADATA_PROGRAM_ID,
  METADATA_PREFIX,
  findProgramAddress,
  toPublicKey,
  getMetadataAccount,
  decodeMetadata,
  Metadata,
  Data,
  Creator,
  MetadataKey,
  METADATA_SCHEMA
};
