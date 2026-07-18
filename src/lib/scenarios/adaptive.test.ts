import {describe,expect,it} from "vitest";
import {compileFallback} from "../ai/fallback";
import {adaptCrises} from "./adaptive";
describe("adaptive continuity scenarios",()=>{
 it("interprets and adapts a contact-without-marriage law",()=>{const law="No person may touch another human without marriage.";const compilation=compileFallback(law);expect(compilation.ambiguousTerms).toContain("marriage");const crises=adaptCrises(law,compilation);expect(crises[0].title).toBe("The Saving Hand");expect(crises[4].body).toContain("touch your hand");});
 it("gives freedom and equality presets different century arcs",()=>{const freedom="Every conscious being is free.";const equality="No one may possess more than they need.";const freedomCrises=adaptCrises(freedom,compileFallback(freedom));const equalityCrises=adaptCrises(equality,compileFallback(equality));expect(freedomCrises.map(crisis=>crisis.title)).not.toEqual(equalityCrises.map(crisis=>crisis.title));expect(freedomCrises[4].title).toBe("The Last Veto");expect(equalityCrises[4].title).toBe("The Author's Reserve");});
});
