import {describe,expect,it} from "vitest";
import {tribunalSynthesisSchema} from "./schemas";

const valid={
  operativeConstitution:[1,8,23].map(era=>({
    clause:`The recorded decision in Year ${era} became a durable constitutional rule.`,
    evidenceEras:[era],
    reasoning:"The clause is grounded in a supplied ruling rather than an invented event.",
  })),
  civicFinding:"Five rulings transformed the founding sentence into an operative civic constitution.",
  unresolvedContradiction:"The original promise and the exceptions created by precedent cannot both remain absolute.",
};

describe("tribunal synthesis schema",()=>{
  it("accepts evidence-bound constitutional findings",()=>{
    expect(tribunalSynthesisSchema.parse(valid).operativeConstitution).toHaveLength(3);
  });

  it("rejects clauses without a recorded-era citation",()=>{
    expect(()=>tribunalSynthesisSchema.parse({...valid,operativeConstitution:[{...valid.operativeConstitution[0],evidenceEras:[]}]})).toThrow();
  });
});
