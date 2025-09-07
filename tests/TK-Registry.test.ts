import { describe, it, expect, beforeEach } from "vitest";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_HASH = 101;
const ERR_INVALID_TITLE = 102;
const ERR_INVALID_DESCRIPTION = 103;
const ERR_INVALID_KNOWLEDGE_TYPE = 104;
const ERR_INVALID_ORIGIN = 105;
const ERR_INVALID_ROYALTY_RATE = 106;
const ERR_INVALID_LICENSE_TERMS = 107;
const ERR_INVALID_GEOLOCATION = 108;
const ERR_INVALID_BOUNDARIES = 109;
const ERR_INVALID_TIMESTAMP = 110;
const ERR_Authority_NOT_VERIFIED = 111;
const ERR_GEOLOCATION_OUT_OF_BOUNDS = 112;
const ERR_INVALID_BOUNDARIES_RANGE = 113;
const ERR_TK_ALREADY_EXISTS = 114;
const ERR_TK_NOT_FOUND = 115;
const ERR_INVALID_UPDATE_HASH = 116;
const ERR_INVALID_UPDATE_TITLE = 117;
const ERR_INVALID_UPDATE_DESCRIPTION = 118;
const ERR_UPDATE_NOT_ALLOWED = 119;
const ERR_MAX_TK_EXCEEDED = 120;
const ERR_INVALID_COMMUNITY = 121;
const ERR_INVALID_CATEGORY = 122;
const ERR_INVALID_USAGE_RIGHTS = 123;
const ERR_INVALID_EXPIRATION = 124;
const ERR_INVALID_STATUS = 125;
const ERR_INVALID_VERSION = 126;
const ERR_INVALID_METADATA = 127;
const ERR_INVALID_ACCESS_LEVEL = 128;

interface Geolocation {
  lat: number;
  lon: number;
}

interface Boundaries {
  "min-lat": number;
  "max-lat": number;
  "min-lon": number;
  "max-lon": number;
}

interface TK {
  hash: string;
  title: string;
  description: string;
  community: string;
  "knowledge-type": string;
  origin: string;
  "royalty-rate": number;
  "license-terms": string;
  geolocation: Geolocation;
  boundaries: Boundaries;
  timestamp: number;
  creator: string;
  category: string;
  "usage-rights": string;
  expiration: number;
  status: boolean;
  version: number;
  metadata: string;
  "access-level": number;
}

interface TKUpdate {
  "update-hash": string;
  "update-title": string;
  "update-description": string;
  "update-timestamp": number;
  updater: string;
  "update-version": number;
}

class TKRegistryMock {
  state!: {
    nextTkId: number;
    maxTk: number;
    traditionalKnowledge: Map<number, TK>;
    tkUpdates: Map<number, TKUpdate>;
  };
  blockHeight = 0;
  caller = "ST1TEST";
  authorities = new Set<string>();

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextTkId: 0,
      maxTk: 10000,
      traditionalKnowledge: new Map(),
      tkUpdates: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.authorities = new Set(["ST1TEST"]);
  }

  isVerifiedAuthority(principal: string) {
    return this.authorities.has(principal);
  }

  registerTk(
    tkHash: string,
    title: string,
    description: string,
    community: string,
    knowledgeType: string,
    origin: string,
    royaltyRate: number,
    licenseTerms: string,
    geolocation: Geolocation,
    boundaries: Boundaries,
    category: string,
    usageRights: string,
    expiration: number,
    status: boolean,
    version: number,
    metadata: string,
    accessLevel: number
  ) {
    const nextId = this.state.nextTkId;
    if (nextId >= this.state.maxTk) return { ok: false, value: ERR_MAX_TK_EXCEEDED };
    if (tkHash.length !== 64 || !/^[0-9a-fA-F]+$/.test(tkHash)) return { ok: false, value: ERR_INVALID_HASH };
    if (title.length === 0 || title.length > 100) return { ok: false, value: ERR_INVALID_TITLE };
    if (description.length === 0 || description.length > 500) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (!["medicinal", "cultural", "agricultural", "spiritual"].includes(knowledgeType)) return { ok: false, value: ERR_INVALID_KNOWLEDGE_TYPE };
    if (origin.length === 0) return { ok: false, value: ERR_INVALID_ORIGIN };
    if (royaltyRate < 0 || royaltyRate > 10000) return { ok: false, value: ERR_INVALID_ROYALTY_RATE };
    if (licenseTerms.length === 0) return { ok: false, value: ERR_INVALID_LICENSE_TERMS };
    if (geolocation.lat < -90000000 || geolocation.lat > 90000000 || geolocation.lon < -180000000 || geolocation.lon > 180000000)
      return { ok: false, value: ERR_GEOLOCATION_OUT_OF_BOUNDS };
    if (boundaries["min-lat"] > boundaries["max-lat"] || boundaries["min-lon"] > boundaries["max-lon"])
      return { ok: false, value: ERR_INVALID_BOUNDARIES_RANGE };
    if (category.length === 0) return { ok: false, value: ERR_INVALID_CATEGORY };
    if (usageRights.length === 0) return { ok: false, value: ERR_INVALID_USAGE_RIGHTS };
    if (expiration <= this.blockHeight) return { ok: false, value: ERR_INVALID_EXPIRATION };
    if (version <= 0) return { ok: false, value: ERR_INVALID_VERSION };
    if (accessLevel < 0 || accessLevel > 5) return { ok: false, value: ERR_INVALID_ACCESS_LEVEL };
    if (community === "SP000000000000000000002Q6VF78") return { ok: false, value: ERR_INVALID_COMMUNITY };

    if (!this.isVerifiedAuthority(this.caller)) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (Array.from(this.state.traditionalKnowledge.values()).some(r => r.hash === tkHash))
      return { ok: false, value: ERR_TK_ALREADY_EXISTS };

    const newTk: TK = {
      hash: tkHash,
      title,
      description,
      community,
      "knowledge-type": knowledgeType,
      origin,
      "royalty-rate": royaltyRate,
      "license-terms": licenseTerms,
      geolocation,
      boundaries,
      timestamp: this.blockHeight,
      creator: this.caller,
      category,
      "usage-rights": usageRights,
      expiration,
      status,
      version,
      metadata,
      "access-level": accessLevel,
    };
    this.state.traditionalKnowledge.set(nextId, newTk);
    this.state.nextTkId++;
    return { ok: true, value: nextId };
  }

  getTk(id: number) {
    const tk = this.state.traditionalKnowledge.get(id);
    return tk ? { ok: true, value: tk } : { ok: false, value: null };
  }

  updateTk(id: number, updateHash: string, updateTitle: string, updateDescription: string, updateVersion: number) {
    const tk = this.state.traditionalKnowledge.get(id);
    if (!tk) return { ok: false, value: ERR_TK_NOT_FOUND };
    if (tk.creator !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (updateHash.length !== 64 || !/^[0-9a-fA-F]+$/.test(updateHash)) return { ok: false, value: ERR_INVALID_UPDATE_HASH };
    if (updateTitle.length === 0 || updateTitle.length > 100) return { ok: false, value: ERR_INVALID_UPDATE_TITLE };
    if (updateDescription.length === 0 || updateDescription.length > 500) return { ok: false, value: ERR_INVALID_UPDATE_DESCRIPTION };
    if (updateVersion <= 0) return { ok: false, value: ERR_INVALID_VERSION };

    if (!this.isVerifiedAuthority(this.caller)) return { ok: false, value: ERR_NOT_AUTHORIZED };

    const updated: TK = { ...tk, hash: updateHash, title: updateTitle, description: updateDescription, timestamp: this.blockHeight, version: updateVersion };
    this.state.traditionalKnowledge.set(id, updated);
    this.state.tkUpdates.set(id, {
      "update-hash": updateHash,
      "update-title": updateTitle,
      "update-description": updateDescription,
      "update-timestamp": this.blockHeight,
      updater: this.caller,
      "update-version": updateVersion,
    });
    return { ok: true, value: true };
  }
}

describe("TKRegistry", () => {
  let contract: TKRegistryMock;
  beforeEach(() => (contract = new TKRegistryMock()));

  it("registers a valid TK", () => {
    const result = contract.registerTk(
      "a".repeat(64),
      "Herbal Remedy",
      "Traditional healing method",
      "ST2COMMUNITY",
      "medicinal",
      "Amazon Basin",
      500,
      "Commercial use requires royalty",
      { lat: 40000000, lon: -74000000 },
      { "min-lat": 39000000, "max-lat": 41000000, "min-lon": -75000000, "max-lon": -73000000 },
      "Health",
      "Restricted to non-commercial",
      100000,
      true,
      1,
      "Additional info",
      2
    );
    expect(result.ok).toBe(true);
    expect(contract.getTk(0).value?.title).toBe("Herbal Remedy");
  });

  it("rejects invalid hash", () => {
    const result = contract.registerTk(
      "bad",
      "Title",
      "Desc",
      "ST2COMMUNITY",
      "medicinal",
      "Origin",
      500,
      "Terms",
      { lat: 0, lon: 0 },
      { "min-lat": -1, "max-lat": 1, "min-lon": -1, "max-lon": 1 },
      "Cat",
      "Rights",
      100000,
      true,
      1,
      "Meta",
      2
    );
    expect(result).toEqual({ ok: false, value: ERR_INVALID_HASH });
  });

  it("rejects invalid geolocation", () => {
    const result = contract.registerTk(
      "a".repeat(64),
      "Title",
      "Desc",
      "ST2COMMUNITY",
      "medicinal",
      "Origin",
      500,
      "Terms",
      { lat: 100000000, lon: 0 },
      { "min-lat": -1, "max-lat": 1, "min-lon": -1, "max-lon": 1 },
      "Cat",
      "Rights",
      100000,
      true,
      1,
      "Meta",
      2
    );
    expect(result).toEqual({ ok: false, value: ERR_GEOLOCATION_OUT_OF_BOUNDS });
  });

  it("rejects duplicate TK", () => {
    contract.registerTk(
      "a".repeat(64),
      "Title",
      "Desc",
      "ST2COMMUNITY",
      "medicinal",
      "Origin",
      500,
      "Terms",
      { lat: 0, lon: 0 },
      { "min-lat": -1, "max-lat": 1, "min-lon": -1, "max-lon": 1 },
      "Cat",
      "Rights",
      100000,
      true,
      1,
      "Meta",
      2
    );
    const result = contract.registerTk(
      "a".repeat(64),
      "Title2",
      "Desc2",
      "ST2COMMUNITY",
      "medicinal",
      "Origin",
      500,
      "Terms",
      { lat: 0, lon: 0 },
      { "min-lat": -1, "max-lat": 1, "min-lon": -1, "max-lon": 1 },
      "Cat",
      "Rights",
      100000,
      true,
      1,
      "Meta",
      2
    );
    expect(result).toEqual({ ok: false, value: ERR_TK_ALREADY_EXISTS });
  });

  it("updates a valid TK", () => {
    contract.registerTk(
      "a".repeat(64),
      "Old Title",
      "Old Desc",
      "ST2COMMUNITY",
      "medicinal",
      "Origin",
      500,
      "Terms",
      { lat: 0, lon: 0 },
      { "min-lat": -1, "max-lat": 1, "min-lon": -1, "max-lon": 1 },
      "Cat",
      "Rights",
      100000,
      true,
      1,
      "Meta",
      2
    );
    const res = contract.updateTk(0, "b".repeat(64), "New Title", "New Desc", 2);
    expect(res.ok).toBe(true);
    expect(contract.getTk(0).value?.title).toBe("New Title");
  });

  it("rejects update for non-existent TK", () => {
    const res = contract.updateTk(99, "b".repeat(64), "New", "New Desc", 2);
    expect(res).toEqual({ ok: false, value: ERR_TK_NOT_FOUND });
  });
});