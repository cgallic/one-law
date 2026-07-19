import {describe,expect,it} from "vitest";
import {CACHED_DEMOS,getCachedDemo} from "./demos";
import {adaptCrises} from "./adaptive";

describe("certified cached demos",()=>{
  it("ships four distinct laws and deterministic seeds",()=>{
    const demos=Object.values(CACHED_DEMOS);
    expect(new Set(demos.map(demo=>demo.law)).size).toBe(4);
    expect(new Set(demos.map(demo=>demo.seed)).size).toBe(4);
  });

  it("makes the literal marriage law produce contact-specific crises",()=>{
    const demo=getCachedDemo("contact");
    const crises=adaptCrises(demo.law,demo.compilation);
    expect(crises.map(crisis=>crisis.title)).toContain("The Saving Hand");
    expect(crises.at(-1)?.title).toBe("The Author's Hand");
  });

  it("falls back to the contact demo for unknown links",()=>{
    expect(getCachedDemo("unknown").id).toBe("contact");
  });
});
