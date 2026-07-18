import { describe,expect,it } from "vitest";
import { signState,verifyState } from "./token";
describe("signed civic record",()=>{
 it("round trips state",()=>{const value={year:23,choices:["a"]};expect(verifyState(signState(value))).toEqual(value);});
 it("rejects tampering",()=>{const token=signState({year:1});expect(verifyState(`${token.slice(0,-2)}xx`)).toBeNull();});
});
