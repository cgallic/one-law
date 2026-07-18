import {describe,expect,it} from "vitest";
import {compileFallback} from "../ai/fallback";
import {adaptCrises} from "./adaptive";
describe("adaptive continuity scenarios",()=>{
 it("interprets and adapts a contact-without-marriage law",()=>{const law="No person may touch another human without marriage.";const compilation=compileFallback(law);expect(compilation.ambiguousTerms).toContain("marriage");const crises=adaptCrises(law,compilation);expect(crises[0].title).toBe("The Saving Hand");expect(crises[4].body).toContain("touch your hand");});
});
