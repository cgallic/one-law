import { DemoGame } from "../../components/game/DemoGame";
import {CACHED_DEMOS,getCachedDemo} from "../../lib/scenarios/demos";

export default async function DemoPage({searchParams}:{searchParams:Promise<{world?:string}>}) {
  const {world}=await searchParams;
  const demo=getCachedDemo(world);
  return <>
    <nav className="demo-switcher" aria-label="Certified cached worlds">
      <div><span>ZERO-CALL JUDGE MODE</span><b>Choose a constitutional stress test</b></div>
      {Object.values(CACHED_DEMOS).map(item=><a key={item.id} href={`/demo?world=${item.id}`} aria-current={item.id===demo.id?"page":undefined}><b>{item.title}</b><small>{item.tension}</small></a>)}
    </nav>
    <DemoGame key={demo.id} law={demo.law} compilation={demo.compilation} seed={demo.seed} certified />
  </>;
}
