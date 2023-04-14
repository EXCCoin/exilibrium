import { expect } from "@jest/globals";
import { encodeMnemonic } from "helpers/seed";

const TEST_DATA = [
  {
    hex: "",
    seed: ["blanket"]
  },
  {
    hex: "00",
    seed: ["abandon", "ahead"]
  },
  {
    hex: "ff",
    seed: ["divert", "coral"]
  },
  {
    hex: "0000",
    seed: ["abandon", "ability", "avoid"]
  },
  {
    hex: "ffff",
    seed: ["divert", "divide", "disagree"]
  },
  {
    hex: "e58294f2e9a227486e8b061b31cc528fd7fa3f19",
    seed: [
      "deer",
      "camera",
      "celery",
      "device",
      "demise",
      "chunk",
      "antenna",
      "banana",
      "breeze",
      "carry",
      "account",
      "alone",
      "arrange",
      "creek",
      "behind",
      "catalog",
      "cupboard",
      "dirt",
      "average",
      "all",
      "bone",
    ]
  },
  {
    hex: "d1d464c004f00fb5c9a4c8d8e433e7fb7ff56256",
    seed: [
      "crowd",
      "cry",
      "boil",
      "coral",
      "absurd",
      "destroy",
      "adult",
      "coin",
      "crane",
      "circle",
      "craft",
      "curtain",
      "decorate",
      "artefact",
      "degree",
      "discover",
      "cabin",
      "dice",
      "blush",
      "between",
      "cactus"
    ]
  },
  {
    hex: "e34cd132128c1929ec96865ced5c4d0bf40a5d021fcef58d27dbfee371d210",
    seed: [
      "decide",
      "basket",
      "crowd",
      "arrow",
      "afraid",
      "case",
      "alien",
      "apology",
      "deposit",
      "certain",
      "canoe",
      "blame",
      "deputy",
      "blame",
      "battle",
      "actual",
      "dial",
      "actor",
      "blanket",
      "absent",
      "amazing",
      "crisp",
      "diary",
      "casino",
      "antenna",
      "dad",
      "display",
      "decline",
      "brisk",
      "cruise",
      "advice",
      "coral"
    ]
  },
  {
    hex: "00000000000000000000000000000000000000000000000000000000000000",
    seed: [
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "ability",
      "abandon",
      "cabbage"
    ]
  }
];

TEST_DATA.forEach((tc) =>
  test("hex seed " + tc.hex, async () =>
    expect(await encodeMnemonic(tc.hex)).toStrictEqual(tc.seed)
  )
);
