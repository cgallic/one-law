"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, RoundedBox, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import { Color, MathUtils, Vector3 } from "three";
import type { WorldState } from "../../lib/simulation/types";

type Props = { state: WorldState; law: string };
type Building = { x: number; z: number; w: number; d: number; h: number; district: "open" | "civic" | "controlled" };
type WorldTheme="contact"|"freedom"|"need"|"harm";

const worldTheme=(law:string):WorldTheme=>/touch|contact|marriage|married/.test(law.toLowerCase())?"contact":/free|liberty|autonomy/.test(law.toLowerCase())?"freedom":/possess|need|share|equal/.test(law.toLowerCase())?"need":"harm";

const seeded = (index: number, salt = 1) => {
  const value = Math.sin(index * 91.733 + salt * 47.11) * 43758.5453;
  return value - Math.floor(value);
};

function CameraRig({ authority }: { authority: number }) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(), []);
  useFrame((_, delta) => {
    const distance = 22 + Math.max(0, 70 - authority) * 0.14;
    target.set(distance * 0.72, 20 + distance * 0.16, distance);
    camera.position.lerp(target, 1 - Math.exp(-delta * 1.8));
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Ground({theme}:{theme:WorldTheme}) {
  const ground=theme==="contact"?"#302c31":theme==="freedom"?"#26353b":theme==="need"?"#34352c":"#313432";
  const water=theme==="contact"?"#301928":theme==="freedom"?"#123945":theme==="need"?"#283519":"#09242b";
  return (
    <group>
      <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.12}><boxGeometry args={[42, 31, 0.25]} /><meshStandardMaterial color={ground} roughness={0.9} /></mesh>
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.25, 0]}><planeGeometry args={[70, 58]} /><meshStandardMaterial color="#06090a" roughness={0.38} metalness={0.12} /></mesh>
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.08, 0]}><ringGeometry args={[13.5, 15.5, 64]} /><meshStandardMaterial color="#a7a9a3" roughness={0.8} /></mesh>
      {[-10, -5, 0, 5, 10].map((z) => <mesh key={`r${z}`} receiveShadow position={[0, 0.01, z]}><boxGeometry args={[40, 0.04, 0.65]} /><meshStandardMaterial color="#16191a" /></mesh>)}
      {[-13, -7, 7, 13].map((x) => <mesh key={`c${x}`} receiveShadow position={[x, 0.012, 0]}><boxGeometry args={[0.65, 0.04, 29]} /><meshStandardMaterial color="#16191a" /></mesh>)}
      <mesh position={[0, 0.01, -12.7]}><boxGeometry args={[40, 0.08, 1.5]} /><meshStandardMaterial color={water} roughness={0.25} metalness={0.35} /></mesh>
      <mesh position={[0, 0.035, -12.7]} rotation-x={-Math.PI / 2}><planeGeometry args={[39, 1.25]} /><meshStandardMaterial color={water} emissive={water} emissiveIntensity={0.35} /></mesh>
    </group>
  );
}

function TerritoryTiles({ state }: Props) {
  const tiles = useMemo(() => {
    const values: { x: number; z: number; side: "commons" | "forum" | "control" }[] = [];
    for (let row = -4; row <= 4; row += 1) {
      for (let col = -8; col <= 8; col += 1) {
        const x = col * 2.05 + (Math.abs(row) % 2) * 1.02;
        const z = row * 1.8;
        if (Math.hypot(x, z) < 5.1 || Math.abs(x) > 18.4) continue;
        values.push({ x, z, side: x < -4.2 ? "commons" : x > 4.2 ? "control" : "forum" });
      }
    }
    return values;
  }, []);
  return <group>{tiles.map((tile, index) => {
    const color = tile.side === "commons" ? "#314a35" : tile.side === "control" ? "#3d3030" : "#5a5548";
    const emissive = tile.side === "commons" ? "#183d25" : tile.side === "control" && state.liberty < 48 ? "#5d1716" : "#211d18";
    return <mesh key={index} receiveShadow position={[tile.x, 0.025 + seeded(index, 41) * 0.012, tile.z]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[1.08, 6]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.22} roughness={0.95} />
    </mesh>;
  })}</group>;
}

function Forum({ trust }: { trust: number }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, 0.08, 0]}><cylinderGeometry args={[4.2, 4.7, 0.22, 64]} /><meshStandardMaterial color="#c9c6ba" roughness={0.72} /></mesh>
      <mesh castShadow position={[0, 0.65, 0]}><cylinderGeometry args={[2.5, 3.1, 1.2, 48]} /><meshStandardMaterial color="#bcb9ae" roughness={0.58} /></mesh>
      <mesh castShadow position={[0, 1.35, 0]}><cylinderGeometry args={[2.7, 2.25, 0.3, 48]} /><meshStandardMaterial color="#dedbd0" roughness={0.5} /></mesh>
      {Array.from({ length: 18 }, (_, index) => {
        const angle = (index / 18) * Math.PI * 2;
        return <mesh key={index} castShadow position={[Math.cos(angle) * 2.65, 0.85, Math.sin(angle) * 2.65]}><cylinderGeometry args={[0.09, 0.11, 1.45, 10]} /><meshStandardMaterial color="#e0ddd2" /></mesh>;
      })}
      <pointLight position={[0, 3, 0]} intensity={2 + trust / 28} distance={15} color="#ffca7a" />
    </group>
  );
}

function Windows({ width, height, depth, warm }: { width: number; height: number; depth: number; warm: boolean }) {
  const floors = Math.max(1, Math.floor(height / 0.55));
  const columns = Math.max(1, Math.floor(width / 0.5));
  return <group position={[0, -height / 2 + 0.45, depth / 2 + 0.018]}>{Array.from({ length: floors * columns }, (_, i) => {
    if (seeded(i, height * 10) < 0.35) return null;
    const row = Math.floor(i / columns); const col = i % columns;
    return <mesh key={i} position={[(col - (columns - 1) / 2) * 0.38, row * 0.47, 0]}><planeGeometry args={[0.18, 0.2]} /><meshBasicMaterial color={warm ? "#ffc46f" : "#d9efff"} toneMapped={false} /></mesh>;
  })}</group>;
}

function BuildingBlock({ item, restriction }: { item: Building; restriction: number }) {
  const controlled = item.district === "controlled";
  const open = item.district === "open";
  const color = controlled ? "#4a4d4d" : open ? "#77786f" : "#a7a79e";
  return (
    <group position={[item.x, item.h / 2, item.z]}>
      <RoundedBox castShadow receiveShadow args={[item.w, item.h, item.d]} radius={0.07} smoothness={2}><meshStandardMaterial color={color} roughness={0.68} metalness={controlled ? 0.32 : 0.1} /></RoundedBox>
      <Windows width={item.w} height={item.h} depth={item.d} warm={!controlled || restriction < 45} />
      {controlled && restriction > 58 && <mesh position={[0, item.h / 2 + 0.12, 0]}><boxGeometry args={[item.w * 0.8, 0.08, item.d * 0.8]} /><meshBasicMaterial color="#ff493d" toneMapped={false} /></mesh>}
    </group>
  );
}

function Districts({ state,law }: Props) {
  const theme=worldTheme(law);
  const buildings = useMemo<Building[]>(() => Array.from({ length: 76 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const ring = Math.floor(index / 2);
    const x = side * (5.4 + (ring % 6) * 2.35) + (seeded(index, 3) - 0.5) * 0.55;
    const z = -9.5 + Math.floor(ring / 6) * 3.1 + (seeded(index, 5) - 0.5) * 0.5;
    const district = x < -4 ? "open" : x > 4 ? "controlled" : "civic";
    const equalized=theme==="need"?1.7+seeded(index,11)*1.2:1.2+seeded(index,11)*(district==="civic"?4.5:3);
    const openRise=theme==="freedom"&&district==="open"?equalized*1.35:equalized;
    return { x, z, w: 1.2 + seeded(index, 7) * 1.05, d: 1.1 + seeded(index, 9) * 0.8, h: openRise*(0.72+state.stability/180), district };
  }), [state.stability,theme]);
  return <group>{buildings.map((item, index) => <BuildingBlock key={index} item={item} restriction={100 - state.liberty} />)}</group>;
}

function WorldInstitutions({state,law}:Props){
  const theme=worldTheme(law);
  const scars=state.decisionTrace.length;
  if(theme==="contact")return <group>
    <group position={[-10,0,-1]}>{[2.4,1.65,.9].map((radius,index)=><mesh key={radius} rotation-x={Math.PI/2} position-y={.35+index*.34}><torusGeometry args={[radius,.12,10,48]} /><meshStandardMaterial color={index===scars%3?"#f4c1d8":"#8f6879"} emissive="#4b2035" emissiveIntensity={.45} metalness={.45} /></mesh>)}</group>
    <group position={[10,0,1]}>{Array.from({length:Math.max(4,scars*3)},(_,index)=><mesh key={index} position={[(index%5-2)*.72,.75,Math.floor(index/5)*.62-1]}><boxGeometry args={[.08,1.5,.5]} /><meshStandardMaterial color="#9a4d61" emissive="#481525" emissiveIntensity={.35} /></mesh>)}</group>
    <pointLight position={[-10,3,-1]} intensity={2.5} distance={9} color="#ff9fc6" />
  </group>;
  if(theme==="freedom")return <group>
    {[-11,-7,7,11].map((x,index)=><group key={x} position={[x,0,index%2?5:-4]}><mesh castShadow position-y={2.4}><cylinderGeometry args={[.16,.48,4.8,7]} /><meshStandardMaterial color="#7d99a4" metalness={.5} /></mesh><mesh position-y={5.1} rotation-z={Math.PI/2}><coneGeometry args={[.55,1.8,3]} /><meshStandardMaterial color="#d6f3ff" emissive="#4ca4c4" emissiveIntensity={.7} /></mesh></group>)}
    <Sparkles count={35+scars*8} scale={[28,9,20]} size={2.2} speed={.25} opacity={.25} color="#9de4ff" />
  </group>;
  if(theme==="need")return <group>
    {[-10,-5,5,10].map((x,index)=><group key={x} position={[x,0,index%2?5:-5]}><mesh castShadow position-y={1.1}><cylinderGeometry args={[1.3,1.5,2.2,20]} /><meshStandardMaterial color="#7e8062" roughness={.8} /></mesh><mesh position-y={2.35}><coneGeometry args={[1.5,.5,20]} /><meshStandardMaterial color="#b3b58d" /></mesh>{Array.from({length:4},(_,bar)=><mesh key={bar} position={[(bar-1.5)*.42,1.1,1.3]}><boxGeometry args={[.18,.9,.08]} /><meshBasicMaterial color="#e2d78b" /></mesh>)}</group>)}
    {Array.from({length:scars},(_,index)=><mesh key={index} position={[-2+index,0.18,8]}><boxGeometry args={[.8,.32,.8]} /><meshStandardMaterial color="#d3b85c" emissive="#705816" emissiveIntensity={.45} /></mesh>)}
  </group>;
  return <group>
    <group position={[-10,0,0]}>{Array.from({length:3+scars},(_,index)=><mesh key={index} position={[(index-2.5)*.72,1.05,0]}><cylinderGeometry args={[.22,.38,2.1,12]} /><meshStandardMaterial color="#78958a" emissive="#294e43" emissiveIntensity={.25} /></mesh>)}</group>
    <mesh position={[10,1.7,0]}><sphereGeometry args={[2.2,28,18]} /><meshStandardMaterial color="#55706e" transparent opacity={.28} emissive="#1c5552" emissiveIntensity={.4} /></mesh>
  </group>;
}

function PrecedentMonuments({state}:Props){
  return <group>{state.decisionTrace.map((trace,index)=>{
    const angle=index/5*Math.PI*2-Math.PI/2;
    const restrictive=trace.tags.includes("restrict")||trace.tags.includes("preempt");
    return <group key={trace.era} position={[Math.cos(angle)*6.2,0,Math.sin(angle)*6.2]} rotation-y={-angle}>
      <mesh castShadow position-y={.65+index*.08}><boxGeometry args={[.22,1.3+index*.16,1.05]} /><meshStandardMaterial color={restrictive?"#a84b45":"#c7aa67"} emissive={restrictive?"#571b18":"#5b4415"} emissiveIntensity={.5} /></mesh>
      <pointLight position={[0,1.5,0]} intensity={.7} distance={3} color={restrictive?"#ff5b50":"#ffd27d"} />
    </group>;
  })}</group>;
}

function Trees({ equality }: { equality: number }) {
  const count = Math.round(18 + equality * 0.35);
  return <group>{Array.from({ length: count }, (_, index) => {
    const left = index % 2 === 0;
    const x = (left ? -1 : 1) * (5 + seeded(index, 21) * 12);
    const z = -10 + seeded(index, 23) * 20;
    return <group key={index} position={[x, 0, z]}><mesh castShadow position-y={0.34}><cylinderGeometry args={[0.05, 0.08, 0.68, 7]} /><meshStandardMaterial color="#504538" /></mesh><mesh castShadow position-y={0.9}><icosahedronGeometry args={[0.48 + seeded(index, 25) * 0.18, 1]} /><meshStandardMaterial color={left ? "#39533e" : "#314338"} roughness={1} /></mesh></group>;
  })}</group>;
}

function CivicDetails({ state }: Props) {
  return <group>
    <group position={[-10,0,5.5]}>
      <mesh receiveShadow position-y={0.035}><cylinderGeometry args={[3.2,3.2,0.07,48]} /><meshStandardMaterial color="#36513b" roughness={1} /></mesh>
      <mesh position-y={0.08} rotation-x={-Math.PI/2}><ringGeometry args={[1.1,1.25,40]} /><meshStandardMaterial color="#b8ad91" /></mesh>
      <mesh position-y={0.14}><cylinderGeometry args={[0.9,0.9,0.18,40]} /><meshStandardMaterial color="#214753" metalness={0.15} roughness={0.25} /></mesh>
      <pointLight position={[0,1.2,0]} intensity={1.2} distance={5} color="#ffc56f" />
    </group>
    <group position={[10.5,0,-8.7]}>
      {[-2.2,0,2.2].map((x,index)=><group key={x} position-x={x}><mesh castShadow position-y={1.05}><cylinderGeometry args={[0.42,0.62,2.1,14]} /><meshStandardMaterial color="#555b5b" metalness={0.38} roughness={0.68} /></mesh><mesh position-y={2.4}><cylinderGeometry args={[0.15,0.23,2.7+index*.5,12]} /><meshStandardMaterial color="#383c3d" metalness={0.5} /></mesh></group>)}
      <Sparkles count={16} scale={[6,4,4]} size={2} speed={0.18} opacity={0.11} color="#b5c9cd" />
    </group>
    {Array.from({length:22},(_,index)=>{
      const x=-18+(index%11)*3.55; const z=index<11?-10.8:10.8;
      return <group key={index} position={[x,0,z]}><mesh castShadow position-y={0.8}><cylinderGeometry args={[0.045,0.07,1.6,8]} /><meshStandardMaterial color="#5c5d57" metalness={0.6} /></mesh><pointLight position={[0,1.65,0]} intensity={0.7+state.trust/100} distance={3.5} color="#ffd18a" /><mesh position-y={1.66}><sphereGeometry args={[0.07,8,6]} /><meshBasicMaterial color="#ffe0a3" toneMapped={false} /></mesh></group>;
    })}
  </group>;
}

function Transit({ stability }: { stability: number }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * (0.025 + stability / 4500); });
  return <group ref={group} position-y={0.28}>{Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    return <mesh key={index} position={[Math.cos(angle) * 14.5, 0, Math.sin(angle) * 14.5]} rotation-y={-angle}><boxGeometry args={[0.9, 0.18, 0.28]} /><meshStandardMaterial color="#ece9df" emissive="#ffc275" emissiveIntensity={2} toneMapped={false} /></mesh>;
  })}</group>;
}

function Citizens({ population, liberty }: { population: number; liberty: number }) {
  const group = useRef<Group>(null);
  const count = Math.round(80 + ((population - 75_000) / 50_000) * 70);
  const positions = useMemo(() => Array.from({ length: count }, (_, index) => ({ x: (seeded(index, 31) - 0.5) * 22, z: (seeded(index, 33) - 0.5) * 17, phase: seeded(index, 35) * Math.PI * 2 })), [count]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.children.forEach((child, index) => { child.position.x = positions[index].x + Math.sin(clock.elapsedTime * 0.28 + positions[index].phase) * (0.25 + liberty / 220); });
  });
  return <group ref={group}>{positions.map((point, index) => <mesh key={index} position={[point.x, 0.12, point.z]} castShadow><capsuleGeometry args={[0.028, 0.14, 2, 5]} /><meshStandardMaterial color={index % 4 === 0 ? "#e4b16c" : "#c5c2b8"} /></mesh>)}</group>;
}

function ControlSystem({ state }: Props) {
  const restriction = 100 - state.liberty;
  if (restriction < 32) return null;
  return <group>{[[-4.4,-10],[-4.4,10],[4.4,-10],[4.4,10],[18,-10],[18,10]].map(([x,z], index) => <group key={index} position={[x,0,z]}><mesh castShadow position-y={1.7}><cylinderGeometry args={[0.17,0.25,3.4,8]} /><meshStandardMaterial color="#282a2b" metalness={0.7} /></mesh><mesh position-y={3.35}><sphereGeometry args={[0.18,12,8]} /><meshBasicMaterial color="#ff3b32" toneMapped={false} /></mesh><spotLight position={[0,3.25,0]} target-position={[x > 0 ? -3 : 3,0,0]} angle={0.18} penumbra={0.5} intensity={restriction / 16} distance={18} color="#ff392f" /></group>)}
    {restriction > 52 && <group position={[9.2,0,0]}>{Array.from({length:16},(_,i)=><mesh key={i} position={[0,1.1,-11+i*1.45]}><boxGeometry args={[0.08,2.2,0.7]} /><meshBasicMaterial color="#ff3d34" transparent opacity={0.28 + restriction / 250} toneMapped={false} /></mesh>)}</group>}
  </group>;
}

function Scene({ state,law }: Props) {
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const theme=worldTheme(law);
  const sky=theme==="contact"?"#0d060b":theme==="freedom"?"#041016":theme==="need"?"#0b0d07":"#050708";
  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={["#06090a", 28, 72]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={["#aab9c2", "#100d09", 0.9]} />
      <directionalLight castShadow position={[-12, 22, 12]} intensity={2.2} color="#d8e7ee" shadow-mapSize={[2048, 2048]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={22} shadow-camera-bottom={-22} />
      <Suspense fallback={null}><Environment preset="night" /></Suspense>
      <Ground theme={theme} /><TerritoryTiles state={state} law={law} /><Districts state={state} law={law} /><Forum trust={state.trust} /><CivicDetails state={state} law={law} /><WorldInstitutions state={state} law={law} /><PrecedentMonuments state={state} law={law} /><Trees equality={state.equality} /><Transit stability={state.stability} /><Citizens population={state.population} liberty={state.liberty} /><ControlSystem state={state} law={law} />
      <Sparkles count={Math.round(35 + state.trust)} scale={[35, 8, 26]} size={1.2} speed={0.08} opacity={0.16} color="#ffd69a" />
      <ContactShadows position={[0,0.02,0]} scale={48} opacity={0.58} blur={1.8} far={15} />
      <CameraRig authority={state.humanAuthority} />
      <OrbitControls makeDefault target={[0,0,0]} enablePan={false} minDistance={22} maxDistance={55} minPolarAngle={0.45} maxPolarAngle={1.2} autoRotate={!reducedMotion} autoRotateSpeed={0.18} />
    </>
  );
}

export default function WorldCanvas({ state,law }: Props) {
  const [webgl,setWebgl]=useState<boolean|null>(null);
  useEffect(()=>{try{const canvas=document.createElement("canvas");setWebgl(Boolean(canvas.getContext("webgl2")||canvas.getContext("webgl")));}catch{setWebgl(false);}},[]);
  if(webgl===false)return <div className="world-fallback" role="img" aria-label="Civic city map unavailable in three dimensions"><div className="world-fallback__forum">CIVIC<br/>FORUM</div><span>COMMONS</span><span>CONTROL SECTOR</span><p>{state.population.toLocaleString()} CITIZENS · YEAR {state.year}</p></div>;
  if(webgl===null)return <div className="world-loading">Initializing civic model…</div>;
  return <Canvas shadows dpr={[1, 1.6]} camera={{ position:[25,24,30], fov:38, near:0.1, far:120 }} gl={{ antialias:true, powerPreference:"high-performance" }}><Scene state={state} law={law} /></Canvas>;
}
