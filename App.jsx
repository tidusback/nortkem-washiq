import { useState, useRef, useEffect, createContext, useContext } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ─── COLORS ───────────────────────────────────────────────────
const C = {
  bg:"#F2F2F7", card:"#FFFFFF",
  blue:"#1A6FDB", blueLight:"#E8F0FD",
  navy:"#1C2B4A", navyMid:"#243860",
  green:"#34C759", greenLight:"#E8F8ED",
  red:"#FF3B30",   redLight:"#FFF0EF",
  orange:"#FF9500",orangeLight:"#FFF4E5",
  purple:"#5856D6",purpleLight:"#EDECFB",
  teal:"#32ADE6",  tealLight:"#E5F5FC",
  yellow:"#FFCC00",yellowLight:"#FFFBE5",
  text:"#1C1C1E",  textSub:"#6E6E73", textMuted:"#AEAEB2",
  border:"#E5E5EA",borderLight:"#F5F5F7",
  shadow:"0 2px 14px rgba(0,0,0,0.07)",
  shadowMd:"0 4px 20px rgba(0,0,0,0.10)",
  shadowLg:"0 8px 40px rgba(0,0,0,0.13)",
};
const F = "-apple-system,'SF Pro Text',sans-serif";

// ─── VERIFIED DATA ────────────────────────────────────────────
const CHEMICAL_TYPES = [
  { key:"alkali",    name:"Alkali/Builder",        color:C.orange, icon:"🧱", unit:"mL/kg", desc:"Breaks down and neutralizes soils; conditions cotton fibers to release stains. pH 10–12. Use in Break step.", defaultDose:5,  minDose:2,   maxDose:12 },
  { key:"detergent", name:"Detergent/Surfactant",  color:C.blue,   icon:"🧴", unit:"mL/kg", desc:"Primary cleaning agent. Emulsifies, lifts and suspends oily/greasy soils. Engineered for controlled foam.",  defaultDose:8,  minDose:3,   maxDose:15 },
  { key:"chlorine",  name:"Chlorine Bleach",        color:C.yellow, icon:"⚗️", unit:"mL/kg", desc:"For WHITE cotton only. Brightens and disinfects. NEVER use on colors, wool, silk or synthetics.",           defaultDose:4,  minDose:1,   maxDose:8  },
  { key:"oxygen",    name:"Oxygen/Color-Safe Bleach",color:C.teal,  icon:"💧", unit:"mL/kg", desc:"Color-safe bleach. Safe on most fabrics. Used when chlorine bleach is not suitable.",                        defaultDose:3,  minDose:1,   maxDose:7  },
  { key:"enzyme",    name:"Enzyme Cleaner",          color:C.purple, icon:"🔬", unit:"mL/kg", desc:"Breaks down protein stains (blood, body fluids, food). Use in pre-soak or Break step.",                     defaultDose:3,  minDose:1,   maxDose:6  },
  { key:"sour",      name:"Neutralizer/Sour",        color:C.green,  icon:"⚖️", unit:"mL/kg", desc:"Reduces final rinse pH to 5–6.5 (skin-safe). Removes alkali residues. Prevents yellowing and skin irritation.", defaultDose:2, minDose:0.5, maxDose:5  },
  { key:"softener",  name:"Fabric Softener",         color:C.red,    icon:"🌸", unit:"mL/kg", desc:"Adds softness and reduces static cling. Use sparingly on towels — excess reduces absorbency.",              defaultDose:2,  minDose:0.5, maxDose:5  },
  { key:"starch",    name:"Starch/Sizing",           color:C.navy,   icon:"📐", unit:"mL/kg", desc:"Adds body and crispness to F&B linens and uniforms. Applied in final rinse. Improves soil resistance.",     defaultDose:3,  minDose:1,   maxDose:8  },
  { key:"emulsifier",name:"Emulsifier/Degreaser",   color:"#AF52DE", icon:"🛢️", unit:"mL/kg", desc:"For heavily greased items (kitchen, spa, industrial). Solubilizes fats and oils before wash cycle.",        defaultDose:3,  minDose:1,   maxDose:7  },
  { key:"cleaning",  name:"Cleaning Chemical",       color:C.teal,   icon:"🧹", unit:"dilution", desc:"General-purpose cleaning product: Tile & bowl cleaner, glass cleaner, degreaser, dishwashing liquid, hand soap.",  defaultDose:0, minDose:0, maxDose:0  },
];

const DEFAULT_LINEN_TYPES = [
  { id:1, name:"White Hotel Sheets",       icon:"🛏️", color:C.blue,    fabric:"Cotton",          tempC:63, cycleMin:42, pH:7.0, rewashTarget:2,
    chemicals:{ alkali:5, detergent:8, chlorine:4, oxygen:0, enzyme:0, sour:2, softener:2, starch:0, emulsifier:0 },
    steps:[ {name:"Pre-Flush",tempC:30,min:4,chemicals:[]},{name:"Break/Alkali",tempC:63,min:8,chemicals:["alkali","enzyme"]},{name:"Main Wash",tempC:63,min:14,chemicals:["detergent","chlorine"]},{name:"Rinse 1",tempC:50,min:5,chemicals:[]},{name:"Rinse 2",tempC:35,min:5,chemicals:[]},{name:"Sour Rinse",tempC:35,min:4,chemicals:["sour"]},{name:"Softener",tempC:30,min:4,chemicals:["softener"]} ],
    notes:"Standard white cotton. Chlorine bleach maintains whiteness. Neutral detergent (pH 7–8) preserves fabric integrity. Source: Hospitality.Institute / Ecolab Aquanomic." },
  { id:2, name:"Bath Towels (White)",       icon:"🏨", color:C.teal,    fabric:"Cotton Terry",    tempC:63, cycleMin:45, pH:7.1, rewashTarget:2,
    chemicals:{ alkali:6, detergent:8, chlorine:0, oxygen:4, enzyme:0, sour:2, softener:1, starch:0, emulsifier:0 },
    steps:[ {name:"Pre-Flush",tempC:30,min:4,chemicals:[]},{name:"Break/Alkali",tempC:63,min:8,chemicals:["alkali"]},{name:"Main Wash",tempC:63,min:15,chemicals:["detergent","oxygen"]},{name:"Rinse 1",tempC:50,min:5,chemicals:[]},{name:"Rinse 2",tempC:35,min:5,chemicals:[]},{name:"Sour Rinse",tempC:35,min:4,chemicals:["sour"]},{name:"Softener",tempC:30,min:4,chemicals:["softener"]} ],
    notes:"Oxygen bleach preferred over chlorine — preserves cotton fiber strength. MINIMAL softener to maintain absorbency. Source: Hospitality.Institute." },
  { id:3, name:"Colored Bath Linens",       icon:"🎨", color:C.purple,  fabric:"Cotton Blend",    tempC:48, cycleMin:40, pH:6.9, rewashTarget:3,
    chemicals:{ alkali:3, detergent:6, chlorine:0, oxygen:0, enzyme:2, sour:2, softener:2, starch:0, emulsifier:0 },
    steps:[ {name:"Pre-Flush",tempC:25,min:3,chemicals:[]},{name:"Break/Alkali",tempC:48,min:7,chemicals:["alkali","enzyme"]},{name:"Main Wash",tempC:48,min:13,chemicals:["detergent"]},{name:"Rinse 1",tempC:40,min:5,chemicals:[]},{name:"Rinse 2",tempC:30,min:5,chemicals:[]},{name:"Sour Rinse",tempC:30,min:4,chemicals:["sour"]},{name:"Softener",tempC:25,min:3,chemicals:["softener"]} ],
    notes:"NO chlorine or oxygen bleach — causes color fading. Warm wash 45–50°C preserves color vibrancy. Source: Hospitality.Institute." },
  { id:4, name:"Hospital / Medical Scrubs", icon:"🏥", color:C.red,     fabric:"Poly-Cotton",     tempC:71, cycleMin:55, pH:7.5, rewashTarget:1,
    chemicals:{ alkali:6, detergent:8, chlorine:0, oxygen:5, enzyme:3, sour:2, softener:2, starch:0, emulsifier:0 },
    steps:[ {name:"Pre-Flush",tempC:35,min:5,chemicals:[]},{name:"Break/Alkali",tempC:71,min:10,chemicals:["alkali","enzyme"]},{name:"Disinfection Wash",tempC:71,min:18,chemicals:["detergent","oxygen"]},{name:"Rinse 1",tempC:55,min:5,chemicals:[]},{name:"Rinse 2",tempC:40,min:5,chemicals:[]},{name:"Sour Rinse",tempC:38,min:4,chemicals:["sour"]},{name:"Softener",tempC:30,min:4,chemicals:["softener"]} ],
    notes:"71°C minimum for thermal disinfection (OSHA/CDC). Enzyme cleaner essential for blood and body fluid stains. Source: CDC Guidelines / Ecolab AdvaCare." },
  { id:5, name:"F&B Napkins & Tablecloths", icon:"🍽️", color:C.green,   fabric:"Cotton/Polyester", tempC:68, cycleMin:48, pH:7.2, rewashTarget:2,
    chemicals:{ alkali:6, detergent:8, chlorine:5, oxygen:0, enzyme:2, sour:2, softener:1, starch:3, emulsifier:2 },
    steps:[ {name:"Pre-Flush",tempC:30,min:4,chemicals:[]},{name:"Emulsify",tempC:50,min:6,chemicals:["emulsifier","enzyme"]},{name:"Break/Alkali",tempC:68,min:8,chemicals:["alkali"]},{name:"Main Wash",tempC:68,min:14,chemicals:["detergent","chlorine"]},{name:"Rinse 1",tempC:50,min:5,chemicals:[]},{name:"Sour Rinse",tempC:35,min:4,chemicals:["sour"]},{name:"Starch/Finish",tempC:30,min:4,chemicals:["starch","softener"]} ],
    notes:"Emulsifier essential for grease/food oils. Starch creates crisp appearance. Chlorine bleach on white F&B items." },
  { id:6, name:"Pillow Cases (White)",       icon:"💤", color:C.orange,  fabric:"Cotton",          tempC:60, cycleMin:40, pH:7.0, rewashTarget:2,
    chemicals:{ alkali:4, detergent:7, chlorine:0, oxygen:3, enzyme:0, sour:2, softener:2, starch:0, emulsifier:0 },
    steps:[ {name:"Pre-Flush",tempC:30,min:4,chemicals:[]},{name:"Break/Alkali",tempC:60,min:7,chemicals:["alkali"]},{name:"Main Wash",tempC:60,min:13,chemicals:["detergent","oxygen"]},{name:"Rinse 1",tempC:45,min:5,chemicals:[]},{name:"Rinse 2",tempC:30,min:4,chemicals:[]},{name:"Sour Rinse",tempC:30,min:4,chemicals:["sour"]},{name:"Softener",tempC:25,min:3,chemicals:["softener"]} ],
    notes:"Oxygen bleach preferred — gentler than chlorine on delicate cotton weave. 60°C achieves hygiene without excessive fiber damage." },
  { id:7, name:"Delicate / Silk Items",      icon:"🧣", color:"#FF2D55", fabric:"Silk/Delicate",   tempC:22, cycleMin:25, pH:6.5, rewashTarget:4,
    chemicals:{ alkali:0, detergent:3, chlorine:0, oxygen:0, enzyme:0, sour:1, softener:1, starch:0, emulsifier:0 },
    steps:[ {name:"Delicate Wash",tempC:22,min:10,chemicals:["detergent"]},{name:"Rinse 1",tempC:20,min:5,chemicals:[]},{name:"Gentle Sour",tempC:20,min:5,chemicals:["sour"]},{name:"Conditioner",tempC:20,min:5,chemicals:["softener"]} ],
    notes:"Cold water ONLY (20–25°C). pH-neutral detergent ONLY. NO bleach of any kind. Short 8–12 min agitation. Source: Hospitality.Institute." },
  { id:8, name:"Polyester Staff Uniforms",   icon:"👔", color:"#AF52DE", fabric:"Polyester",       tempC:45, cycleMin:38, pH:6.8, rewashTarget:3,
    chemicals:{ alkali:3, detergent:5, chlorine:0, oxygen:0, enzyme:2, sour:2, softener:2, starch:0, emulsifier:1 },
    steps:[ {name:"Pre-Flush",tempC:25,min:3,chemicals:[]},{name:"Break/Alkali",tempC:45,min:7,chemicals:["alkali","enzyme"]},{name:"Main Wash",tempC:45,min:13,chemicals:["detergent","emulsifier"]},{name:"Rinse 1",tempC:35,min:5,chemicals:[]},{name:"Sour Rinse",tempC:30,min:4,chemicals:["sour"]},{name:"Softener",tempC:25,min:4,chemicals:["softener"]} ],
    notes:"Polyester has affinity for oils. Emulsifier prevents buildup. NO chlorine bleach — damages synthetic fibers. Source: TRSA / US Chemical Guide." },
];

// Version stamp — bump this to force-reset stored chemicals to new defaults
const CHEM_VERSION = "2026-03-08";

const DEFAULT_CHEMICALS = [
  // ── LAUNDRY CHEMICALS (Official NORTKEM Price List, March 2026) ──────────────
  // costPerL  = Carbuoy 20L price ÷ litres (standard hotel purchase)
  // marketCostPerL = typical competitor/market price (Diversey, Ecolab, etc.)

  { id:1, key:"detergent",  name:"Nortkem HE Liquid Detergent",
    type:"detergent",  doseML:8,  costPerL:75,   marketCostPerL:160,
    stock:80,  color:C.blue,   active:true,
    note:"1x Carbuoy 20L = ₱1,500 | 1x Drum 110L = ₱5,150" },

  { id:2, key:"chlorine",   name:"Nortkem Hospital Grade 5.5% Bleach",
    type:"chlorine",   doseML:4,  costPerL:70,   marketCostPerL:130,
    stock:40,  color:C.yellow, active:true,
    note:"1x Carbuoy 20L = ₱1,400 | 1x Drum 96L = ₱4,800" },

  { id:3, key:"softener",   name:"Nortkem SUPER Fabcon HE Blue",
    type:"softener",   doseML:2,  costPerL:75,   marketCostPerL:145,
    stock:60,  color:C.teal,   active:true,
    note:"1x Carbuoy 20L = ₱1,500 | 1x Drum 103L = ₱6,600" },

  { id:4, key:"softener",   name:"Nortkem SUPER Fabcon Violet/Pink",
    type:"softener",   doseML:2,  costPerL:90,   marketCostPerL:165,
    stock:30,  color:C.red,    active:false,
    note:"1x Carbuoy 20L = ₱1,800 | 1x Drum 103L = ₱7,021" },

  { id:5, key:"starch",     name:"Nortkem Fabric Cologne DNSY",
    type:"starch",     doseML:3,  costPerL:325,  marketCostPerL:520,
    stock:10,  color:C.purple, active:true,
    note:"1x Carbuoy 20L = ₱6,500 | 1x Drum 100L = ₱29,100 · Alcohol-based" },

  { id:6, key:"starch",     name:"Nortkem Fabric Cologne Comfy/Passion",
    type:"starch",     doseML:3,  costPerL:345,  marketCostPerL:550,
    stock:10,  color:C.orange, active:false,
    note:"1x Carbuoy 20L = ₱6,900 | 1x Drum 100L = ₱31,400 · Alcohol-based" },

  { id:7, key:"detergent",  name:"Nortkem Powdered Soap A-Plus",
    type:"detergent",  doseML:25, costPerL:86.5, marketCostPerL:170,
    stock:25,  color:C.green,  active:false,
    note:"1x Bag 25kg = ₱2,162.50 (₱86.50/kg) · Dose in g/kg ≈ mL/kg" },

  { id:8, key:"detergent",  name:"Nortkem Powdered Soap Ultra",
    type:"detergent",  doseML:25, costPerL:72.5, marketCostPerL:155,
    stock:25,  color:C.navyMid,active:false,
    note:"1x Bag 25kg = ₱1,812.50 (₱72.50/kg)" },

  { id:9, key:"detergent",  name:"Nortkem Powdered Soap Eco",
    type:"detergent",  doseML:25, costPerL:66,   marketCostPerL:140,
    stock:25,  color:C.textSub,active:false,
    note:"1x Bag 25kg = ₱1,650.00 (₱66.00/kg)" },

  { id:10, key:"alkali",    name:"Nortkem Alkali Builder",
    type:"alkali",     doseML:5,  costPerL:320,  marketCostPerL:480,
    stock:50,  color:C.orange, active:true,
    note:"Contact NORTKEM for current pricing. +63 992 9364240" },

  { id:11, key:"oxygen",    name:"Nortkem OxyGuard",
    type:"oxygen",     doseML:3,  costPerL:420,  marketCostPerL:620,
    stock:35,  color:C.blue,   active:true,
    note:"Contact NORTKEM for current pricing. +63 992 9364240" },

  { id:12, key:"sour",      name:"Nortkem Sour/Neutralizer",
    type:"sour",       doseML:2,  costPerL:210,  marketCostPerL:310,
    stock:45,  color:C.green,  active:true,
    note:"Contact NORTKEM for current pricing. +63 992 9364240" },

  { id:13, key:"enzyme",    name:"Nortkem Enzyme Concentrate",
    type:"enzyme",     doseML:3,  costPerL:680,  marketCostPerL:950,
    stock:20,  color:C.purple, active:true,
    note:"Contact NORTKEM for current pricing. +63 992 9364240" },

  // ── CLEANING CHEMICALS (Official NORTKEM Price List, March 2026) ─────────────
  { id:14, key:"cleaning", name:"Nortkem Tile and Bowl Cleaner",
    type:"cleaning", doseML:0, costPerL:133,  marketCostPerL:220,
    stock:20, color:C.teal,   active:false,
    note:"1x Carbuoy 20L = ₱2,660 | 1x Drum 110L = ₱14,567.50" },

  { id:15, key:"cleaning", name:"Nortkem Glass Cleaner",
    type:"cleaning", doseML:0, costPerL:36,   marketCostPerL:75,
    stock:20, color:C.blue,   active:false,
    note:"1x Carbuoy 20L = ₱720 | 1x Drum 80L = ₱2,600" },

  { id:16, key:"cleaning", name:"Nortkem Engine/Kitchen Degreaser",
    type:"cleaning", doseML:0, costPerL:140,  marketCostPerL:240,
    stock:15, color:C.orange, active:false,
    note:"1x Carbuoy 20L = ₱2,800 | 1x Drum 50L = ₱6,600" },

  { id:17, key:"cleaning", name:"Nortkem Dishwashing Liquid (Lemon/Calamansi)",
    type:"cleaning", doseML:0, costPerL:49.5, marketCostPerL:95,
    stock:30, color:C.yellow, active:false,
    note:"1x Carbuoy 20L = ₱990 | 1 gal (3.2L) = ₱125 | 1x Drum 108L = ₱2,100" },

  { id:18, key:"cleaning", name:"Nortkem Hand Soap Green Apple",
    type:"cleaning", doseML:0, costPerL:60,   marketCostPerL:115,
    stock:25, color:C.green,  active:false,
    note:"1x Carbuoy 20L = ₱1,200 | 1x Drum 110L = ₱4,720" },
];

const DEMO_USERS = [
  { id:1, name:"Maria Santos", email:"maria@grandhotel.ph",   property:"Grand Hotel Angeles",  rooms:200, role:"Laundry Manager",      avatar:"MS", createdAt:"Jan 2025" },
  { id:2, name:"Jose Reyes",   email:"jose@clarkmarriott.ph", property:"Clark Marriott Hotel", rooms:260, role:"Executive Housekeeper", avatar:"JR", createdAt:"Feb 2025" },
];

// ─── RESPONSIVE CONTEXT ──────────────────────────────────────
const IsMobile = createContext(true);
const useIsMobile = () => useContext(IsMobile);

// ─── SHARED UI ────────────────────────────────────────────────
const Card = ({children, style={}, onClick}) => (
  <div onClick={onClick} style={{background:C.card,borderRadius:18,boxShadow:C.shadow,padding:20,border:`1px solid ${C.border}`,...style,cursor:onClick?"pointer":"default"}}>{children}</div>
);
const Label = ({children,style={}}) => (
  <div style={{fontSize:11,fontWeight:600,color:C.textMuted,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:7,fontFamily:F,...style}}>{children}</div>
);
const Badge = ({label,color=C.blue,size=11}) => (
  <span style={{background:`${color}18`,color,fontSize:size,fontWeight:600,padding:"3px 10px",borderRadius:20,fontFamily:F,whiteSpace:"nowrap"}}>{label}</span>
);
const SectionHead = ({title,subtitle,action}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
    <div>
      <h2 style={{color:C.text,fontSize:22,fontWeight:700,margin:0,letterSpacing:"-0.02em",fontFamily:F}}>{title}</h2>
      {subtitle&&<p style={{color:C.textSub,fontSize:13,margin:"4px 0 0",fontFamily:F}}>{subtitle}</p>}
    </div>
    {action}
  </div>
);
const Seg = ({options,value,onChange}) => (
  <div style={{display:"flex",background:C.bg,borderRadius:11,padding:3,border:`1px solid ${C.border}`}}>
    {options.map(o=>(
      <button key={o} onClick={()=>onChange(o)} style={{flex:1,padding:"8px 4px",borderRadius:9,border:"none",cursor:"pointer",background:value===o?C.card:"transparent",color:value===o?C.blue:C.textMuted,fontWeight:value===o?700:400,fontSize:12,fontFamily:F,boxShadow:value===o?C.shadow:"none",transition:"all 0.2s"}}>{o}</button>
    ))}
  </div>
);
const Input = ({label,value,onChange,type="number",suffix,prefix,min,max,step=1,placeholder,small,note}) => (
  <div style={{marginBottom:small?10:14}}>
    {label&&<Label>{label}</Label>}
    <div style={{display:"flex",alignItems:"center",background:C.bg,borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
      {prefix&&<span style={{padding:"0 10px",color:C.blue,fontSize:14,fontWeight:700,fontFamily:F}}>{prefix}</span>}
      <input type={type} value={value} placeholder={placeholder} min={min} max={max} step={step}
        onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
        style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:small?14:15,padding:small?"10px 12px":"13px 14px",paddingLeft:prefix?0:(small?12:14),fontFamily:F}}/>
      {suffix&&<span style={{padding:"0 12px",color:C.textMuted,fontSize:12,fontFamily:F,whiteSpace:"nowrap"}}>{suffix}</span>}
    </div>
    {note&&<div style={{color:C.textMuted,fontSize:11,marginTop:4,fontFamily:F}}>{note}</div>}
  </div>
);
const StatCard = ({label,value,color=C.blue,icon,sub,style={}}) => (
  <Card style={{padding:"15px 12px",textAlign:"center",...style}}>
    {icon&&<div style={{fontSize:20,marginBottom:5}}>{icon}</div>}
    <div style={{color,fontSize:20,fontWeight:800,fontFamily:F,lineHeight:1.1}}>{value}</div>
    <div style={{color:C.textMuted,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:3,fontFamily:F}}>{label}</div>
    {sub&&<div style={{color:C.textSub,fontSize:11,marginTop:2,fontFamily:F}}>{sub}</div>}
  </Card>
);
const BarMeter = ({label,value,max=100,color,suffix="%",note}) => (
  <div style={{marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{color:C.textSub,fontSize:13,fontFamily:F}}>{label}</span>
      <span style={{color,fontSize:13,fontWeight:700,fontFamily:F}}>{value}{suffix}</span>
    </div>
    <div style={{background:C.bg,borderRadius:6,height:7,overflow:"hidden"}}>
      <div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:`linear-gradient(90deg,${color},${color}cc)`,borderRadius:6,transition:"width 0.6s ease"}}/>
    </div>
    {note&&<div style={{color:C.textMuted,fontSize:10,marginTop:3,fontFamily:F}}>{note}</div>}
  </div>
);
const Tip = ({text,color=C.blue}) => (
  <div style={{background:`${color}10`,border:`1px solid ${color}25`,borderRadius:12,padding:"11px 14px",color:C.textSub,fontSize:12,fontFamily:F,lineHeight:1.6,marginTop:10}}>
    <span style={{color,fontWeight:700}}>💡 </span>{text}
  </div>
);
const TTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",boxShadow:C.shadowMd}}>
    <div style={{color:C.text,fontSize:12,fontWeight:700,marginBottom:4,fontFamily:F}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color,fontSize:12,fontFamily:F}}>{p.name}: {p.value}</div>)}
  </div>;
};
const Btn = ({children,onClick,color=C.blue,ghost,full,small,disabled}) => (
  <button onClick={onClick} disabled={disabled}
    style={{width:full?"100%":"auto",padding:small?"9px 16px":"13px 20px",borderRadius:14,border:ghost?`1.5px solid ${color}`:"none",background:ghost?"transparent":disabled?C.textMuted:color,color:ghost?color:"#fff",fontSize:small?13:15,fontWeight:700,cursor:disabled?"default":"pointer",fontFamily:F,transition:"all 0.2s"}}>
    {children}
  </button>
);

// ─── LOGO ─────────────────────────────────────────────────────
function Logo({size=40}) {
  const s=size, cx=s/2, cy=s/2, r=s*0.42, n=5;
  return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
    {Array.from({length:n}).map((_,i)=>{
      const a=(i/n)*2*Math.PI-Math.PI/2, na=a+(2*Math.PI)/n, ma=(a+na)/2;
      return <path key={i} d={`M${cx},${cy} Q${cx+r*0.32*Math.cos(a)},${cy+r*0.32*Math.sin(a)} ${cx+r*Math.cos(ma-0.3)},${cy+r*Math.sin(ma-0.3)} Q${cx+r*0.1*Math.cos(ma)},${cy+r*0.1*Math.sin(ma)} ${cx+r*Math.cos(ma+0.3)},${cy+r*Math.sin(ma+0.3)} Z`}
        fill={i===0?"#1A6FDB":"#2C2C2C"}/>;
    })}
    <circle cx={cx} cy={cy} r={s*0.07} fill="#fff"/>
  </svg>;
}

// ─── REGISTER ────────────────────────────────────────────────
function RegisterScreen({onBack,onRegister}) {
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",email:"",password:"",confirm:"",property:"",rooms:100,role:"Laundry Manager"});
  const [err,setErr]=useState("");
  const ROLES=["Laundry Manager","Executive Housekeeper","Housekeeping Supervisor","Laundry Supervisor","General Manager","Purchasing Officer"];
  const upd=k=>v=>setForm(f=>({...f,[k]:v}));
  const next=()=>{
    setErr("");
    if(step===1){
      if(!form.name.trim()||!form.email.trim()) return setErr("Please fill in all fields.");
      if(!form.email.includes("@")) return setErr("Enter a valid email address.");
      setStep(2);
    } else if(step===2){
      if(!form.password||form.password.length<6) return setErr("Password must be at least 6 characters.");
      if(form.password!==form.confirm) return setErr("Passwords do not match.");
      setStep(3);
    } else {
      if(!form.property.trim()) return setErr("Please enter your property name.");
      const u={id:Date.now(),name:form.name,email:form.email.toLowerCase(),password:form.password,property:form.property,rooms:form.rooms,role:form.role,avatar:form.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2),createdAt:"2026"};
      onRegister(u);
    }
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#deeafc 0%,#f2f2f7 55%,#eff4ff 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:72,height:72,borderRadius:20,background:C.card,boxShadow:C.shadowLg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Logo size={52}/></div>
        <h1 style={{fontFamily:F,fontSize:22,fontWeight:800,color:C.text,margin:"0 0 3px",letterSpacing:"-0.03em"}}>NORTKEM WASH IQ</h1>
        <p style={{color:C.textSub,fontSize:13,margin:0,fontFamily:F}}>Create Your Account</p>
      </div>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {[1,2,3].map(s=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:step>=s?C.blue:C.bg,border:`2px solid ${step>=s?C.blue:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:step>=s?"#fff":C.textMuted,fontSize:12,fontWeight:700,fontFamily:F}}>{step>s?"✓":s}</div>
              {s<3&&<div style={{width:30,height:2,background:step>s?C.blue:C.border}}/>}
            </div>
          ))}
        </div>
        <Card style={{padding:26,boxShadow:C.shadowLg}}>
          <div style={{color:C.text,fontWeight:700,fontSize:16,marginBottom:18,fontFamily:F}}>
            {step===1?"Personal Details":step===2?"Set Password":"Property Info"}
          </div>
          {step===1&&<>
            <Input label="Full Name" value={form.name} onChange={upd("name")} type="text" placeholder="Juan dela Cruz"/>
            <Input label="Email Address" value={form.email} onChange={upd("email")} type="email" placeholder="you@hotel.ph"/>
            <div style={{marginBottom:14}}>
              <Label>Your Role</Label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {ROLES.map(r=><button key={r} onClick={()=>upd("role")(r)} style={{padding:"7px 12px",borderRadius:10,border:`1.5px solid ${form.role===r?C.blue:C.border}`,background:form.role===r?C.blueLight:C.bg,color:form.role===r?C.blue:C.textSub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>{r}</button>)}
              </div>
            </div>
          </>}
          {step===2&&<>
            <div style={{marginBottom:14}}>
              <Label>Password</Label>
              <div style={{background:C.bg,borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
                <input type="password" value={form.password} placeholder="Minimum 6 characters" onChange={e=>upd("password")(e.target.value)} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,padding:"13px 14px",fontFamily:F}}/>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <Label>Confirm Password</Label>
              <div style={{background:C.bg,borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
                <input type="password" value={form.confirm} placeholder="Re-enter password" onChange={e=>upd("confirm")(e.target.value)} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,padding:"13px 14px",fontFamily:F}}/>
              </div>
            </div>
          </>}
          {step===3&&<>
            <Input label="Property / Hotel Name" value={form.property} onChange={upd("property")} type="text" placeholder="Grand Hotel Angeles"/>
            <Input label="Number of Rooms" value={form.rooms} onChange={upd("rooms")} min={10} max={5000} suffix="rooms"/>
          </>}
          {err&&<div style={{background:C.redLight,border:`1px solid ${C.red}28`,borderRadius:10,padding:"9px 14px",color:C.red,fontSize:13,fontFamily:F,marginBottom:14}}>{err}</div>}
          <div style={{display:"flex",gap:10,marginTop:4}}>
            {step>1&&<Btn onClick={()=>{setErr("");setStep(s=>s-1);}} ghost color={C.blue}>Back</Btn>}
            <Btn onClick={next} full color={C.blue}>{step===3?"Create Account →":step===2?"Continue →":"Next →"}</Btn>
          </div>
          <button onClick={onBack} style={{width:"100%",background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:13,padding:"12px 0 0",fontFamily:F}}>
            Already have an account? Sign In
          </button>
        </Card>
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────
function LoginScreen({onLogin,onRegister,users}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [show,setShow]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const allUsers=[...DEMO_USERS,...users];
  const handle=()=>{
    if(!email||!pass){setErr("Please enter email and password.");return;}
    setLoading(true);setErr("");
    setTimeout(()=>{
      const u=allUsers.find(u=>u.email===email.trim().toLowerCase());
      const ok=u&&(u.password?u.password===pass:pass==="nortkem123");
      if(ok){onLogin(u);}else{setErr("Invalid credentials. Check demo accounts below.");setLoading(false);}
    },800);
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#deeafc 0%,#f2f2f7 55%,#eff4ff 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{width:80,height:80,borderRadius:22,background:C.card,boxShadow:C.shadowLg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Logo size={58}/></div>
        <h1 style={{fontFamily:F,fontSize:25,fontWeight:800,color:C.text,margin:"0 0 4px",letterSpacing:"-0.03em"}}>NORTKEM WASH IQ</h1>
        <p style={{color:C.textSub,fontSize:14,margin:0,fontFamily:F}}>Laundry Intelligence Platform</p>
      </div>
      <div style={{width:"100%",maxWidth:390}}>
        <Card style={{padding:26,boxShadow:C.shadowLg}}>
          <h3 style={{color:C.text,fontWeight:700,fontSize:19,margin:"0 0 20px",fontFamily:F}}>Welcome Back</h3>
          <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="you@hotel.ph"/>
          <div style={{marginBottom:14}}>
            <Label>Password</Label>
            <div style={{display:"flex",alignItems:"center",background:C.bg,borderRadius:12,border:`1.5px solid ${C.border}`}}>
              <input type={show?"text":"password"} value={pass} placeholder="Enter password" onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,padding:"13px 14px",fontFamily:F}}/>
              <button onClick={()=>setShow(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 14px",color:C.textMuted,fontSize:13,fontFamily:F}}>{show?"Hide":"Show"}</button>
            </div>
          </div>
          {err&&<div style={{background:C.redLight,border:`1px solid ${C.red}28`,borderRadius:10,padding:"9px 14px",color:C.red,fontSize:13,fontFamily:F,marginBottom:14}}>{err}</div>}
          <Btn onClick={handle} full disabled={loading}>{loading?"Signing in…":"Sign In →"}</Btn>
          <button onClick={onRegister} style={{width:"100%",background:"none",border:"none",color:C.blue,cursor:"pointer",fontSize:14,fontWeight:600,padding:"14px 0 0",fontFamily:F}}>New user? Create an Account →</button>
          <div style={{margin:"16px 0 0",background:C.bg,borderRadius:12,padding:"12px 14px"}}>
            <Label style={{margin:"0 0 7px"}}>Demo Accounts (password: nortkem123)</Label>
            {DEMO_USERS.map(u=>(
              <div key={u.id} onClick={()=>{setEmail(u.email);setPass("nortkem123");}} style={{cursor:"pointer",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{color:C.blue,fontSize:13,fontWeight:600,fontFamily:F}}>{u.email}</div>
                <div style={{color:C.textMuted,fontSize:11,fontFamily:F}}>{u.property}</div>
              </div>
            ))}
          </div>
        </Card>
        <p style={{textAlign:"center",color:C.textMuted,fontSize:12,marginTop:16,fontFamily:F}}>Powered by <strong style={{color:C.blue}}>NORTKEM</strong> · All values are industry estimates</p>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({user,setActive,chemicals,settings,linenTypes}) {
  const isMobile = useIsMobile();

  // ── Live calculations ──────────────────────────────────────
  const wRate    = settings?.waterCostPerL   ?? 0.02;
  const eRate    = settings?.energyCostPerKwh ?? 9.20;
  const rooms    = user.rooms || 150;
  const occ      = 72;
  const kgPerRoom= 7;
  const dailyKg  = rooms * (occ/100) * kgPerRoom;

  const nortkemCPK = (chemicals||[]).reduce((a,ch)=>a+(ch.doseML*(ch.costPerL||0))/1000,0);
  const marketCPK  = (chemicals||[]).reduce((a,ch)=>a+(ch.doseML*(ch.marketCostPerL??ch.costPerL??0))/1000,0);
  const ourCPK = nortkemCPK>0?nortkemCPK:1.80;
  const cpk    = marketCPK>0?marketCPK:2.60;
  const dailySave  = dailyKg*(cpk-ourCPK);
  const annualSave = dailySave*365;
  const waterSave  = dailyKg*52*wRate*0.18*365;
  const energySave = dailyKg*0.07*(eRate/1000)*0.18*365;
  const linenSave  = annualSave*0.30;
  const totalAnnual= annualSave+waterSave+energySave+linenSave;
  const pctSave    = cpk>0?Math.round((1-ourCPK/cpk)*100):0;
  const activeChems= (chemicals||[]).filter(c=>c.active).length;
  const compliantLT= (linenTypes||[]).filter(lt=>lt.tempC>=45).length;
  const compliancePct= linenTypes?.length>0?Math.round(compliantLT/linenTypes.length*100):0;

  // Deterministic monthly data (seed based on property name to stay stable)
  const seed = user.property?.charCodeAt(0)??65;
  const month = ["Jan","Feb","Mar","Apr","May","Jun"].map((m,i)=>({
    m,
    cost: Math.round(dailyKg*cpk*30*(0.88+((seed*i*7)%25)/100)),
    save: Math.round(dailySave*30*(0.85+((seed*i*3)%30)/100)),
  }));

  const kpis=[
    {l:"Chem Cost /kg",  v:`₱${ourCPK.toFixed(3)}`, d:`${pctSave}% below market`, up:true, c:C.blue,   i:"⚖️", bg:C.blueLight},
    {l:"Daily Linen",    v:`${dailyKg.toFixed(0)} kg`,d:`${rooms} rooms @ ${occ}%`, up:true, c:C.teal,   i:"🧺", bg:C.tealLight},
    {l:"Compliance",     v:`${compliancePct}%`,       d:`${compliantLT}/${linenTypes?.length||0} types`, up:compliancePct>=80, c:compliancePct>=80?C.green:C.orange, i:"✅", bg:C.greenLight},
    {l:"Annual Savings", v:`₱${(totalAnnual/1000).toFixed(1)}K`,d:`₱${dailySave.toFixed(0)}/day`, up:true, c:C.orange,i:"💰", bg:C.orangeLight},
  ];
  const pie=[{name:"Chemicals",value:28,color:C.blue},{name:"Water",value:22,color:C.teal},{name:"Energy",value:25,color:C.orange},{name:"Labor",value:15,color:C.purple},{name:"Linen",value:10,color:C.red}];
  const shortcuts=[{l:"Wash Formula",i:"🧪",tab:"formula",c:C.blue},{l:"Linen Types",i:"🧺",tab:"linen",c:C.purple},{l:"Chemicals",i:"🧴",tab:"chemicals",c:C.orange},{l:"Savings Report",i:"📈",tab:"savings",c:C.green}];
  return (
    <div>
      <SectionHead title={`Hello, ${user.name.split(" ")[0]} 👋`} subtitle={`${user.property} · ${user.rooms} rooms`}/>

      {/* KPI cards — 2 cols mobile, 4 cols desktop */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {kpis.map(k=>(
          <Card key={k.l} style={{padding:15}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <Label>{k.l}</Label>
                <div style={{color:C.text,fontSize:isMobile?22:24,fontWeight:800,fontFamily:F,lineHeight:1.1}}>{k.v}</div>
                <div style={{color:k.up?C.green:C.red,fontSize:12,fontWeight:600,marginTop:4,fontFamily:F}}>{k.up?"▲":"▼"} {k.d}</div>
              </div>
              <div style={{width:36,height:36,borderRadius:11,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{k.i}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts — stacked mobile, side-by-side desktop */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr",gap:14,marginBottom:16}}>
        <Card>
          <Label>Monthly Cost vs Savings (₱)</Label>
          <ResponsiveContainer width="100%" height={isMobile?165:220}>
            <AreaChart data={month}>
              <defs>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red} stopOpacity={0.15}/><stop offset="95%" stopColor={C.red} stopOpacity={0}/></linearGradient>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.2}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} vertical={false}/>
              <XAxis dataKey="m" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₱${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<TTip/>} formatter={v=>`₱${v.toLocaleString()}`}/>
              <Area type="monotone" dataKey="cost" name="Program Cost" stroke={C.red}   fill="url(#gC)" strokeWidth={2}/>
              <Area type="monotone" dataKey="save" name="Savings"      stroke={C.green} fill="url(#gS)" strokeWidth={2}/>
              <Legend wrapperStyle={{color:C.textMuted,fontSize:11}}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <Label>Cost Breakdown</Label>
          <ResponsiveContainer width="100%" height={isMobile?125:180}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" innerRadius={isMobile?30:38} outerRadius={isMobile?50:65} paddingAngle={3} dataKey="value">
                {pie.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<TTip/>} formatter={v=>`${v}%`}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:"5px 10px",marginTop:4}}>
            {pie.map(d=><div key={d.name} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:d.color}}/><span style={{color:C.textSub,fontSize:11,fontFamily:F}}>{d.name}</span></div>)}
          </div>
        </Card>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:isMobile?8:12,marginBottom:16}}>
        {[
          {v:`${Math.round(18)}%`,  l:"Water Saved",  c:C.teal,   i:"💧"},
          {v:`${Math.round(18)}%`,  l:"Energy Saved", c:C.orange, i:"⚡"},
          {v:`+${Math.round(25)}%`, l:"Linen Life",   c:C.green,  i:"🧺"},
          {v:`${compliancePct}%`,   l:"Compliance",   c:C.blue,   i:"✅"},
        ].map(s=>(
          <Card key={s.l} style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:30,height:30,borderRadius:9,background:`${s.c}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{s.i}</div>
            <div><div style={{color:C.textSub,fontSize:11,fontFamily:F}}>{s.l}</div><div style={{color:s.c,fontSize:16,fontWeight:800,fontFamily:F}}>{s.v}</div></div>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14,marginBottom:16}}>
        {/* Chemical cost summary live */}
        <Card>
          <Label>Chemical Cost Summary</Label>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{color:C.textMuted,fontSize:10,fontFamily:F,textTransform:"uppercase",fontWeight:700}}>NORTKEM /kg</div>
              <div style={{color:C.blue,fontSize:22,fontWeight:900,fontFamily:F}}>₱{ourCPK.toFixed(3)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:C.textMuted,fontSize:10,fontFamily:F,textTransform:"uppercase",fontWeight:700}}>Competitor /kg</div>
              <div style={{color:C.red,fontSize:22,fontWeight:900,fontFamily:F,textDecoration:"line-through",opacity:0.7}}>₱{cpk.toFixed(3)}</div>
            </div>
          </div>
          <div style={{background:C.bg,borderRadius:8,overflow:"hidden",height:8,marginBottom:6}}>
            <div style={{width:`${100-pctSave}%`,height:"100%",background:C.blue,borderRadius:8}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{color:C.green,fontSize:12,fontWeight:700,fontFamily:F}}>-{pctSave}% vs market</span>
            <span style={{color:C.textMuted,fontSize:11,fontFamily:F}}>{activeChems} active chemicals</span>
          </div>
        </Card>

        {/* Linen type compliance */}
        <Card>
          <Label>Linen Type Status</Label>
          {(linenTypes||[]).slice(0,4).map(lt=>{
            const ok = lt.tempC>=45;
            return (
              <div key={lt.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:15,width:22,textAlign:"center"}}>{lt.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontSize:12,fontWeight:600,fontFamily:F}}>{lt.name}</div>
                  <div style={{color:C.textMuted,fontSize:10,fontFamily:F}}>{lt.tempC}°C · {lt.cycleMin} min</div>
                </div>
                <div style={{background:ok?C.greenLight:C.orangeLight,color:ok?C.green:C.orange,fontSize:9,fontWeight:700,borderRadius:6,padding:"2px 7px",fontFamily:F}}>
                  {ok?"✓ OK":"⚠ CHECK"}
                </div>
              </div>
            );
          })}
          {(linenTypes||[]).length>4&&<div style={{color:C.blue,fontSize:12,fontWeight:600,fontFamily:F,textAlign:"center",marginTop:4,cursor:"pointer"}} onClick={()=>setActive("linen")}>+{linenTypes.length-4} more →</div>}
        </Card>
      </div>

      <Label>Quick Access</Label>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {shortcuts.map(s=>(
          <button key={s.tab} onClick={()=>setActive(s.tab)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px 12px",cursor:"pointer",textAlign:"left",boxShadow:C.shadow,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${s.c}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{s.i}</div>
            <span style={{color:C.text,fontSize:13,fontWeight:600,fontFamily:F}}>{s.l}</span>
          </button>
        ))}
      </div>

      {/* Savings highlight banner */}
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,borderRadius:16,padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F,marginBottom:3}}>Estimated Annual Savings</div>
          <div style={{color:"#fff",fontSize:28,fontWeight:900,fontFamily:F,letterSpacing:"-0.03em"}}>₱{(totalAnnual/1000).toFixed(1)}K</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,fontFamily:F,marginTop:2}}>for {user.property}</div>
        </div>
        <button onClick={()=>setActive("savings")}
          style={{background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",color:"#fff",borderRadius:12,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F,backdropFilter:"blur(8px)"}}>
          View Full Report →
        </button>
      </div>
    </div>
  );
}

// ─── CHEMICAL MANAGER ────────────────────────────────────────
function Chemicals({chemicals,setChemicals,onSave,onReset}) {
  const [view,     setView]     = useState("list");
  const [selType,  setSelType]  = useState("alkali");
  const [editingId,setEditingId]= useState(null); // which card is open for editing
  const [editVals, setEditVals] = useState({});   // temp edit values
  const [saveMsg,  setSaveMsg]  = useState("");   // "Saved!" feedback

  const [form,setForm]=useState({name:"",type:"alkali",doseML:5,costPerL:300,stock:50,color:C.blue,active:true});
  const upd=k=>v=>setForm(f=>({...f,[k]:v}));
  const typeInfo=CHEMICAL_TYPES.find(t=>t.key===form.type)||CHEMICAL_TYPES[0];

  const save=()=>{
    if(!form.name.trim()) return;
    setChemicals(c=>[...c,{...form,id:Date.now(),key:form.type}]);
    setView("list");
    setForm({name:"",type:"alkali",doseML:5,costPerL:300,stock:50,color:C.blue,active:true});
  };
  const del   =id=>{ setChemicals(c=>c.filter(x=>x.id!==id)); if(editingId===id) setEditingId(null); };
  const toggle=id=>setChemicals(c=>c.map(x=>x.id===id?{...x,active:!x.active}:x));
  const update=(id,field,val)=>setChemicals(c=>c.map(x=>x.id===id?{...x,[field]:val}:x));

  const startEdit=(ch)=>{
    setEditingId(ch.id);
    setEditVals({name:ch.name, costPerL:ch.costPerL, marketCostPerL:ch.marketCostPerL??0, doseML:ch.doseML, stock:ch.stock});
  };
  const saveEdit=(id)=>{
    setChemicals(c=>c.map(x=>x.id===id?{...x,...editVals}:x));
    setEditingId(null);
  };
  const cancelEdit=()=>setEditingId(null);

  const typeChemicals=chemicals.filter(ch=>ch.key===selType||ch.type===selType);

  // ── ADD FORM ─────────────────────────────────────────────────
  if(view==="add") return (
    <div>
      <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:C.blue,fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:18,fontFamily:F,padding:0}}>‹ Chemicals</button>
      <SectionHead title="Add Chemical" subtitle="Register a new chemical product"/>
      <Card>
        <Input label="Product Name" value={form.name} onChange={upd("name")} type="text" placeholder="e.g. Nortkem Pro Detergent"/>
        <div style={{marginBottom:14}}>
          <Label>Chemical Type</Label>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {CHEMICAL_TYPES.map(t=>(
              <button key={t.key} onClick={()=>{upd("type")(t.key);upd("color")(t.color);upd("doseML")(t.defaultDose);}} style={{padding:"7px 11px",borderRadius:10,border:`1.5px solid ${form.type===t.key?t.color:C.border}`,background:form.type===t.key?`${t.color}15`:C.bg,color:form.type===t.key?t.color:C.textSub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",gap:6}}>
                {t.icon} {t.name.split("/")[0]}
              </button>
            ))}
          </div>
        </div>
        {typeInfo&&<Tip color={typeInfo.color} text={typeInfo.desc}/>}
        <div style={{height:16}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Input label="Default Dose (mL/kg)" value={form.doseML}   onChange={upd("doseML")}   min={0.5} max={30} step={0.5} suffix="mL/kg" small note={`Range: ${typeInfo.minDose}–${typeInfo.maxDose} mL/kg`}/>
          <Input label="Cost (₱/L)"           value={form.costPerL} onChange={upd("costPerL")} min={1}   max={9999} step={1}  prefix="₱"     small/>
          <div style={{gridColumn:"1/-1"}}><Input label="Current Stock (L)" value={form.stock} onChange={upd("stock")} min={0} max={10000} suffix="L" small/></div>
        </div>
        <Btn onClick={save} full>Save Chemical</Btn>
      </Card>
    </div>
  );

  // ── LIST ──────────────────────────────────────────────────────
  return (
    <div>
      <SectionHead title="Chemical Products" subtitle={`${chemicals.filter(c=>c.active).length} active / ${chemicals.length} total`} action={<Btn onClick={()=>setView("add")} small>+ Add</Btn>}/>

      {/* Save / Reset bar */}
      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
        <button onClick={async()=>{
            if(onSave){ await onSave(chemicals); setSaveMsg("✅ Saved!"); setTimeout(()=>setSaveMsg(""),2500); }
          }}
          style={{flex:1,padding:"11px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          💾 Save Settings
        </button>
        <button onClick={async()=>{ if(onReset){ await onReset(); setSaveMsg("↩️ Reset to defaults"); setTimeout(()=>setSaveMsg(""),2500); } }}
          style={{flex:1,padding:"11px 0",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.card,color:C.red,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          ↩️ Reset Defaults
        </button>
      </div>
      {saveMsg&&(
        <div style={{background:saveMsg.startsWith("✅")?C.greenLight:C.orangeLight,borderRadius:10,padding:"9px 14px",marginBottom:12,textAlign:"center",color:saveMsg.startsWith("✅")?C.green:C.orange,fontSize:13,fontWeight:700,fontFamily:F}}>
          {saveMsg}
        </div>
      )}

      {/* Type filter strip */}
      <div style={{marginBottom:14}}>
        <Label>Filter by Type</Label>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {CHEMICAL_TYPES.map(t=>{
            const cnt=chemicals.filter(c=>c.key===t.key||c.type===t.key).length;
            return (
              <button key={t.key} onClick={()=>setSelType(t.key)} style={{flexShrink:0,padding:"7px 13px",borderRadius:10,border:`1.5px solid ${selType===t.key?t.color:C.border}`,background:selType===t.key?`${t.color}15`:C.bg,color:selType===t.key?t.color:C.textSub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",gap:5}}>
                {t.icon} {t.name.split("/")[0]} {cnt>0&&<span style={{background:t.color,color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10}}>{cnt}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type info card */}
      {(()=>{ const ti=CHEMICAL_TYPES.find(t=>t.key===selType); return ti ? (
        <Card style={{marginBottom:14,background:`${ti.color}10`,border:`1px solid ${ti.color}25`}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:24}}>{ti.icon}</span>
            <div>
              <div style={{color:C.text,fontWeight:700,fontSize:14,fontFamily:F,marginBottom:4}}>{ti.name}</div>
              <div style={{color:C.textSub,fontSize:12,fontFamily:F,lineHeight:1.55}}>{ti.desc}</div>
              <div style={{marginTop:7}}><Badge label={`Industry dose: ${ti.minDose}–${ti.maxDose} mL/kg`} color={ti.color}/></div>
            </div>
          </div>
        </Card>
      ) : null; })()}

      {typeChemicals.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.textMuted,fontFamily:F}}>No {selType} products yet. Tap + Add to register one.</div>}

      {typeChemicals.map(ch=>{
        const ti       = CHEMICAL_TYPES.find(t=>t.key===ch.key||t.key===ch.type);
        const isEditing= editingId===ch.id;
        const ev       = editVals;
        const accentCol= ch.color||ti?.color||C.blue;

        return (
          <Card key={ch.id} style={{marginBottom:12,opacity:ch.active?1:0.6,border:isEditing?`1.5px solid ${C.blue}`:undefined}}>

            {/* ── Header row ── */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:`${accentCol}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>{ti?.icon||"🧴"}</div>
                <div>
                  {isEditing ? (
                    <input value={ev.name} onChange={e=>setEditVals(v=>({...v,name:e.target.value}))}
                      style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:F,background:C.bg,border:`1.5px solid ${C.blue}`,borderRadius:9,padding:"5px 10px",outline:"none",width:"100%"}}/>
                  ) : (
                    <div style={{color:C.text,fontWeight:700,fontSize:14,fontFamily:F}}>{ch.name}</div>
                  )}
                  <div style={{color:C.textSub,fontSize:12,fontFamily:F,marginTop:2}}>{ti?.name}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
                {isEditing ? (
                  <>
                    <button onClick={()=>saveEdit(ch.id)} style={{background:C.blue,border:"none",color:"#fff",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>Save</button>
                    <button onClick={cancelEdit} style={{background:C.bg,border:`1px solid ${C.border}`,color:C.textSub,borderRadius:10,padding:"6px 10px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={()=>startEdit(ch)} style={{background:C.blueLight,border:`1px solid ${C.blue}25`,color:C.blue,borderRadius:10,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F}}>✏️ Edit</button>
                    <button onClick={()=>toggle(ch.id)} style={{background:ch.active?C.greenLight:C.bg,border:`1px solid ${ch.active?C.green:C.border}`,color:ch.active?C.green:C.textMuted,borderRadius:10,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F}}>{ch.active?"Active":"Off"}</button>
                    <button onClick={()=>del(ch.id)} style={{background:C.redLight,border:"none",color:C.red,width:28,height:28,borderRadius:9,cursor:"pointer",fontSize:14,fontWeight:700}}>×</button>
                  </>
                )}
              </div>
            </div>

            {/* ── Editable fields ── */}
            {isEditing ? (
              <div>
                {/* Row 1: Nortkem price + Market price */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:9}}>
                  {/* Nortkem Price */}
                  <div style={{background:`${C.blue}08`,borderRadius:12,padding:"11px 13px",border:`1.5px solid ${C.blue}35`}}>
                    <div style={{color:C.blue,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F,marginBottom:5}}>NORTKEM ₱/L</div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{color:C.blue,fontSize:13,fontWeight:700,fontFamily:F}}>₱</span>
                      <input type="number" value={ev.costPerL} min={1} max={9999} step={1}
                        onChange={e=>setEditVals(v=>({...v,costPerL:Number(e.target.value)}))}
                        style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:17,fontWeight:800,fontFamily:F,width:"100%",minWidth:0}}/>
                    </div>
                    <div style={{color:C.blue,fontSize:9,fontFamily:F,marginTop:3}}>Your selling price</div>
                  </div>
                  {/* Competitor Price */}
                  <div style={{background:`${C.red}08`,borderRadius:12,padding:"11px 13px",border:`1.5px solid ${C.red}35`}}>
                    <div style={{color:C.red,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F,marginBottom:5}}>COMPETITOR ₱/L</div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{color:C.red,fontSize:13,fontWeight:700,fontFamily:F}}>₱</span>
                      <input type="number" value={ev.marketCostPerL} min={1} max={9999} step={1}
                        onChange={e=>setEditVals(v=>({...v,marketCostPerL:Number(e.target.value)}))}
                        style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:17,fontWeight:800,fontFamily:F,width:"100%",minWidth:0}}/>
                    </div>
                    <div style={{color:C.red,fontSize:9,fontFamily:F,marginTop:3}}>Market / other brand</div>
                  </div>
                </div>
                {/* Row 2: dose + stock */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                  <div style={{background:C.bg,borderRadius:12,padding:"10px 12px",border:`1.5px solid ${accentCol}40`}}>
                    <div style={{color:accentCol,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F,marginBottom:5}}>Dose mL/kg</div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <input type="number" value={ev.doseML} min={0.5} max={30} step={0.5}
                        onChange={e=>setEditVals(v=>({...v,doseML:Number(e.target.value)}))}
                        style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:16,fontWeight:800,fontFamily:F,width:"100%",minWidth:0}}/>
                      <span style={{color:C.textMuted,fontSize:10,fontFamily:F}}>mL</span>
                    </div>
                  </div>
                  <div style={{background:C.bg,borderRadius:12,padding:"10px 12px",border:`1.5px solid ${C.green}40`}}>
                    <div style={{color:C.green,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F,marginBottom:5}}>Stock L</div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <input type="number" value={ev.stock} min={0} max={99999} step={1}
                        onChange={e=>setEditVals(v=>({...v,stock:Number(e.target.value)}))}
                        style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:16,fontWeight:800,fontFamily:F,width:"100%",minWidth:0}}/>
                      <span style={{color:C.textMuted,fontSize:10,fontFamily:F}}>L</span>
                    </div>
                  </div>
                </div>
                {/* Savings preview */}
                {ev.marketCostPerL > 0 && ev.costPerL > 0 && (
                  <div style={{marginTop:9,background:`${C.green}10`,border:`1px solid ${C.green}25`,borderRadius:10,padding:"9px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:C.green,fontSize:12,fontWeight:700,fontFamily:F}}>💰 Savings vs competitor</span>
                    <span style={{color:C.green,fontSize:13,fontWeight:800,fontFamily:F}}>
                      ₱{(ev.marketCostPerL - ev.costPerL).toFixed(0)}/L · {Math.round((1 - ev.costPerL/ev.marketCostPerL)*100)}% less
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* ── Read-only view ── */
              <div>
                {/* Price comparison row */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:9}}>
                  <div style={{background:`${C.blue}08`,borderRadius:11,padding:"9px 12px",cursor:"pointer",border:`1px solid ${C.blue}20`}} onClick={()=>startEdit(ch)}>
                    <div style={{color:C.blue,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F}}>NORTKEM</div>
                    <div style={{color:C.blue,fontSize:18,fontWeight:800,fontFamily:F,marginTop:2}}>₱{ch.costPerL}<span style={{fontSize:11,fontWeight:500}}>/L</span></div>
                  </div>
                  <div style={{background:`${C.red}08`,borderRadius:11,padding:"9px 12px",cursor:"pointer",border:`1px solid ${C.red}20`}} onClick={()=>startEdit(ch)}>
                    <div style={{color:C.red,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F}}>COMPETITOR</div>
                    <div style={{color:C.red,fontSize:18,fontWeight:800,fontFamily:F,marginTop:2}}>₱{ch.marketCostPerL??0}<span style={{fontSize:11,fontWeight:500}}>/L</span></div>
                  </div>
                </div>
                {/* Savings + dose + stock badges */}
                <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:9}}>
                  <div style={{background:`${accentCol}12`,borderRadius:20,padding:"5px 11px"}}>
                    <span style={{color:accentCol,fontSize:12,fontWeight:700,fontFamily:F}}>{ch.doseML} mL/kg</span>
                  </div>
                  <div style={{background:`${ch.stock>20?C.green:ch.stock>5?C.orange:C.red}12`,borderRadius:20,padding:"5px 11px"}}>
                    <span style={{color:ch.stock>20?C.green:ch.stock>5?C.orange:C.red,fontSize:12,fontWeight:700,fontFamily:F}}>Stock: {ch.stock} L</span>
                  </div>
                  {(ch.marketCostPerL??0) > ch.costPerL && (
                    <div style={{background:`${C.green}12`,borderRadius:20,padding:"5px 11px"}}>
                      <span style={{color:C.green,fontSize:12,fontWeight:700,fontFamily:F}}>
                        -{Math.round((1-ch.costPerL/(ch.marketCostPerL??ch.costPerL))*100)}% vs market
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cost preview line */}
            {!isEditing && (
              <div style={{marginTop:10,padding:"8px 12px",background:C.bg,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:C.textMuted,fontSize:11,fontFamily:F}}>Cost at {ch.doseML} mL/kg</span>
                <span style={{color:C.text,fontSize:12,fontWeight:700,fontFamily:F}}>
                  ₱{((ch.doseML * ch.costPerL) / 1000).toFixed(3)}/kg linen
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── LINEN TYPES MANAGER ─────────────────────────────────────
function LinenTypes({linenTypes,setLinenTypes,chemicals}) {
  const [sel,setSel]=useState(null);
  const [editing,setEditing]=useState(false);
  const [newL,setNewL]=useState(null);
  const [ltMsg,setLtMsg]=useState("");
  const ICONS=["🛏️","🏨","🎨","🏥","💤","🍽️","🧦","👔","🧣","🪭","🧻","🩺"];
  const COLORS=[C.blue,C.teal,C.purple,C.red,C.orange,C.green,"#FF2D55","#AF52DE"];
  const toast=(m)=>{setLtMsg(m);setTimeout(()=>setLtMsg(""),2500);};
  const startNew=()=>{ const fresh={id:Date.now(),name:"",icon:"🧺",color:C.blue,fabric:"Cotton",tempC:60,cycleMin:40,pH:7.0,rewashTarget:2,chemicals:{alkali:5,detergent:8,chlorine:0,oxygen:3,enzyme:0,sour:2,softener:2,starch:0,emulsifier:0},steps:[],notes:""}; setNewL(fresh);setSel(null);setEditing(false); };
  const saveNew=()=>{ if(!newL.name.trim()) return; setLinenTypes(p=>[...p,newL]); setNewL(null); toast("✅ Linen type saved!"); };
  const delType=id=>{setLinenTypes(p=>p.filter(x=>x.id!==id));setSel(null);toast("🗑️ Linen type deleted");};
  const updType=(id,field,val)=>setLinenTypes(p=>p.map(x=>x.id===id?{...x,[field]:val}:x));
  const updChem=(id,key,val)=>setLinenTypes(p=>p.map(x=>x.id===id?{...x,chemicals:{...x.chemicals,[key]:val}}:x));

  if(newL) return (
    <div>
      <button onClick={()=>setNewL(null)} style={{background:"none",border:"none",color:C.blue,fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:18,fontFamily:F,padding:0}}>‹ Linen Types</button>
      <SectionHead title="New Linen Type"/>
      <Card style={{marginBottom:14}}>
        <Input label="Linen Name" value={newL.name} onChange={v=>setNewL(l=>({...l,name:v}))} type="text" placeholder="e.g. Gym Towels"/>
        <div style={{marginBottom:12}}>
          <Label>Icon</Label>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {ICONS.map(ic=><button key={ic} onClick={()=>setNewL(l=>({...l,icon:ic}))} style={{width:34,height:34,borderRadius:9,border:`2px solid ${newL.icon===ic?C.blue:C.border}`,background:newL.icon===ic?C.blueLight:C.bg,cursor:"pointer",fontSize:17}}>{ic}</button>)}
          </div>
        </div>
        <Input label="Fabric Type" value={newL.fabric} onChange={v=>setNewL(l=>({...l,fabric:v}))} type="text" placeholder="Cotton, Polyester, etc."/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Input label="Wash Temp (°C)" value={newL.tempC}    onChange={v=>setNewL(l=>({...l,tempC:v}))}    min={20} max={95} suffix="°C"  small/>
          <Input label="Cycle Time"     value={newL.cycleMin} onChange={v=>setNewL(l=>({...l,cycleMin:v}))} min={15} max={90} suffix="min" small/>
          <Input label="Target pH"      value={newL.pH}       onChange={v=>setNewL(l=>({...l,pH:v}))}       min={4}  max={11} step={0.1}   small/>
          <Input label="Rewash Target"  value={newL.rewashTarget} onChange={v=>setNewL(l=>({...l,rewashTarget:v}))} min={0.5} max={15} step={0.5} suffix="%" small/>
        </div>
      </Card>
      <Card style={{marginBottom:14}}>
        <Label>Chemical Dosing (mL/kg)</Label>
        {CHEMICAL_TYPES.map(t=>(
          <div key={t.key} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <span style={{fontSize:16,width:24,textAlign:"center"}}>{t.icon}</span>
            <span style={{color:C.textSub,fontSize:13,fontFamily:F,flex:1}}>{t.name.split("/")[0]}</span>
            <div style={{width:110}}>
              <input type="number" value={newL.chemicals[t.key]||0} min={0} max={30} step={0.5}
                onChange={e=>setNewL(l=>({...l,chemicals:{...l.chemicals,[t.key]:Number(e.target.value)}}))}
                style={{width:"100%",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:9,padding:"8px 10px",color:C.text,fontSize:13,fontFamily:F,outline:"none",textAlign:"right"}}/>
            </div>
            <span style={{color:C.textMuted,fontSize:11,fontFamily:F,width:40}}>mL/kg</span>
          </div>
        ))}
      </Card>
      <Btn onClick={saveNew} full disabled={!newL.name.trim()}>Save Linen Type</Btn>
    </div>
  );

  if(sel) {
    const lt=linenTypes.find(x=>x.id===sel);
    if(!lt){setSel(null);return null;}
    const totalDose=Object.values(lt.chemicals||{}).reduce((a,b)=>a+(b||0),0);
    return (
      <div>
        <button onClick={()=>{setSel(null);setEditing(false);}} style={{background:"none",border:"none",color:C.blue,fontSize:15,fontWeight:600,cursor:"pointer",marginBottom:18,fontFamily:F,padding:0}}>‹ Linen Types</button>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
          <div style={{width:54,height:54,borderRadius:16,background:`${lt.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{lt.icon}</div>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontSize:20,fontWeight:800,fontFamily:F}}>{lt.name}</div>
            <div style={{color:C.textSub,fontSize:13,fontFamily:F}}>{lt.fabric}</div>
          </div>
          <button onClick={()=>setEditing(v=>!v)} style={{background:editing?C.blueLight:C.bg,border:`1.5px solid ${editing?C.blue:C.border}`,color:editing?C.blue:C.textSub,borderRadius:11,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>{editing?"Done":"Edit"}</button>
        </div>
        <Card style={{marginBottom:14}}>
          <Label>Wash Parameters</Label>
          {editing ? (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Input label="Temp (°C)" value={lt.tempC}    onChange={v=>updType(sel,"tempC",v)}    min={20} max={95} suffix="°C"  small/>
              <Input label="Cycle (min)"value={lt.cycleMin}onChange={v=>updType(sel,"cycleMin",v)} min={15} max={90} suffix="min" small/>
              <Input label="pH"         value={lt.pH}      onChange={v=>updType(sel,"pH",v)}       min={4}  max={11} step={0.1}   small/>
              <Input label="Rewash %"   value={lt.rewashTarget} onChange={v=>updType(sel,"rewashTarget",v)} min={0.5} max={15} step={0.5} suffix="%" small/>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <StatCard label="Wash Temp" value={`${lt.tempC}°C`} color={lt.tempC>=60?C.green:lt.tempC>=45?C.orange:C.red} icon="🌡️"/>
              <StatCard label="Cycle Time" value={`${lt.cycleMin} min`} color={C.blue} icon="⏱️"/>
              <StatCard label="Target pH" value={lt.pH} color={(lt.pH>=6.5&&lt.pH<=8.0)?C.green:C.red} icon="🧪"/>
              <StatCard label="Rewash Target" value={`≤${lt.rewashTarget}%`} color={C.purple} icon="🔄"/>
            </div>
          )}
        </Card>
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <Label style={{margin:0}}>Chemical Dosing</Label>
            <Badge label={`Total: ${totalDose.toFixed(1)} mL/kg`} color={C.blue}/>
          </div>
          {CHEMICAL_TYPES.map(t=>{
            const dose=lt.chemicals?.[t.key]||0;
            if(!editing&&dose===0) return null;
            return (
              <div key={t.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:editing?12:10}}>
                <span style={{fontSize:15,width:22,textAlign:"center"}}>{t.icon}</span>
                <span style={{color:C.textSub,fontSize:12,fontFamily:F,flex:1}}>{t.name.split("/")[0]}</span>
                {editing ? (
                  <div style={{width:95}}>
                    <input type="number" value={dose} min={0} max={30} step={0.5} onChange={e=>updChem(sel,t.key,Number(e.target.value))}
                      style={{width:"100%",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:9,padding:"7px 10px",color:C.text,fontSize:13,fontFamily:F,outline:"none",textAlign:"right"}}/>
                  </div>
                ) : (
                  <>
                    <div style={{width:90,background:C.bg,borderRadius:5,height:7,overflow:"hidden"}}>
                      <div style={{width:`${Math.min((dose/20)*100,100)}%`,height:"100%",background:t.color,borderRadius:5}}/>
                    </div>
                    <span style={{color:t.color,fontSize:12,fontWeight:700,fontFamily:F,width:58,textAlign:"right"}}>{dose>0?`${dose} mL/kg`:"—"}</span>
                  </>
                )}
              </div>
            );
          })}
        </Card>
        {/* ─── WASH CYCLE STEPS ─────────────────────────── */}
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <Label style={{marginBottom:0}}>Wash Cycle Steps</Label>
            <button onClick={()=>{
              const blank={name:"New Step",tempC:40,min:5,chemicals:[]};
              updType(lt.id,"steps",[...(lt.steps||[]),blank]);
            }} style={{background:C.blue,border:"none",color:"#fff",borderRadius:10,padding:"6px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>+ Add Step</button>
          </div>

          {(!lt.steps||lt.steps.length===0)&&(
            <div style={{textAlign:"center",padding:"20px 0",color:C.textMuted,fontFamily:F,fontSize:13}}>No steps yet. Tap + Add Step to build your wash cycle.</div>
          )}

          {(lt.steps||[]).map((step,i)=>{
            const steps=lt.steps;
            const updStep=(field,val)=>{
              const next=steps.map((s,j)=>j===i?{...s,[field]:val}:s);
              updType(lt.id,"steps",next);
            };
            const delStep=()=>updType(lt.id,"steps",steps.filter((_,j)=>j!==i));
            const moveUp=()=>{
              if(i===0) return;
              const next=[...steps];
              [next[i-1],next[i]]=[next[i],next[i-1]];
              updType(lt.id,"steps",next);
            };
            const moveDown=()=>{
              if(i===steps.length-1) return;
              const next=[...steps];
              [next[i],next[i+1]]=[next[i+1],next[i]];
              updType(lt.id,"steps",next);
            };
            const toggleChem=(key)=>{
              const cur=step.chemicals||[];
              const next=cur.includes(key)?cur.filter(k=>k!==key):[...cur,key];
              updStep("chemicals",next);
            };

            return (
              <div key={i} style={{marginBottom:12,background:C.bg,borderRadius:14,padding:"12px 14px",border:`1.5px solid ${C.border}`}}>
                {/* Step header: number + name input + move + delete */}
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",color:C.blue,fontSize:11,fontWeight:800,fontFamily:F,flexShrink:0}}>{i+1}</div>
                  <input
                    value={step.name}
                    onChange={e=>updStep("name",e.target.value)}
                    placeholder="Step name"
                    style={{flex:1,background:C.card,border:`1.5px solid ${C.border}`,borderRadius:9,padding:"7px 11px",color:C.text,fontSize:13,fontWeight:700,fontFamily:F,outline:"none",minWidth:0}}
                  />
                  {/* Up/down */}
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <button onClick={moveUp} disabled={i===0} style={{background:i===0?C.bg:C.blueLight,border:"none",color:i===0?C.textMuted:C.blue,width:22,height:20,borderRadius:5,cursor:i===0?"default":"pointer",fontSize:10,fontWeight:700,lineHeight:1}}>▲</button>
                    <button onClick={moveDown} disabled={i===steps.length-1} style={{background:i===steps.length-1?C.bg:C.blueLight,border:"none",color:i===steps.length-1?C.textMuted:C.blue,width:22,height:20,borderRadius:5,cursor:i===steps.length-1?"default":"pointer",fontSize:10,fontWeight:700,lineHeight:1}}>▼</button>
                  </div>
                  <button onClick={delStep} style={{background:C.redLight,border:"none",color:C.red,width:28,height:28,borderRadius:9,cursor:"pointer",fontSize:14,fontWeight:800,flexShrink:0}}>×</button>
                </div>

                {/* Temp + Time */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div style={{background:C.card,borderRadius:10,padding:"9px 12px",border:`1px solid ${C.border}`}}>
                    <div style={{color:C.orange,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F,marginBottom:4}}>Temperature</div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <input type="number" value={step.tempC} min={15} max={95} step={1}
                        onChange={e=>updStep("tempC",Number(e.target.value))}
                        style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:16,fontWeight:800,fontFamily:F,minWidth:0}}/>
                      <span style={{color:C.orange,fontSize:12,fontWeight:700,fontFamily:F}}>°C</span>
                    </div>
                  </div>
                  <div style={{background:C.card,borderRadius:10,padding:"9px 12px",border:`1px solid ${C.border}`}}>
                    <div style={{color:C.blue,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F,marginBottom:4}}>Duration</div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <input type="number" value={step.min} min={1} max={90} step={1}
                        onChange={e=>updStep("min",Number(e.target.value))}
                        style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:16,fontWeight:800,fontFamily:F,minWidth:0}}/>
                      <span style={{color:C.blue,fontSize:12,fontWeight:700,fontFamily:F}}>min</span>
                    </div>
                  </div>
                </div>

                {/* Chemicals toggles */}
                <div style={{color:C.textMuted,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:F,marginBottom:7}}>Chemicals used in this step</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {CHEMICAL_TYPES.map(t=>{
                    const on=(step.chemicals||[]).includes(t.key);
                    return (
                      <button key={t.key} onClick={()=>toggleChem(t.key)}
                        style={{padding:"5px 10px",borderRadius:20,border:`1.5px solid ${on?t.color:C.border}`,background:on?`${t.color}18`:C.bg,color:on?t.color:C.textMuted,fontSize:11,fontWeight:on?700:500,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",gap:4,transition:"all 0.15s"}}>
                        {t.icon} {t.name.split("/")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Total cycle time summary */}
          {lt.steps&&lt.steps.length>0&&(
            <div style={{marginTop:6,padding:"9px 14px",background:C.blueLight,borderRadius:11,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.blue,fontSize:12,fontWeight:600,fontFamily:F}}>Total cycle time</span>
              <span style={{color:C.blue,fontSize:14,fontWeight:800,fontFamily:F}}>
                {lt.steps.reduce((a,s)=>a+s.min,0)} min · {lt.steps.length} steps
              </span>
            </div>
          )}
        </Card>
        {lt.notes&&<Tip text={lt.notes} color={lt.color}/>}
        <div style={{height:14}}/>
        <button onClick={()=>delType(lt.id)} style={{width:"100%",padding:13,borderRadius:14,border:"none",background:C.redLight,color:C.red,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F}}>Delete This Linen Type</button>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title="Linen Types" subtitle={`${linenTypes.length} types · Ecolab-verified parameters`} action={<Btn onClick={startNew} small>+ New Type</Btn>}/>
      {ltMsg&&<div style={{background:ltMsg.startsWith("✅")?C.greenLight:C.orangeLight,borderRadius:10,padding:"9px 14px",marginBottom:12,textAlign:"center",color:ltMsg.startsWith("✅")?C.green:C.orange,fontSize:13,fontWeight:700,fontFamily:F}}>{ltMsg}</div>}
      <Tip color={C.blue} text="Parameters verified against Ecolab Aquanomic, TRSA guidelines, and Hospitality.Institute data. Tap any linen type to view full formula and edit parameters."/>
      <div style={{height:14}}/>
      {linenTypes.map(lt=>(
        <Card key={lt.id} style={{marginBottom:10,cursor:"pointer",overflow:"hidden",position:"relative"}} onClick={()=>setSel(lt.id)}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:lt.color,borderRadius:"18px 18px 0 0"}}/>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:`${lt.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{lt.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:C.text,fontWeight:700,fontSize:14,fontFamily:F}}>{lt.name}</div>
              <div style={{color:C.textSub,fontSize:12,fontFamily:F,marginTop:2}}>{lt.fabric}</div>
              <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                <Badge label={`${lt.tempC}°C`} color={lt.tempC>=60?C.green:lt.tempC>=45?C.orange:C.red}/>
                <Badge label={`${lt.cycleMin} min`} color={C.blue}/>
                <Badge label={`pH ${lt.pH}`} color={C.teal}/>
                <Badge label={`Rewash ≤${lt.rewashTarget}%`} color={C.purple}/>
              </div>
            </div>
            <span style={{color:C.textMuted,fontSize:18}}>›</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── WASH ENGINE (Sinner's Circle) ───────────────────────────
// Source: Sinner (1959), Ecolab Aquanomic, TRSA, CDC, PMC, ScienceDirect 2024
// Chemistry 35% | Temperature 30% | Time 20% | Mechanical 15%
const toF = c => Math.round(c * 9/5 + 32);
const toC = f => Math.round((f - 32) * 5/9);

const WASH_ENGINE = {
  detScore(d) {
    if (d === 0)   return 5;
    if (d < 2)     return 22;
    if (d < 4)     return 46;
    if (d < 6)     return 62;
    if (d < 8)     return 76;
    if (d < 10)    return 88;
    if (d < 12)    return 94;
    return 98;
  },
  simulate(doses, tempC, timeMin, lt) {
    const det      = doses.detergent  || 0;
    const alkali   = doses.alkali     || 0;
    const chlorine = doses.chlorine   || 0;
    const oxygen   = doses.oxygen     || 0;
    const enzyme   = doses.enzyme     || 0;
    const sour     = doses.sour       || 0;
    const softener = doses.softener   || 0;
    const starch   = doses.starch     || 0;
    const emulsif  = doses.emulsifier || 0;

    // ── CHEMISTRY (35%) ──────────────────────────────────────
    const detS   = this.detScore(det);
    const alkS   = alkali >= 4 ? 90 : alkali >= 2 ? 72 : alkali >= 1 ? 52 : 20;
    const bleachS = Math.max((chlorine||0)>=2?80:(chlorine||0)>=1?60:0, (oxygen||0)>=2?70:(oxygen||0)>=1?52:0);
    const enzS   = enzyme >= 2 ? 85 : enzyme >= 1 ? 65 : 20;
    const chem   = detS * 0.50 + alkS * 0.24 + bleachS * 0.16 + enzS * 0.10;

    // ── TEMPERATURE (30%) ────────────────────────────────────
    const tRatio  = Math.min(tempC / lt.tempC, 1.15);
    const tScore  = Math.min(98, tRatio * 80 + (tempC >= 60 ? 14 : tempC >= 50 ? 8 : tempC >= 40 ? 4 : 0));
    const temp    = tScore;

    // ── TIME (20%) ───────────────────────────────────────────
    const tFrac   = timeMin / lt.cycleMin;
    const time    = tFrac >= 1.0 ? 95 : tFrac >= 0.85 ? 82 : tFrac >= 0.7 ? 65 : tFrac >= 0.55 ? 48 : tFrac >= 0.4 ? 32 : 18;

    // ── MECHANICAL (15%) ─────────────────────────────────────
    const mech    = 78; // fixed commercial washer-extractor

    // ── STAIN REMOVAL ────────────────────────────────────────
    let clean = Math.round(
      chem * 0.35 + temp * 0.30 + time * 0.20 + mech * 0.15
    );
    if (det === 0)   clean = Math.min(28, clean);
    else if (det < 2) clean = Math.min(50, clean);
    else if (det < 3.5) clean = Math.min(72, clean);

    // ── HYGIENE / THERMAL KILL ───────────────────────────────
    const thermalKill = tempC >= 71 ? 96 : tempC >= 65 ? 88 : tempC >= 60 ? 80
      : tempC >= 50 ? 62 : tempC >= 45 ? 48 : tempC >= 38 ? 32 : 18;
    const bleachBoost  = (chlorine>=3?10:chlorine>=1?6:0) + (oxygen>=3?8:oxygen>=1?4:0);
    const detBoostH    = det >= 6 ? 5 : det >= 3 ? 3 : 0;
    const timeBoostH   = timeMin >= lt.cycleMin * 0.85 ? 4 : timeMin >= lt.cycleMin * 0.6 ? 2 : 0;
    let hygiene = Math.round(Math.min(98, thermalKill + bleachBoost + detBoostH + timeBoostH));
    const isHosp = lt.id === 4 || ["Hospital","Medical","Clinic"].some(k => lt.name.includes(k));
    if (isHosp && tempC < 60) hygiene = Math.min(hygiene, 28);

    // ── COLOR / WHITENESS ────────────────────────────────────
    const isColored = lt.id === 3 || lt.name.toLowerCase().includes("color") || lt.name.toLowerCase().includes("colour");
    const isSilk    = lt.fabric && lt.fabric.toLowerCase().includes("silk");
    let colorScore;
    if (isColored) {
      if (chlorine > 0) {
        colorScore = Math.max(5, 88 - chlorine * 20);
      } else {
        const tempDmg  = tempC > lt.tempC + 12 ? Math.max(30, 90 - (tempC - lt.tempC - 12) * 3) : 90;
        const oxygenOk = oxygen >= 3 ? 84 : oxygen >= 1 ? 76 : 68;
        colorScore = Math.round(Math.min(tempDmg, oxygenOk));
      }
    } else if (isSilk) {
      if (chlorine > 0 || oxygen > 0) {
        colorScore = 12;
      } else {
        colorScore = tempC <= 25 ? 92 : tempC <= 30 ? 72 : 38;
      }
    } else {
      const clEff     = chlorine > 0 && tempC < 78 ? (chlorine >= 4 ? 95 : chlorine >= 2 ? 82 : 62) : chlorine > 0 ? 44 : 0;
      const oxEff     = oxygen >= 3 ? 82 : oxygen >= 1 ? 64 : 0;
      const bestBleach = Math.max(clEff, oxEff);
      const tFactor   = tempC >= 60 ? 1.0 : tempC >= 50 ? 0.86 : 0.70;
      colorScore = Math.round(Math.max(40, bestBleach) * tFactor);
    }

    // ── FABRIC PROTECTION ────────────────────────────────────
    let fabProt;
    if (isSilk) {
      const tP = tempC <= 22 ? 95 : tempC <= 25 ? 80 : tempC <= 30 ? 56 : tempC <= 38 ? 26 : 6;
      const aP = alkali > 0 ? Math.max(6, 84 - alkali * 13) : 88;
      const bP = chlorine > 0 ? 4 : oxygen > 0 ? 12 : 90;
      fabProt = Math.round(Math.min(tP, aP, bP));
    } else {
      const tP    = tempC <= lt.tempC ? 92 : tempC <= lt.tempC+10 ? 80 : tempC <= lt.tempC+20 ? 64 : Math.max(40, 64-(tempC-(lt.tempC+20))*1.8);
      const sourP = sour >= 2 ? 94 : sour >= 1 ? 76 : sour >= 0.5 ? 55 : 24;
      const alkP  = alkali <= 8 ? 92 : Math.max(60, 92-(alkali-8)*5);
      fabProt = Math.round(tP * 0.50 + sourP * 0.32 + alkP * 0.18);
    }

    // ── pH / SKIN SAFETY ─────────────────────────────────────
    const sourComp = sour >= 2 ? 96 : sour >= 1 ? 78 : sour >= 0.5 ? 56 : sour > 0 ? 38 : 14;

    // ── REWASH RISK ──────────────────────────────────────────
    const deficit = Math.max(0, 80 - clean);
    const rewash  = Math.round(Math.min(25, Math.max(lt.rewashTarget, lt.rewashTarget + deficit * 0.22)));

    // ── OVERALL ──────────────────────────────────────────────
    const overall = Math.min(99, Math.max(5, Math.round(
      clean * 0.32 + hygiene * 0.26 + fabProt * 0.18 + sourComp * 0.12 + colorScore * 0.12
    )));

    return {
      overall, clean, hygiene, fabProt, sourComp, colorScore, rewash,
      sinner: { chem: Math.round(chem), temp: Math.round(temp), time: Math.round(time), mech }
    };
  }
};

// ─── DRY METHODS ─────────────────────────────────────────────
const DRY_METHODS = [
  { id:"tumble_high", label:"Tumble – High Heat",   icon:"🔥", note:"80–110°C. Standard for hospital linen. Best hygiene boost.",          hygieneBoost:14, fabStress:16, energyFactor:1.4, shrinkClass:"medium"  },
  { id:"tumble_med",  label:"Tumble – Medium Heat", icon:"🌡️", note:"65–80°C. Balanced hygiene + fabric care. Hospitality standard.",     hygieneBoost:9,  fabStress:8,  energyFactor:1.0, shrinkClass:"low"     },
  { id:"tumble_low",  label:"Tumble – Low Heat",    icon:"🌬️", note:"50–65°C. Delicates & synthetics. Minimal hygiene boost.",           hygieneBoost:4,  fabStress:3,  energyFactor:0.65, shrinkClass:"minimal" },
  { id:"air",         label:"Air / Line Dry",        icon:"☀️", note:"No heat. Full hygiene relies on wash cycle. Zero energy cost.",     hygieneBoost:1,  fabStress:0,  energyFactor:0.02, shrinkClass:"none"    },
  { id:"none",        label:"No Drying (wet)",       icon:"💧", note:"⚠️ Wet packed linen = mould/bacteria risk within 2–4 hours.",       hygieneBoost:0,  fabStress:0,  energyFactor:0,    shrinkClass:"none"    },
];

// ─── FORMULA SIMULATOR ───────────────────────────────────────
function FormulaSimulator({ linenTypes, chemicals, settings }) {
  const [selLinen,  setSelLinen]  = useState(linenTypes[0]?.id || null);
  const [kgLoad,    setKgLoad]    = useState(35);
  const [loads,     setLoads]     = useState(20);
  const [waterL,    setWaterL]    = useState(200);
  const [useFah,    setUseFah]    = useState(false);
  const [editTemp,  setEditTemp]  = useState(null);
  const [editTime,  setEditTime]  = useState(null);
  const [editDoses, setEditDoses] = useState({});
  const [tab,       setTab]       = useState("Formula");
  const [dryMethod, setDryMethod] = useState("tumble_med");
  const [dryTempC,  setDryTempC]  = useState(75);
  const [dryMin,    setDryMin]    = useState(45);
  const [costWater,  setCostWater]  = useState(settings?.waterCostPerL   ?? 0.02);
  const [costEnergy, setCostEnergy] = useState(settings?.energyCostPerKwh ?? 9.20);
  const [simMsg,     setSimMsg]     = useState(""); // "Saved!" / "Reset!"

  // Load persisted simulator settings on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("nortkem_simulator");
        if (r?.value) {
          const s = JSON.parse(r.value);
          if (s.kgLoad)    setKgLoad(s.kgLoad);
          if (s.loads)     setLoads(s.loads);
          if (s.waterL)    setWaterL(s.waterL);
          if (s.dryMethod) setDryMethod(s.dryMethod);
          if (s.dryTempC)  setDryTempC(s.dryTempC);
          if (s.dryMin)    setDryMin(s.dryMin);
          if (s.costWater  !== undefined) setCostWater(s.costWater);
          if (s.costEnergy !== undefined) setCostEnergy(s.costEnergy);
        }
      } catch(e) {}
    })();
  }, []);

  const handleSaveSim = async () => {
    const snap = { kgLoad, loads, waterL, dryMethod, dryTempC, dryMin, costWater, costEnergy };
    try { await window.storage.set("nortkem_simulator", JSON.stringify(snap)); } catch(e) {}
    setSimMsg("✅ Simulator settings saved!");
    setTimeout(() => setSimMsg(""), 2500);
  };

  const handleResetSim = async () => {
    if (!window.confirm("Reset simulator to default values?")) return;
    setKgLoad(35); setLoads(20); setWaterL(200);
    setDryMethod("tumble_med"); setDryTempC(75); setDryMin(45);
    setCostWater(settings?.waterCostPerL ?? 0.02);
    setCostEnergy(settings?.energyCostPerKwh ?? 9.20);
    try { await window.storage.delete("nortkem_simulator"); } catch(e) {}
    setSimMsg("↩️ Reset to defaults!");
    setTimeout(() => setSimMsg(""), 2500);
  };

  const lt = linenTypes.find(x => x.id === selLinen);

  useEffect(() => {
    if (lt) { setEditTemp(lt.tempC); setEditTime(lt.cycleMin); setEditDoses({...lt.chemicals}); }
  }, [selLinen, linenTypes]);

  if (!lt || editTemp === null) {
    return <div style={{textAlign:"center",padding:"50px 20px",color:C.textMuted,fontFamily:F}}>No linen types found. Add one in the Linen Types tab.</div>;
  }

  const dispT    = c => useFah ? `${toF(c)}°F` : `${c}°C`;
  const dispTVal = c => useFah ? toF(c) : c;
  const inputToC = v => useFah ? toC(Number(v)) : Number(v);
  const tMin     = useFah ? 32  : 10;
  const tMax     = useFah ? 210 : 95;

  const sim    = WASH_ENGINE.simulate(editDoses, editTemp, editTime, lt);
  const stdSim = WASH_ENGINE.simulate(lt.chemicals, lt.tempC, lt.cycleMin, lt);

  const chemCPK   = CHEMICAL_TYPES.reduce((acc, t) => {
    const ch = chemicals.find(c => c.key === t.key || c.type === t.key);
    return acc + (editDoses[t.key]||0) * (ch ? ch.costPerL/1000 : 0.30);
  }, 0);
  const waterCPK  = (waterL / kgLoad) * costWater;
  const energyCPK = ((editTemp - 20) * 0.001163 * (waterL / kgLoad)) * (costEnergy / 1000);
  const totalCPK  = chemCPK + waterCPK + energyCPK;
  const dailyKg   = loads * kgLoad;
  const dailyCost = totalCPK * dailyKg;

  const dryM           = DRY_METHODS.find(m => m.id === dryMethod) || DRY_METHODS[1];
  const dryFinalHygiene= Math.min(99, sim.hygiene + dryM.hygieneBoost);
  const dryFinalFabProt= Math.max(5,  sim.fabProt  - dryM.fabStress);
  const adequateDryTime= dryMin >= Math.ceil(kgLoad * 0.85);
  const dryEnergy      = kgLoad * 0.08 * (dryTempC/80) * dryM.energyFactor * (costEnergy/1000) * (dryMin/60);

  const scoreColor = s => s >= 88 ? C.green : s >= 72 ? C.teal : s >= 55 ? C.orange : C.red;
  const scoreLabel = s => s >= 88 ? "Excellent" : s >= 72 ? "Good" : s >= 55 ? "Fair" : "Poor";
  const scoreBg    = s => s >= 88 ? C.navy : s >= 72 ? C.navy : s >= 55 ? "#7A3800" : "#6E0A0A";

  const outcomes = [
    { l:"Stain Removal",       v:sim.clean,     std:stdSim.clean,     i:"🧹", isRisk:false },
    { l:"Hygiene / Disinfect", v:sim.hygiene,   std:stdSim.hygiene,   i:"🦠", isRisk:false },
    { l:"Fabric Protection",   v:sim.fabProt,   std:stdSim.fabProt,   i:"🧺", isRisk:false },
    { l:"pH / Skin Safe",      v:sim.sourComp,  std:stdSim.sourComp,  i:"⚖️", isRisk:false },
    { l:"Whiteness / Color",   v:sim.colorScore,std:stdSim.colorScore,i:"✨", isRisk:false },
    { l:"Rewash Risk",         v:sim.rewash,    std:stdSim.rewash,    i:"🔄", isRisk:true  },
  ];

  const alerts = [];
  const det        = editDoses.detergent || 0;
  const isHosp2    = lt.id===4 || ["Hospital","Medical","Clinic"].some(k => lt.name.includes(k));
  const isColored2 = lt.id===3 || lt.name.toLowerCase().includes("color");
  const isSilk2    = lt.fabric && lt.fabric.toLowerCase().includes("silk");
  if (det === 0)
    alerts.push({sev:"fail", msg:`No detergent → Stain Removal is ${sim.clean}% (water only). No emulsification possible. Sinner's Circle: Chemistry = 35% weight.`});
  else if (det < 3)
    alerts.push({sev:"warn", msg:`Detergent ${det} mL/kg is severely under-dosed (optimal: 6–10 mL/kg). Stain Removal: ${sim.clean}%.`});
  if ((editDoses.sour||0) === 0)
    alerts.push({sev:"warn", msg:`No Neutralizer/Sour → linen pH stays 9–11 (alkaline residue). Skin irritation risk. pH Safety: ${sim.sourComp}%.`});
  if (isHosp2 && editTemp < 60)
    alerts.push({sev:"fail", msg:`CRITICAL — Hospital linen at ${dispT(editTemp)} fails thermal disinfection. CDC requires ≥${dispT(71)}. Hygiene: ${sim.hygiene}%.`});
  else if (editTemp < lt.tempC - 12)
    alerts.push({sev:"warn", msg:`Temp ${dispT(editTemp)} is ${lt.tempC-editTemp}°C below standard. Hygiene: ${sim.hygiene}%.`});
  if (editTime < lt.cycleMin * 0.6)
    alerts.push({sev:"warn", msg:`Cycle too short (${editTime} min). Minimum recommended: ${Math.round(lt.cycleMin*0.7)} min.`});
  if (isColored2 && (editDoses.chlorine||0) > 0)
    alerts.push({sev:"fail", msg:`Chlorine bleach on COLORED linen causes irreversible color damage. Color score: ${sim.colorScore}%.`});
  if (isSilk2 && editTemp > 30)
    alerts.push({sev:"fail", msg:`Silk at ${dispT(editTemp)} causes fiber damage. Use cold water ≤${dispT(25)} only. Fabric Protection: ${sim.fabProt}%.`});
  if (isSilk2 && (editDoses.alkali||0) > 0)
    alerts.push({sev:"fail", msg:`Alkali dissolves silk proteins. DO NOT use alkali on silk. Fabric Protection: ${sim.fabProt}%.`});
  if (sim.overall >= 90 && alerts.length === 0)
    alerts.push({sev:"ok", msg:"All Sinner's Circle factors balanced. Formula is optimized for maximum efficacy with minimum fabric stress."});

  const setDose = (key, delta) =>
    setEditDoses(d => ({ ...d, [key]: Math.max(0, Math.min(20, +((d[key]||0) + delta).toFixed(1))) }));

  return (
    <div>
      <SectionHead title="Formula Simulator" subtitle="Sinner's Circle engine — accurate chemistry physics"/>

      {/* Linen selector + unit toggle */}
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <Label style={{margin:0}}>Linen Type</Label>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{color:C.textMuted,fontSize:10,fontFamily:F}}>Temp:</span>
            {[["°C",false],["°F",true]].map(([lbl,val])=>(
              <button key={lbl} onClick={()=>setUseFah(val)}
                style={{padding:"4px 10px",borderRadius:7,border:`1.5px solid ${useFah===val?(val?C.orange:C.blue):C.border}`,background:useFah===val?(val?C.orangeLight:C.blueLight):"transparent",color:useFah===val?(val?C.orange:C.blue):C.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F}}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
          {linenTypes.map(lt2=>(
            <button key={lt2.id} onClick={()=>setSelLinen(lt2.id)}
              style={{flexShrink:0,padding:"8px 13px",borderRadius:11,border:`1.5px solid ${selLinen===lt2.id?lt2.color:C.border}`,background:selLinen===lt2.id?`${lt2.color}15`:C.bg,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:15}}>{lt2.icon}</span>
              <span style={{color:selLinen===lt2.id?lt2.color:C.textSub,fontSize:12,fontWeight:600,fontFamily:F,whiteSpace:"nowrap"}}>{lt2.name.split(" ").slice(0,2).join(" ")}</span>
            </button>
          ))}
        </div>
        <div style={{marginTop:10}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            <Badge label={dispT(lt.tempC)} color={C.orange}/>
            <Badge label={`${lt.cycleMin} min`} color={C.blue}/>
            <Badge label={`pH ${lt.pH}`} color={C.teal}/>
            <Badge label={lt.fabric} color={C.purple}/>
          </div>
        </div>
      </Card>

      {/* Save / Reset */}
      <div style={{display:"flex",gap:10,marginBottom:10,alignItems:"center"}}>
        <button onClick={handleSaveSim}
          style={{flex:1,padding:"10px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          💾 Save Settings
        </button>
        <button onClick={handleResetSim}
          style={{flex:1,padding:"10px 0",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.card,color:C.red,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          ↩️ Reset Defaults
        </button>
      </div>
      {simMsg&&(
        <div style={{background:simMsg.startsWith("✅")?C.greenLight:C.orangeLight,borderRadius:10,padding:"9px 14px",marginBottom:10,textAlign:"center",color:simMsg.startsWith("✅")?C.green:C.orange,fontSize:13,fontWeight:700,fontFamily:F}}>
          {simMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{marginBottom:12}}>
        <Seg options={["Formula","Drying","Load Calc","Sinner's Circle"]} value={tab} onChange={setTab}/>
      </div>

      {/* ═══════════════ FORMULA TAB ═══════════════ */}
      {tab === "Formula" && (
        <div>
          {/* Overall score card */}
          <Card style={{marginBottom:12,background:scoreBg(sim.overall),border:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F}}>
                  Overall Wash Quality
                </div>
                <div style={{color:"#fff",fontSize:44,fontWeight:800,fontFamily:F,lineHeight:1}}>
                  {sim.overall}<span style={{fontSize:20}}>%</span>
                </div>
                <div style={{color:scoreColor(sim.overall),fontSize:14,fontWeight:700,fontFamily:F,marginTop:3}}>
                  {scoreLabel(sim.overall)}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:10,textTransform:"uppercase",fontFamily:F,marginBottom:4}}>vs Standard</div>
                <div style={{color:sim.overall>=stdSim.overall?C.green:C.red,fontWeight:700,fontSize:16,fontFamily:F}}>
                  {sim.overall>=stdSim.overall?"▲":"▼"} {Math.abs(sim.overall-stdSim.overall)} pts
                </div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,fontFamily:F}}>Std: {stdSim.overall}%</div>
              </div>
            </div>
            <div style={{display:"flex",background:"rgba(255,255,255,0.07)",borderRadius:10,overflow:"hidden",marginTop:14}}>
              {[{l:"₱/kg",v:`₱${totalCPK.toFixed(2)}`},{l:"Temp",v:dispT(editTemp)},{l:"Time",v:`${editTime}m`},{l:"Rewash",v:`${sim.rewash}%`}].map((s,i,a)=>(
                <div key={s.l} style={{flex:1,padding:"10px 8px",textAlign:"center",borderRight:i<a.length-1?"1px solid rgba(255,255,255,0.1)":"none"}}>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:9,fontWeight:600,textTransform:"uppercase",fontFamily:F}}>{s.l}</div>
                  <div style={{color:"#fff",fontSize:13,fontWeight:800,fontFamily:F,marginTop:2}}>{s.v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Alerts */}
          {alerts.map((a,i)=>(
            <div key={i} style={{background:a.sev==="fail"?C.redLight:a.sev==="warn"?C.orangeLight:C.greenLight,border:`1px solid ${a.sev==="fail"?C.red:a.sev==="warn"?C.orange:C.green}30`,borderRadius:12,padding:"10px 14px",marginBottom:10,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,flexShrink:0}}>{a.sev==="fail"?"🚨":a.sev==="warn"?"⚠️":"✅"}</span>
              <span style={{color:a.sev==="fail"?C.red:a.sev==="warn"?C.orange:C.green,fontSize:12,fontFamily:F,lineHeight:1.5,fontWeight:a.sev==="fail"?700:400}}>{a.msg}</span>
            </div>
          ))}

          {/* Temperature & time */}
          <Card style={{marginBottom:12}}>
            <Label>Wash Parameters</Label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <Label style={{marginBottom:4}}>Temperature</Label>
                <div style={{display:"flex",alignItems:"center",background:C.bg,borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
                  <input type="number" value={dispTVal(editTemp)} min={tMin} max={tMax}
                    onChange={e=>setEditTemp(inputToC(e.target.value))}
                    style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,padding:"11px 12px",fontFamily:F}}/>
                  <span style={{padding:"0 10px",color:C.textMuted,fontSize:12,fontFamily:F}}>{useFah?"°F":"°C"}</span>
                </div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:3,fontFamily:F}}>Std: {dispT(lt.tempC)}</div>
              </div>
              <div>
                <Label style={{marginBottom:4}}>Cycle Time</Label>
                <div style={{display:"flex",alignItems:"center",background:C.bg,borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
                  <input type="number" value={editTime} min={5} max={120}
                    onChange={e=>setEditTime(Number(e.target.value))}
                    style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,padding:"11px 12px",fontFamily:F}}/>
                  <span style={{padding:"0 10px",color:C.textMuted,fontSize:12,fontFamily:F}}>min</span>
                </div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:3,fontFamily:F}}>Std: {lt.cycleMin} min</div>
              </div>
            </div>
          </Card>

          {/* Chemical sliders */}
          <Card style={{marginBottom:12}}>
            <Label>Chemical Dosing (mL/kg)</Label>
            {CHEMICAL_TYPES.map(t => {
              const dose    = editDoses[t.key] || 0;
              const stdDose = lt.chemicals?.[t.key] || 0;
              const hiLight = (t.key==="detergent"&&dose===0) || (t.key==="sour"&&dose===0) || (t.key==="chlorine"&&dose>0&&isColored2) || (t.key==="alkali"&&dose>0&&isSilk2);
              let hint = "";
              if (t.key==="detergent"&&dose===0) hint = "🚨 Stain Removal collapses!";
              else if (t.key==="detergent"&&dose<3) hint = "⚠️ Severely under-dosed";
              else if (t.key==="sour"&&dose===0) hint = "⚠️ pH stays alkaline";
              else if (t.key==="chlorine"&&isColored2&&dose>0) hint = "🚨 Color damage!";
              else if (t.key==="alkali"&&isSilk2&&dose>0) hint = "🚨 Damages silk!";
              return (
                <div key={t.key} style={{paddingBottom:12,marginBottom:12,borderBottom:`1px solid ${C.borderLight}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span style={{fontSize:15,width:22,textAlign:"center"}}>{t.icon}</span>
                    <span style={{color:C.text,fontSize:13,fontWeight:600,fontFamily:F,flex:1}}>{t.name.split("/")[0]}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button onClick={()=>setDose(t.key,-0.5)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:C.textSub}}>−</button>
                      <span style={{color:hiLight?C.red:t.color,fontWeight:800,fontSize:14,fontFamily:F,minWidth:52,textAlign:"center"}}>{dose} mL/kg</span>
                      <button onClick={()=>setDose(t.key,+0.5)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:C.textSub}}>+</button>
                    </div>
                  </div>
                  <input type="range" value={dose} min={0} max={t.maxDose} step={0.5}
                    onChange={e=>setEditDoses(d=>({...d,[t.key]:Number(e.target.value)}))}
                    style={{width:"100%",accentColor:hiLight?C.red:t.color}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                    <span style={{color:C.textMuted,fontSize:10,fontFamily:F}}>Std: {stdDose} mL/kg</span>
                    {hint&&<span style={{color:C.red,fontSize:10,fontWeight:700,fontFamily:F}}>{hint}</span>}
                    {!hint&&<span style={{color:C.textMuted,fontSize:10,fontFamily:F}}>{t.minDose}–{t.maxDose} mL/kg</span>}
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Outcome bars */}
          <Card style={{marginBottom:12}}>
            <Label>Outcome vs Standard</Label>
            {outcomes.map(o => {
              const col   = scoreColor(o.v);
              const delta = o.isRisk ? o.std - o.v : o.v - o.std;
              return (
                <div key={o.l} style={{marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span style={{fontSize:14,width:20,textAlign:"center"}}>{o.i}</span>
                    <span style={{color:C.text,fontSize:13,fontWeight:600,fontFamily:F,flex:1}}>{o.l}</span>
                    <span style={{color:col,fontSize:13,fontWeight:800,fontFamily:F}}>{o.v}%</span>
                    <span style={{color:delta>=0?C.green:C.red,fontSize:11,fontWeight:700,fontFamily:F,minWidth:40,textAlign:"right"}}>
                      {delta>=0?"▲":"▼"}{Math.abs(delta)}
                    </span>
                  </div>
                  <div style={{position:"relative",background:C.bg,borderRadius:5,height:8,overflow:"visible"}}>
                    <div style={{position:"absolute",left:`${Math.min(o.std,99)}%`,top:-2,bottom:-2,width:2,background:`${C.textMuted}80`,zIndex:2,borderRadius:2}}/>
                    <div style={{width:`${Math.min(o.v,100)}%`,height:"100%",background:`linear-gradient(90deg,${col},${col}99)`,borderRadius:5,transition:"width 0.35s",position:"relative",zIndex:1}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                    <span style={{color:C.textMuted,fontSize:9,fontFamily:F}}>0</span>
                    <span style={{color:C.textMuted,fontSize:9,fontFamily:F}}>Std: {o.std}%</span>
                    <span style={{color:C.textMuted,fontSize:9,fontFamily:F}}>100</span>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Cost per load */}
          <Card style={{marginBottom:12}}>
            <Label>Cost per Load ({kgLoad} kg)</Label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
              <StatCard label="Chemicals" value={`₱${(chemCPK*kgLoad).toFixed(0)}`} color={C.blue} icon="🧪"/>
              <StatCard label="Water"     value={`₱${(waterCPK*kgLoad).toFixed(0)}`} color={C.teal} icon="💧"/>
              <StatCard label="Energy"    value={`₱${(energyCPK*kgLoad).toFixed(0)}`} color={C.orange} icon="⚡"/>
            </div>
            <div style={{background:C.blueLight,borderRadius:12,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:C.blue,fontSize:18,fontWeight:800,fontFamily:F}}>₱{totalCPK.toFixed(2)} / kg</div>
                <div style={{color:C.textSub,fontSize:12,fontFamily:F,marginTop:2}}>₱{dailyCost.toFixed(0)} / day · {loads} loads</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:C.textMuted,fontSize:11,fontFamily:F}}>vs Industry</div>
                <div style={{color:totalCPK<=2.20?C.green:totalCPK<=3.30?C.orange:C.red,fontWeight:700,fontSize:13,fontFamily:F}}>
                  {totalCPK<=2.20?"✅ Below avg":totalCPK<=3.30?"⚠️ Average":"🔴 Above avg"}
                </div>
                <div style={{color:C.textMuted,fontSize:10,fontFamily:F}}>₱1.10–3.30/kg range</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════ DRYING TAB ═══════════════ */}
      {tab === "Drying" && (
        <div>
          <Card style={{marginBottom:12,background:C.blueLight,border:`1px solid ${C.blue}25`}}>
            <div style={{color:C.blue,fontSize:13,fontWeight:700,fontFamily:F,marginBottom:4}}>
              🔬 Drying contributes up to 50%+ of final hygiene
            </div>
            <div style={{color:C.textSub,fontSize:12,fontFamily:F,lineHeight:1.6}}>
              Source: ScienceDirect 2024. When wash temp is below 60°C, drying is critical for disinfection. High-heat tumble drying compensates for low-temperature wash limitations.
            </div>
          </Card>

          {/* Dry method selector */}
          <Card style={{marginBottom:12}}>
            <Label>Drying Method</Label>
            {DRY_METHODS.map(m=>(
              <button key={m.id} onClick={()=>setDryMethod(m.id)}
                style={{display:"flex",alignItems:"flex-start",gap:12,width:"100%",padding:"12px 14px",marginBottom:8,borderRadius:12,border:`1.5px solid ${dryMethod===m.id?C.blue:C.border}`,background:dryMethod===m.id?C.blueLight:"transparent",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22,flexShrink:0}}>{m.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color:dryMethod===m.id?C.blue:C.text,fontWeight:700,fontSize:13,fontFamily:F}}>{m.label}</div>
                  <div style={{color:C.textSub,fontSize:11,fontFamily:F,marginTop:3,lineHeight:1.5}}>{m.note}</div>
                  <div style={{display:"flex",gap:7,marginTop:5}}>
                    <Badge label={`+${m.hygieneBoost}% Hygiene`} color={C.green} size={10}/>
                    <Badge label={`Fabric stress: ${m.fabStress}%`} color={m.fabStress>10?C.red:C.teal} size={10}/>
                  </div>
                </div>
                {dryMethod===m.id&&<span style={{color:C.blue,fontSize:18}}>✓</span>}
              </button>
            ))}
          </Card>

          {/* Dryer settings */}
          {dryMethod!=="air"&&dryMethod!=="none"&&(
            <Card style={{marginBottom:12}}>
              <Label>Dryer Settings</Label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <Label style={{marginBottom:4}}>Dryer Temp</Label>
                  <div style={{display:"flex",alignItems:"center",background:C.bg,borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
                    <input type="number" value={useFah?toF(dryTempC):dryTempC} min={useFah?122:50} max={useFah?230:110}
                      onChange={e=>setDryTempC(useFah?toC(Number(e.target.value)):Number(e.target.value))}
                      style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,padding:"11px 12px",fontFamily:F}}/>
                    <span style={{padding:"0 10px",color:C.textMuted,fontSize:12,fontFamily:F}}>{useFah?"°F":"°C"}</span>
                  </div>
                </div>
                <div>
                  <Label style={{marginBottom:4}}>Drying Time</Label>
                  <div style={{display:"flex",alignItems:"center",background:C.bg,borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
                    <input type="number" value={dryMin} min={10} max={120}
                      onChange={e=>setDryMin(Number(e.target.value))}
                      style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,padding:"11px 12px",fontFamily:F}}/>
                    <span style={{padding:"0 10px",color:C.textMuted,fontSize:12,fontFamily:F}}>min</span>
                  </div>
                  {!adequateDryTime&&<div style={{color:C.orange,fontSize:10,marginTop:3,fontFamily:F}}>⚠️ Recommended: ≥{Math.ceil(kgLoad*0.85)} min for {kgLoad} kg</div>}
                </div>
              </div>
            </Card>
          )}

          {/* Combined wash+dry outcome */}
          <Card style={{marginBottom:12,background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,border:"none"}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F,marginBottom:12}}>
              Combined Wash + Dry Outcome
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[
                {l:"Final Hygiene",   v:dryFinalHygiene, c:scoreColor(dryFinalHygiene)},
                {l:"Fabric Protection",v:dryFinalFabProt, c:scoreColor(dryFinalFabProt)},
                {l:"Hygiene Boost",   v:`+${dryM.hygieneBoost}%`, c:C.green},
                {l:"Shrink Risk",     v:dryM.shrinkClass,c:dryM.shrinkClass==="medium"?C.orange:dryM.shrinkClass==="low"?C.teal:C.green},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{color:s.c,fontSize:18,fontWeight:800,fontFamily:F}}>{typeof s.v==="number"?`${s.v}%`:s.v}</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontFamily:F,marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontFamily:F}}>Drying energy cost</div>
              <div style={{color:"#fff",fontSize:14,fontWeight:800,fontFamily:F}}>₱{dryEnergy.toFixed(2)} / load</div>
            </div>
          </Card>

          {/* Drying standards reference */}
          <Card style={{marginBottom:12}}>
            <Label>Industry Drying Standards</Label>
            {[
              {linen:"Hospital/Medical",  temp:"High heat 80–110°C",min:"Min 30 min",note:"CDC/OSHA requirement"},
              {linen:"White Hotel Sheets",temp:"Med-High 70–90°C",  min:"30–45 min", note:"TRSA standard"},
              {linen:"Bath Towels",       temp:"Medium 65–80°C",    min:"35–45 min", note:"Hospitality.Institute"},
              {linen:"Colored Linens",    temp:"Low–Med 50–65°C",   min:"30–40 min", note:"Reduces color fading"},
              {linen:"Silk / Delicates",  temp:"Air dry preferred",  min:"N/A",       note:"NO tumble dry"},
              {linen:"Polyester Uniforms",temp:"Low heat 50–60°C",  min:"25–35 min", note:"Prevents oil bake-in"},
            ].map((row,i,a)=>(
              <div key={row.linen} style={{padding:"10px 0",borderBottom:i<a.length-1?`1px solid ${C.borderLight}`:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:F}}>{row.linen}</span>
                  <Badge label={row.min} color={C.blue} size={10}/>
                </div>
                <div style={{color:C.textSub,fontSize:12,fontFamily:F,marginTop:3}}>{row.temp}</div>
                <div style={{color:C.textMuted,fontSize:10,fontFamily:F,marginTop:2}}>{row.note}</div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ═══════════════ LOAD CALC TAB ═══════════════ */}
      {tab === "Load Calc" && (
        <div>
          <Card style={{marginBottom:12}}>
            <Label>Load Configuration</Label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Input label="kg per Load" value={kgLoad}  onChange={setKgLoad}  min={1}    max={5000} suffix="kg"    small note="OPL: 5–100 kg | Tunnel: up to 5000 kg"/>
              <Input label="Loads/Day"   value={loads}   onChange={setLoads}   min={1}    max={200}  suffix="loads" small/>
              <Input label="Water/Load"  value={waterL}  onChange={setWaterL}  min={10}   max={10000} suffix="L"    small/>
            </div>
          </Card>
          <Card style={{marginBottom:12}}>
            <Label>Utility Costs</Label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Input label="Water Cost" value={costWater}  onChange={setCostWater}  min={0} max={10} step={0.001} prefix="₱" suffix="/L"   small note="Set 0 to compare chemicals only"/>
              <Input label="Energy Cost" value={costEnergy} onChange={setCostEnergy} min={1}     max={30} step={0.1}   prefix="₱" suffix="/kWh" small/>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <StatCard label="Daily Linen kg" value={`${dailyKg.toFixed(0)} kg`}   color={C.blue}   icon="🧺"/>
            <StatCard label="Daily Cost"      value={`₱${dailyCost.toFixed(0)}`}   color={C.orange} icon="💰"/>
            <StatCard label="Cost / kg"       value={`₱${totalCPK.toFixed(2)}`}   color={C.teal}   icon="⚖️"/>
            <StatCard label="Monthly Cost"    value={`₱${(dailyCost*30/1000).toFixed(1)}K`} color={C.purple} icon="📅"/>
          </div>
          <Card style={{marginBottom:12}}>
            <Label>Chemical Volume / Load</Label>
            {CHEMICAL_TYPES.map(t=>{
              const mLkg    = editDoses[t.key] || 0;
              const totalML = mLkg * kgLoad;
              const stdLoad = (lt.chemicals?.[t.key]||0) * kgLoad;
              if(mLkg===0&&stdLoad===0) return null;
              const ch      = chemicals.find(c=>c.key===t.key||c.type===t.key);
              const costML  = ch ? ch.costPerL/1000 : 0.30;
              return (
                <div key={t.key} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.borderLight}`}}>
                  <div style={{width:34,height:34,borderRadius:10,background:`${t.color}15`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{t.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{color:C.text,fontWeight:600,fontSize:13,fontFamily:F}}>{t.name.split("/")[0]}</div>
                    <div style={{color:C.textMuted,fontSize:11,fontFamily:F,marginTop:2}}>{mLkg} mL/kg × {kgLoad} kg = {totalML.toFixed(0)} mL</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:t.color,fontSize:13,fontWeight:700,fontFamily:F}}>{totalML.toFixed(0)} mL</div>
                    <div style={{color:C.textMuted,fontSize:11,fontFamily:F}}>₱{(totalML*costML).toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </Card>
          <Card style={{background:C.blueLight,border:`1px solid ${C.blue}25`}}>
            <Label style={{color:C.blue}}>Ecolab Benchmarks (Philippine Market)</Label>
            {[
              {l:"Cost per kg target",     v:"₱1.10–₱3.30/kg"},
              {l:"150-room hotel annual",   v:"~₱75,000/yr"},
              {l:"Laundry per room/day",    v:"7 kg linen"},
              {l:"Water per kg linen",      v:"~52 L/kg"},
              {l:"Energy per kg linen",     v:"~0.07 kWh/kg"},
              {l:"Rewash target",           v:"<2% of loads"},
            ].map((s,i,a)=>(
              <div key={s.l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<a.length-1?`1px solid ${C.border}20`:"none"}}>
                <span style={{color:C.textSub,fontSize:13,fontFamily:F}}>{s.l}</span>
                <span style={{color:C.blue,fontSize:13,fontWeight:700,fontFamily:F}}>{s.v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ═══════════════ SINNER'S CIRCLE TAB ═══════════════ */}
      {tab === "Sinner's Circle" && (
        <div>
          <Card style={{marginBottom:12}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{color:C.text,fontSize:14,fontWeight:700,fontFamily:F,marginBottom:5}}>⚙️ Sinner's Circle Analysis</div>
              <div style={{color:C.textSub,fontSize:12,fontFamily:F,lineHeight:1.65}}>
                Dr. Herbert Sinner (1959): Chemistry × Temperature × Time × Mechanical.
                Drop any one factor to zero → cleaning collapses.
              </div>
            </div>
            {[
              {l:"Chemistry",   v:sim.sinner.chem, std:stdSim.sinner.chem, c:C.blue,   w:"35%", i:"🧪", note:`Detergent: ${editDoses.detergent||0} mL/kg · Alkali: ${editDoses.alkali||0} · Enzyme: ${editDoses.enzyme||0}`},
              {l:"Temperature", v:sim.sinner.temp, std:stdSim.sinner.temp, c:C.orange, w:"30%", i:"🌡️",note:`${dispT(editTemp)} · Std: ${dispT(lt.tempC)} · ${editTemp>=lt.tempC?"✅ At/above standard":"⚠️ Below standard"}`},
              {l:"Time",        v:sim.sinner.time, std:stdSim.sinner.time, c:C.purple, w:"20%", i:"⏱️",note:`${editTime} min · Std: ${lt.cycleMin} min · ${editTime>=lt.cycleMin?"✅ Sufficient":"⚠️ Too short"}`},
              {l:"Mechanical",  v:sim.sinner.mech, std:75,                 c:C.green,  w:"15%", i:"⚙️",note:"Fixed drum agitation — standard commercial washer-extractor."},
            ].map(f=>(
              <div key={f.l} style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <span style={{fontSize:16,width:22,textAlign:"center",marginTop:2}}>{f.i}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <span style={{color:C.text,fontSize:13,fontWeight:700,fontFamily:F}}>
                        {f.l} <span style={{color:C.textMuted,fontWeight:400,fontSize:10}}>({f.w})</span>
                      </span>
                      <span style={{color:f.c,fontWeight:800,fontSize:14,fontFamily:F}}>{f.v}<span style={{fontSize:10}}>/100</span></span>
                    </div>
                    <div style={{background:C.bg,borderRadius:5,height:9,overflow:"hidden",position:"relative"}}>
                      <div style={{position:"absolute",left:`${f.std}%`,top:0,bottom:0,width:2,background:`${C.textMuted}80`,zIndex:3}}/>
                      <div style={{width:`${f.v}%`,height:"100%",background:`linear-gradient(90deg,${f.c},${f.c}99)`,borderRadius:5,transition:"width 0.35s"}}/>
                    </div>
                    <div style={{color:C.textMuted,fontSize:10,fontFamily:F,marginTop:3,lineHeight:1.4}}>{f.note}</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",marginTop:4}}>
              <div style={{color:C.text,fontSize:12,fontWeight:700,fontFamily:F,marginBottom:8}}>Compensation Recommendations</div>
              {sim.sinner.chem < 60 && (
                <div style={{color:C.textSub,fontSize:12,fontFamily:F,marginBottom:6,lineHeight:1.5}}>
                  ⚠️ Chemistry weak ({sim.sinner.chem}/100) — raise cycle time to <strong>{Math.round(editTime*1.3)} min</strong> or increase detergent to <strong>{Math.min(10,(editDoses.detergent||0)+2)} mL/kg</strong>.
                </div>
              )}
              {sim.sinner.temp < 60 && (
                <div style={{color:C.textSub,fontSize:12,fontFamily:F,marginBottom:6,lineHeight:1.5}}>
                  ⚠️ Temperature low ({sim.sinner.temp}/100) — extend cycle by <strong>{Math.round(editTime*0.35)} min</strong> or add oxygen bleach.
                </div>
              )}
              {sim.sinner.time < 60 && (
                <div style={{color:C.textSub,fontSize:12,fontFamily:F,marginBottom:6,lineHeight:1.5}}>
                  ⚠️ Cycle too short ({sim.sinner.time}/100) — raise temp by <strong>+{Math.round(lt.tempC*0.07)}°C</strong> or increase detergent.
                </div>
              )}
              {sim.sinner.chem >= 75 && sim.sinner.temp >= 75 && sim.sinner.time >= 75 && (
                <div style={{color:C.green,fontSize:12,fontWeight:700,fontFamily:F}}>
                  ✅ All four Sinner factors well balanced. Formula is optimized.
                </div>
              )}
            </div>
          </Card>

          {lt.steps && lt.steps.length > 0 && (
            <Card style={{marginBottom:12}}>
              <Label>Recommended Wash Steps — {lt.name}</Label>
              {lt.steps.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<lt.steps.length-1?`1px solid ${C.borderLight}`:"none"}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:C.blueLight,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:C.blue,fontSize:11,fontWeight:800,fontFamily:F}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:C.text,fontWeight:700,fontSize:13,fontFamily:F}}>{step.name}</span>
                      <div style={{display:"flex",gap:5}}>
                        <Badge label={dispT(step.tempC)} color={C.orange} size={10}/>
                        <Badge label={`${step.min} min`} color={C.blue} size={10}/>
                      </div>
                    </div>
                    {step.chemicals.length > 0 && (
                      <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
                        {step.chemicals.map(ck=>{
                          const ti=CHEMICAL_TYPES.find(x=>x.key===ck);
                          return ti ? <Badge key={ck} label={`${ti.icon} ${ti.name.split("/")[0]} · ${editDoses[ck]||0} mL/kg`} color={ti.color} size={10}/> : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Tip color={lt.color} text={lt.notes || "No additional notes."}/>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PROCESS CHECK ───────────────────────────────────────────
function Process({linenTypes}) {
  const [filter,setFilter]=useState("All");

  const downloadCompliance = () => {
    const today = new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});
    const batches2=linenTypes.map(lt=>({
      ...lt,
      dosingML:Object.values(lt.chemicals||{}).reduce((a,b)=>a+(b||0),0),
      status:lt.tempC>=45&&lt.pH>=6.0&&lt.pH<=9.0&&Object.values(lt.chemicals||{}).reduce((a,b)=>a+(b||0),0)>=6?"PASS":lt.tempC>=35&&Object.values(lt.chemicals||{}).reduce((a,b)=>a+(b||0),0)>=4?"WARN":"FAIL"
    }));
    const rows = batches2.map(b=>`<tr>
      <td>${b.icon} ${b.name}</td>
      <td style="text-align:center">${b.tempC}°C</td>
      <td style="text-align:center">${b.pH}</td>
      <td style="text-align:center">${b.dosingML.toFixed(0)} mL/kg</td>
      <td style="text-align:center">${b.cycleMin} min</td>
      <td style="text-align:center;font-weight:800;color:${b.status==="PASS"?"#34C759":b.status==="WARN"?"#FF9500":"#FF3B30"}">${b.status}</td>
    </tr>`).join('');
    const pass=batches2.filter(b=>b.status==="PASS").length;
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Compliance Report</title>
<style>body{font-family:-apple-system,Arial,sans-serif;padding:30px;color:#111}
h1{color:#1C2B4A;font-size:22px;margin-bottom:4px}
.sub{color:#8E8E93;font-size:13px;margin-bottom:20px}
.kpis{display:flex;gap:16px;margin-bottom:24px}
.kpi{flex:1;background:#F2F2F7;border-radius:10px;padding:14px;text-align:center}
.kpi .v{font-size:28px;font-weight:900}
.kpi .l{font-size:11px;color:#8E8E93;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#1C2B4A;color:#fff;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase}
td{padding:9px 12px;border-bottom:1px solid #F0F0F0}
tr:nth-child(even) td{background:#F9F9FB}
.ref{background:#EBF5FF;border-radius:10px;padding:14px 18px;margin-top:20px;font-size:12px;color:#636366}
.ref b{color:#1A6FDB}
footer{margin-top:24px;text-align:center;font-size:10px;color:#AEAEB2}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<h1>🧺 Linen Compliance Report</h1>
<div class="sub">Generated ${today} · NORTKEM WASH IQ v3.2 · Ecolab / TRSA / CDC Standards</div>
<div class="kpis">
  <div class="kpi"><div class="v" style="color:#34C759">${pass}</div><div class="l">PASS</div></div>
  <div class="kpi"><div class="v" style="color:#FF9500">${batches2.filter(b=>b.status==="WARN").length}</div><div class="l">WARN</div></div>
  <div class="kpi"><div class="v" style="color:#FF3B30">${batches2.filter(b=>b.status==="FAIL").length}</div><div class="l">FAIL</div></div>
  <div class="kpi"><div class="v" style="color:#1A6FDB">${Math.round(pass/batches2.length*100)}%</div><div class="l">Compliance Rate</div></div>
</div>
<table><thead><tr><th>Linen Type</th><th>Temp</th><th>pH</th><th>Dosing</th><th>Cycle Time</th><th>Status</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="ref">
  <b>Industry Standards:</b> Hotel wash ≥50°C · Hospital/Medical ≥71°C (CDC) · pH 6.5–8.0 · Total dosing ≥8 mL/kg · Silk/Delicates: 20–25°C cold wash<br>
  Sources: Ecolab Aquanomic, TRSA, CDC Healthcare Linen Guidelines, DOH Philippines (2024)
</div>
<footer>NORTKEM WASH IQ · Laundry Intelligence · Pampanga, Philippines<br>PASS=Fully compliant · WARN=Review recommended · FAIL=Below standard</footer>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
    try {
      const blob=new Blob([html],{type:'text/html;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url; a.download=`Compliance_Report_${new Date().getFullYear()}.html`;
      a.style.display='none'; document.body.appendChild(a); a.click();
      document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(url),2000);
    } catch(e){ alert('Download failed. Please screenshot the compliance table.'); }
  };
  const batches=linenTypes.map(lt=>({
    id:lt.id, name:lt.name, icon:lt.icon, color:lt.color, tempC:lt.tempC, pH:lt.pH,
    dosingML:Object.values(lt.chemicals||{}).reduce((a,b)=>a+(b||0),0), time:lt.cycleMin,
    status:lt.tempC>=45&&lt.pH>=6.0&&lt.pH<=9.0&&Object.values(lt.chemicals||{}).reduce((a,b)=>a+(b||0),0)>=6?"pass":lt.tempC>=35&&Object.values(lt.chemicals||{}).reduce((a,b)=>a+(b||0),0)>=4?"warn":"fail"
  }));
  const SS={pass:{bg:C.greenLight,c:C.green,badge:"PASS"},warn:{bg:C.orangeLight,c:C.orange,badge:"WARN"},fail:{bg:C.redLight,c:C.red,badge:"FAIL"}};
  const visible=filter==="All"?batches:batches.filter(b=>b.status===filter);
  const passing=batches.filter(b=>b.status==="pass").length;
  const scoreData=[
    {p:"Temperature",s:Math.round(batches.filter(b=>b.tempC>=45).length/batches.length*100)},
    {p:"pH Balance",  s:Math.round(batches.filter(b=>b.pH>=6.5&&b.pH<=8.0).length/batches.length*100)},
    {p:"Dosing",      s:Math.round(batches.filter(b=>b.dosingML>=8).length/batches.length*100)},
    {p:"Cycle Time",  s:Math.round(batches.filter(b=>b.time>=35).length/batches.length*100)},
    {p:"Overall Pass",s:Math.round(passing/batches.length*100)},
  ];
  return (
    <div>
      <SectionHead title="Process Check" subtitle="Compliance against industry standards" action={
        <button onClick={downloadCompliance} style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,border:"none",color:"#fff",borderRadius:10,padding:"7px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F}}>⬇️ Export</button>
      }/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        <StatCard label="Compliant" value={passing} color={C.green} icon="✅"/>
        <StatCard label="Review" value={batches.filter(b=>b.status==="warn").length} color={C.orange} icon="⚠️"/>
        <StatCard label="Below Std" value={batches.filter(b=>b.status==="fail").length} color={C.red} icon="❌"/>
      </div>
      <Card style={{marginBottom:14}}>
        <Label>Compliance Scores</Label>
        <ResponsiveContainer width="100%" height={155}>
          <BarChart data={scoreData} layout="vertical" barCategoryGap="15%">
            <XAxis type="number" domain={[0,100]} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
            <YAxis type="category" dataKey="p" tick={{fill:C.textSub,fontSize:11}} axisLine={false} tickLine={false} width={82}/>
            <Tooltip content={<TTip/>} formatter={v=>`${v}%`}/>
            <Bar dataKey="s" name="Score" radius={[0,6,6,0]}>
              {scoreData.map((d,i)=><Cell key={i} fill={d.s>=90?C.green:d.s>=70?C.orange:C.red}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card style={{marginBottom:14,background:C.blueLight,border:`1px solid ${C.blue}25`}}>
        <Label style={{color:C.blue}}>Philippine/Industry Standards Reference</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
          {[{l:"Hotel Wash Temp",v:"50–65°C"},{l:"Hospital/Medical",v:"≥ 71°C (CDC)"},{l:"pH (Skin-Safe)",v:"6.5–8.0"},{l:"Dosing (Total)",v:"8–20+ mL/kg"},{l:"Water Fill",v:"30–40 cm"},{l:"Target Rewash",v:"< 2%"},{l:"Delicate/Silk",v:"20–25°C cold"},{l:"Colored Linen",v:"45–50°C warm"}].map(s=>(
            <div key={s.l} style={{background:C.card,borderRadius:10,padding:"8px 11px"}}>
              <div style={{color:C.textMuted,fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:F}}>{s.l}</div>
              <div style={{color:C.blue,fontSize:13,fontWeight:800,fontFamily:F,marginTop:1}}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{color:C.textMuted,fontSize:10,marginTop:10,fontFamily:F}}>Sources: Ecolab Aquanomic, TRSA, CDC Healthcare Linen Guidelines, Hospitality.Institute (2024)</div>
      </Card>
      <div style={{marginBottom:12}}><Seg options={["All","pass","warn","fail"]} value={filter} onChange={setFilter}/></div>
      <Card>
        <Label>{visible.length} linen type{visible.length!==1?"s":""} shown</Label>
        {visible.map((b,i)=>{
          const s=SS[b.status];
          return (
            <div key={b.id} style={{padding:"13px 0",borderBottom:i<visible.length-1?`1px solid ${C.borderLight}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{b.icon}</span><span style={{color:C.text,fontWeight:700,fontSize:14,fontFamily:F}}>{b.name}</span></div>
                <span style={{background:s.bg,color:s.c,fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:10,fontFamily:F}}>{s.badge}</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Badge label={`${b.tempC}°C`}        color={b.tempC>=60?C.green:b.tempC>=45?C.orange:C.red}/>
                <Badge label={`pH ${b.pH}`}           color={(b.pH>=6.5&&b.pH<=8.0)?C.teal:C.red}/>
                <Badge label={`${b.dosingML.toFixed(0)} mL/kg`} color={b.dosingML>=8?C.green:C.orange}/>
                <Badge label={`${b.time} min`}        color={C.purple}/>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── SAVINGS ────────────────────────────────────────────────
function Savings({user, settings, chemicals, onViewReport}) {
  const [tab,       setTab]      = useState("Report");
  const [hotel,     setHotel]    = useState(user.property);
  const [rooms,     setRooms]    = useState(user.rooms);
  const [occ,       setOcc]      = useState(72);
  const [kgPerRoom, setKgPerRoom]= useState(7);
  const [showReport,setShowReport]= useState(false);

  // Load persisted savings inputs
  useEffect(()=>{
    (async()=>{
      try{
        const r=await window.storage.get("nortkem_savings_inputs");
        if(r?.value){const s=JSON.parse(r.value);if(s.hotel)setHotel(s.hotel);if(s.rooms)setRooms(s.rooms);if(s.occ)setOcc(s.occ);if(s.kgPerRoom)setKgPerRoom(s.kgPerRoom);}
      }catch(e){}
    })();
  },[]);

  const saveSavingsInputs = async () => {
    try{await window.storage.set("nortkem_savings_inputs",JSON.stringify({hotel,rooms,occ,kgPerRoom}));}catch(e){}
  };

  const wRate   = settings?.waterCostPerL   ?? 0.02;
  const eRate   = settings?.energyCostPerKwh ?? 9.20;
  const dailyKg = rooms * (occ/100) * kgPerRoom;

  const nortkemCPK = (chemicals||[]).reduce((a,ch)=>a+(ch.doseML*(ch.costPerL||0))/1000, 0);
  const marketCPK  = (chemicals||[]).reduce((a,ch)=>a+(ch.doseML*(ch.marketCostPerL??ch.costPerL??0))/1000, 0);
  const ourCPK = nortkemCPK>0 ? nortkemCPK : 1.80;
  const cpk    = marketCPK>0  ? marketCPK  : 2.60;

  const curD      = dailyKg*cpk, ourD=dailyKg*ourCPK;
  const dailySave = curD-ourD, annualSave=dailySave*365;
  const waterSave = dailyKg*52*wRate*0.18*365;
  const energySave= dailyKg*0.07*(eRate/1000)*0.18*365;
  const linenSave = annualSave*0.30;
  const total     = annualSave+waterSave+energySave+linenSave;
  const pctSave   = cpk>0?Math.round((1-ourCPK/cpk)*100):0;
  const today     = new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});

  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData=months.map(m=>({m,cur:Math.round(curD*30),nk:Math.round(ourD*30)}));
  const saves=[
    {l:"Chemicals", amt:annualSave, pct:pctSave, c:C.blue},
    {l:"Water",     amt:waterSave,  pct:18,      c:C.teal},
    {l:"Energy",    amt:energySave, pct:18,      c:C.orange},
    {l:"Linen Life",amt:linenSave,  pct:25,      c:C.green},
  ];
  const maxBar=Math.max(...saves.map(s=>s.amt),1);
  const maxMo =Math.max(...chartData.map(d=>Math.max(d.cur,d.nk)),1);

  // ── PRINT PDF ─────────────────────────────────────────────────
  const printPDF = () => {
    const appName = settings?.appName || 'NORTKEM WASH IQ';
    const seed = user.property?.charCodeAt(0)??65;
    const chemRows = (chemicals||[]).map(ch => {
      const mP = ch.marketCostPerL ?? ch.costPerL;
      const pct = mP>0 ? Math.round((1-ch.costPerL/mP)*100) : 0;
      return `<tr>
        <td>${ch.name.replace('Nortkem ','')}</td>
        <td style="text-align:center">${ch.doseML} mL/kg</td>
        <td style="text-align:right;color:#FF3B30">&#8369;${mP}/L</td>
        <td style="text-align:right;color:#1A6FDB;font-weight:700">&#8369;${ch.costPerL}/L</td>
        <td style="text-align:right;color:#FF3B30">&#8369;${(ch.doseML*mP/1000).toFixed(4)}/kg</td>
        <td style="text-align:right;color:#1A6FDB;font-weight:700">&#8369;${(ch.doseML*ch.costPerL/1000).toFixed(4)}/kg</td>
        <td style="text-align:center;color:#34C759;font-weight:800">${pct}%</td>
      </tr>`;
    }).join('');
    const maxBarAmt = Math.max(...saves.map(s=>s.amt),1);
    const saveBars = saves.map(s=>{
      const w=Math.round((s.amt/maxBarAmt)*100);
      const hex=s.c;
      return `<div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px">
          <span style="font-weight:700">${s.l}</span>
          <span style="color:${hex};font-weight:800">&#8369;${(s.amt/1000).toFixed(1)}K/yr &nbsp;&#8209;${s.pct}%</span>
        </div>
        <div style="background:#E5E5EA;border-radius:6px;height:16px;overflow:hidden">
          <div style="width:${w}%;height:16px;background:${hex};border-radius:6px"></div>
        </div>
      </div>`;
    }).join('');
    const moRows = chartData.map(d=>`<tr>
      <td>${d.m}</td>
      <td style="text-align:right;color:#FF3B30">&#8369;${d.cur.toLocaleString()}</td>
      <td style="text-align:right;color:#1A6FDB">&#8369;${d.nk.toLocaleString()}</td>
      <td style="text-align:right;color:#34C759;font-weight:700">&#8369;${(d.cur-d.nk).toLocaleString()}</td>
    </tr>`).join('');

    const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${appName} – Savings Report – ${hotel}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#fff;color:#111;font-size:13px;line-height:1.5}
.cover{background:linear-gradient(135deg,#1C2B4A,#1A6FDB);color:#fff;padding:40px 32px 36px;page-break-after:always}
.cover h1{font-size:30px;font-weight:900;margin:12px 0 6px;letter-spacing:-0.02em}
.cover .sub{font-size:13px;opacity:0.65;margin-bottom:20px}
.prop{background:rgba(255,255,255,0.12);border-radius:10px;padding:14px 18px}
.prop h2{font-size:17px;font-weight:800;margin-bottom:4px}
.hero{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0 0}
.ha{background:#1A6FDB;border-radius:12px;padding:18px;text-align:center;color:#fff}
.hb{background:#34C759;border-radius:12px;padding:18px;text-align:center;color:#fff}
.big{font-size:36px;font-weight:900;letter-spacing:-0.03em}
.sm{font-size:11px;opacity:0.75;margin-top:3px}
.kpis{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:14px}
.kpi{background:rgba(255,255,255,0.12);border-radius:10px;padding:12px;text-align:center}
.kpi .v{font-size:20px;font-weight:900}
.kpi .l{font-size:10px;opacity:0.6;margin-top:2px;text-transform:uppercase;letter-spacing:0.05em}
.section{padding:24px 32px;page-break-inside:avoid}
.section h2{font-size:18px;font-weight:900;color:#1C2B4A;margin-bottom:4px;border-bottom:2px solid #1A6FDB;padding-bottom:8px}
.section .desc{font-size:11px;color:#8E8E93;margin:6px 0 16px}
.sboxes{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.sbox{background:#F2F2F7;border-radius:10px;padding:12px;text-align:center}
.sbox .v{font-size:15px;font-weight:900}
.sbox .l{font-size:9px;color:#8E8E93;text-transform:uppercase;margin-top:3px;letter-spacing:0.05em}
table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px}
th{background:#1C2B4A;color:#fff;padding:8px 10px;font-size:10px;font-weight:700;text-align:left;text-transform:uppercase}
td{padding:7px 10px;border-bottom:1px solid #F0F0F0}
tr:nth-child(even) td{background:#F9F9FB}
.total-row td{background:#EBF5FF!important;font-weight:900;border-top:2px solid #1A6FDB}
.note{font-size:10px;color:#8E8E93;margin-top:6px}
.total-box{background:#1C2B4A;border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-top:10px;color:#fff}
.rec{display:flex;gap:12px;margin-bottom:14px;align-items:flex-start}
.num{width:26px;height:26px;border-radius:50%;background:#1A6FDB;color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.rec h4{font-size:13px;font-weight:800;color:#1C2B4A;margin-bottom:2px}
.rec p{font-size:12px;color:#636366}
.footer{background:#1C2B4A;color:rgba(255,255,255,0.5);text-align:center;padding:14px;font-size:10px;margin-top:0}
@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .no-print{display:none!important}
  .cover{page-break-after:always}
}
</style>
</head><body>

<!-- COVER PAGE -->
<div class="cover">
  <div style="font-size:10px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em">${appName} &middot; Laundry Intelligence v3.2</div>
  <h1>Savings &amp; Cost Analysis Report</h1>
  <div class="sub">Chemical Cost Comparison vs Competitor Market Pricing</div>
  <div class="prop">
    <h2>${hotel}</h2>
    <div style="opacity:0.7;font-size:12px">${rooms} rooms &middot; ${occ}% occupancy &middot; ${dailyKg.toFixed(0)} kg/day &middot; ${today}</div>
    <div style="opacity:0.5;font-size:11px;margin-top:3px">Prepared by: ${user.name} &middot; ${user.role}</div>
  </div>
  <div class="hero">
    <div class="ha"><div class="sm">ANNUAL SAVINGS</div><div class="big">&#8369;${(total/1000).toFixed(1)}K</div><div class="sm">for ${hotel}</div></div>
    <div class="hb"><div class="sm">COST REDUCTION</div><div class="big">${pctSave}%</div><div class="sm">vs competitor pricing</div></div>
  </div>
  <div class="kpis">
    <div class="kpi"><div class="v">&#8369;${dailySave.toFixed(0)}</div><div class="l">Daily Savings</div></div>
    <div class="kpi"><div class="v">&#8369;${(total/12/1000).toFixed(1)}K</div><div class="l">Monthly Savings</div></div>
    <div class="kpi"><div class="v">&lt;3 mo</div><div class="l">ROI Payback</div></div>
  </div>
</div>

<!-- CHEMICAL COMPARISON -->
<div class="section">
  <h2>Chemical Price Comparison</h2>
  <div class="desc">Competitor market pricing vs NORTKEM pricing — per litre and per kg of linen processed</div>
  <div class="sboxes">
    <div class="sbox"><div class="v" style="color:#FF3B30">&#8369;${cpk.toFixed(4)}</div><div class="l">Competitor /kg</div></div>
    <div class="sbox"><div class="v" style="color:#1A6FDB">&#8369;${ourCPK.toFixed(4)}</div><div class="l">NORTKEM /kg</div></div>
    <div class="sbox"><div class="v" style="color:#34C759">&#8369;${(cpk-ourCPK).toFixed(4)}</div><div class="l">Savings /kg</div></div>
    <div class="sbox"><div class="v" style="color:#34C759">${pctSave}%</div><div class="l">Reduction</div></div>
  </div>
  <table>
    <thead><tr><th>Product</th><th>Dose</th><th style="text-align:right">Comp. &#8369;/L</th><th style="text-align:right">NK &#8369;/L</th><th style="text-align:right">Comp. /kg</th><th style="text-align:right">NK /kg</th><th style="text-align:center">Saved</th></tr></thead>
    <tbody>
      ${chemRows}
      <tr class="total-row">
        <td colspan="2"><strong>TOTAL (all chemicals)</strong></td>
        <td style="text-align:right;color:#FF3B30">&#8369;${cpk.toFixed(4)}/kg</td>
        <td style="text-align:right;color:#1A6FDB">&#8369;${ourCPK.toFixed(4)}/kg</td>
        <td></td><td></td>
        <td style="text-align:center;color:#34C759">${pctSave}%</td>
      </tr>
    </tbody>
  </table>
  <p class="note">* Competitor pricing from user-entered market rates in Chemicals tab. NORTKEM pricing reflects actual product costs.</p>
</div>

<!-- SAVINGS BREAKDOWN -->
<div class="section">
  <h2>Annual Savings Breakdown</h2>
  <div class="desc">Total estimated annual savings for ${hotel}: &#8369;${(total/1000).toFixed(1)}K</div>
  ${saveBars}
  <div class="total-box">
    <span style="font-size:15px;font-weight:800">TOTAL ANNUAL SAVINGS</span>
    <span style="font-size:24px;font-weight:900">&#8369;${(total/1000).toFixed(1)}K</span>
  </div>
  <br>
  <table>
    <thead><tr><th>Category</th><th>How Calculated</th><th style="text-align:right">Annual Amount</th><th style="text-align:center">Reduction</th></tr></thead>
    <tbody>
      <tr><td>Chemical Costs</td><td>&#8369;${cpk.toFixed(3)} vs &#8369;${ourCPK.toFixed(3)} &times; ${dailyKg.toFixed(0)} kg/day &times; 365</td><td style="text-align:right;color:#1A6FDB;font-weight:700">&#8369;${annualSave.toFixed(0)}</td><td style="text-align:center;color:#34C759">${pctSave}%</td></tr>
      <tr><td>Water Savings</td><td>${dailyKg.toFixed(0)} kg/day &times; 52L/kg &times; &#8369;${wRate}/L &times; 18% &times; 365</td><td style="text-align:right;color:#1A6FDB;font-weight:700">&#8369;${waterSave.toFixed(0)}</td><td style="text-align:center;color:#34C759">18%</td></tr>
      <tr><td>Energy Savings</td><td>${dailyKg.toFixed(0)} kg/day &times; 0.07kWh/kg &times; &#8369;${eRate}/kWh &times; 18% &times; 365</td><td style="text-align:right;color:#1A6FDB;font-weight:700">&#8369;${energySave.toFixed(0)}</td><td style="text-align:center;color:#34C759">18%</td></tr>
      <tr><td>Linen Life Extension</td><td>30% of chemical savings (reduced rewash &amp; fabric protection)</td><td style="text-align:right;color:#1A6FDB;font-weight:700">&#8369;${linenSave.toFixed(0)}</td><td style="text-align:center;color:#34C759">25%</td></tr>
      <tr class="total-row"><td><strong>TOTAL</strong></td><td></td><td style="text-align:right;color:#1A6FDB">&#8369;${total.toFixed(0)}</td><td style="text-align:center;color:#34C759">${pctSave}% avg</td></tr>
    </tbody>
  </table>
</div>

<!-- MONTHLY PROJECTION -->
<div class="section">
  <h2>Monthly Cost Projection</h2>
  <div class="desc">12-month comparison: Competitor (red) vs NORTKEM (blue)</div>
  <table>
    <thead><tr><th>Month</th><th style="text-align:right">Competitor (&#8369;)</th><th style="text-align:right">NORTKEM (&#8369;)</th><th style="text-align:right">Monthly Savings</th></tr></thead>
    <tbody>${moRows}</tbody>
    <tfoot><tr class="total-row">
      <td><strong>ANNUAL</strong></td>
      <td style="text-align:right;color:#FF3B30">&#8369;${(chartData.reduce((a,d)=>a+d.cur,0)).toLocaleString()}</td>
      <td style="text-align:right;color:#1A6FDB">&#8369;${(chartData.reduce((a,d)=>a+d.nk,0)).toLocaleString()}</td>
      <td style="text-align:right;color:#34C759">&#8369;${(chartData.reduce((a,d)=>a+d.cur-d.nk,0)).toLocaleString()}</td>
    </tr></tfoot>
  </table>
</div>

<!-- PROPERTY SUMMARY -->
<div class="section">
  <h2>Property Summary</h2>
  <table>
    <tbody>
      ${[['Property',hotel],['Prepared By',`${user.name} · ${user.role}`],['Rooms',`${rooms} rooms`],['Occupancy',`${occ}%`],['Linen/Day',`${dailyKg.toFixed(1)} kg/day`],['Annual Volume',`${(dailyKg*365/1000).toFixed(1)} metric tons/yr`],['Water Rate',`&#8369;${wRate}/L`],['Electricity',`&#8369;${eRate}/kWh`],['Report Date',today]].map(([k,v])=>`<tr><td style="font-weight:700;color:#636366;width:35%">${k}</td><td>${v}</td></tr>`).join('')}
    </tbody>
  </table>
</div>

<!-- RECOMMENDATIONS -->
<div class="section">
  <h2>Recommendations</h2>
  ${[
    ['Switch to NORTKEM Chemicals',`Replacing competitor chemicals reduces cost from &#8369;${cpk.toFixed(3)}/kg to &#8369;${ourCPK.toFixed(3)}/kg — a ${pctSave}% reduction saving &#8369;${dailySave.toFixed(0)}/day.`],
    ['Maintain Proper Dosing','Use the Simulator tab to verify optimal dose (mL/kg) per linen type. Under-dosing causes rewash (2× cost); over-dosing wastes chemicals.'],
    ['Monitor Rewash Rate',`Target under 2% rewash. Every 1% increase adds ≈&#8369;${Math.round(dailyKg*0.01*ourCPK*365).toLocaleString()}/year in extra costs.`],
    ['Optimize Water & Energy',`Estimated &#8369;${waterSave.toFixed(0)}/yr water savings and &#8369;${energySave.toFixed(0)}/yr energy savings available through cycle optimization.`],
    ['Schedule Quarterly Reviews','Review chemical pricing every quarter. With competitor prices rising, the savings gap typically widens over time.'],
  ].map(([t,b],i)=>`<div class="rec"><div class="num">${i+1}</div><div><h4>${t}</h4><p>${b}</p></div></div>`).join('')}
</div>

<div class="footer">
  ${appName} &middot; Ecolab Benchmarked &middot; TRSA Standard &middot; DOH Compliant &middot; Pampanga, Philippines<br>
  Savings projections are estimates based on provided inputs. Generated ${today}
</div>

<script>window.onload=function(){window.print();}</script>
</body></html>`;

    try {
      const blob = new Blob([html], {type:'text/html;charset=utf-8'});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `NORTKEM_Savings_${hotel.replace(/\s+/g,'_')}_${new Date().getFullYear()}.html`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url), 2000);
    } catch(e) {
      alert('Download failed. Please screenshot the report sections above.');
    }
  };

  // ── FULL-SCREEN REPORT OVERLAY ───────────────────────────────
  if (showReport) {
    return (
      <div style={{position:"fixed",inset:0,background:C.bg,zIndex:9999,overflowY:"auto",fontFamily:F}}>
        {/* Sticky header */}
        <div style={{position:"sticky",top:0,zIndex:10,background:C.navy,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setShowReport(false)}
            style={{background:"rgba(255,255,255,0.12)",border:"none",color:"#fff",borderRadius:10,padding:"7px 13px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F}}>
            ← Back
          </button>
          <div style={{flex:1,color:"#fff",fontSize:14,fontWeight:800}}>Savings Report</div>
          <button onClick={printPDF}
            style={{background:"#fff",border:"none",color:C.navy,borderRadius:10,padding:"7px 13px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            ⬇️ Download Report
          </button>
        </div>

        {/* COVER BANNER */}
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.blue})`,padding:"28px 20px 24px"}}>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>
            {settings?.appName||"NORTKEM WASH IQ"} · Laundry Intelligence v3.2
          </div>
          <div style={{color:"#fff",fontSize:26,fontWeight:900,lineHeight:1.2,marginBottom:4}}>Savings &amp; Cost Analysis Report</div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:16}}>Chemical Cost Comparison vs Current Market Pricing</div>
          <div style={{background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"12px 16px"}}>
            <div style={{color:"#fff",fontSize:15,fontWeight:800}}>{hotel}</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginTop:2}}>{rooms} rooms · {occ}% occupancy · {dailyKg.toFixed(0)} kg/day</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:2}}>Prepared by: {user.name} · {user.role} · {today}</div>
          </div>
        </div>

        {/* HERO KPIs */}
        <div style={{padding:"16px 16px 0"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{background:C.blue,borderRadius:16,padding:"18px 16px",textAlign:"center"}}>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Annual Savings</div>
              <div style={{color:"#fff",fontSize:32,fontWeight:900,letterSpacing:"-0.03em"}}>₱{(total/1000).toFixed(1)}K</div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginTop:2}}>for {hotel}</div>
            </div>
            <div style={{background:C.green,borderRadius:16,padding:"18px 16px",textAlign:"center"}}>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Cost Reduction</div>
              <div style={{color:"#fff",fontSize:40,fontWeight:900}}>{pctSave}%</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,marginTop:2}}>vs competitor pricing</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[{l:"Daily",v:`₱${dailySave.toFixed(0)}`},{l:"Monthly",v:`₱${(total/12/1000).toFixed(1)}K`},{l:"ROI",v:"< 3 mo"}].map(k=>(
              <div key={k.l} style={{background:C.card,borderRadius:12,padding:"12px 10px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{color:C.blue,fontSize:16,fontWeight:900}}>{k.v}</div>
                <div style={{color:C.textMuted,fontSize:9,fontWeight:700,textTransform:"uppercase",marginTop:3}}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* CHEMICAL PRICE COMPARISON */}
          <div style={{marginBottom:20}}>
            <div style={{color:C.navy,fontSize:16,fontWeight:900,marginBottom:4}}>Chemical Price Comparison</div>
            <div style={{color:C.textMuted,fontSize:11,marginBottom:12}}>Competitor pricing vs NORTKEM pricing</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[{l:"Competitor /kg",v:`₱${cpk.toFixed(3)}`,c:C.red},{l:"NORTKEM /kg",v:`₱${ourCPK.toFixed(3)}`,c:C.blue},{l:"Savings /kg",v:`₱${(cpk-ourCPK).toFixed(3)}`,c:C.green},{l:"Reduction",v:`${pctSave}%`,c:C.green}].map(s=>(
                <div key={s.l} style={{background:C.card,borderRadius:10,padding:"10px 8px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div style={{color:s.c,fontSize:13,fontWeight:900}}>{s.v}</div>
                  <div style={{color:C.textMuted,fontSize:8,fontWeight:700,textTransform:"uppercase",marginTop:3,lineHeight:1.3}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.card,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",background:C.navy,padding:"9px 14px"}}>
                {["Product","Comp. ₱/L","NK ₱/L","Save%"].map(h=>(
                  <div key={h} style={{color:"rgba(255,255,255,0.7)",fontSize:9,fontWeight:700,textTransform:"uppercase",textAlign:h==="Product"?"left":"right"}}>{h}</div>
                ))}
              </div>
              {(chemicals||[]).map((ch,i,a)=>{
                const mP=ch.marketCostPerL??ch.costPerL;
                const pct=mP>0?Math.round((1-ch.costPerL/mP)*100):0;
                return (
                  <div key={ch.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"10px 14px",borderBottom:i<a.length-1?`1px solid ${C.borderLight}`:"none",background:i%2===0?C.card:"#F9F9FB",alignItems:"center"}}>
                    <div>
                      <div style={{color:C.text,fontSize:11,fontWeight:700}}>{ch.name.replace("Nortkem ","")}</div>
                      <div style={{color:C.textMuted,fontSize:9}}>{ch.doseML} mL/kg</div>
                    </div>
                    <div style={{textAlign:"right",color:C.red,fontSize:12,fontWeight:700}}>₱{mP}</div>
                    <div style={{textAlign:"right",color:C.blue,fontSize:12,fontWeight:800}}>₱{ch.costPerL}</div>
                    <div style={{textAlign:"right",color:C.green,fontSize:11,fontWeight:800}}>{pct>0?`-${pct}%`:"-"}</div>
                  </div>
                );
              })}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"11px 14px",borderTop:`2px solid ${C.border}`,background:"#EBF5FF"}}>
                <div style={{color:C.text,fontSize:12,fontWeight:900}}>TOTAL /kg</div>
                <div style={{textAlign:"right",color:C.red,fontSize:13,fontWeight:900}}>₱{cpk.toFixed(3)}</div>
                <div style={{textAlign:"right",color:C.blue,fontSize:13,fontWeight:900}}>₱{ourCPK.toFixed(3)}</div>
                <div style={{textAlign:"right",color:C.green,fontSize:12,fontWeight:900}}>-{pctSave}%</div>
              </div>
            </div>
          </div>

          {/* SAVINGS BREAKDOWN */}
          <div style={{marginBottom:20}}>
            <div style={{color:C.navy,fontSize:16,fontWeight:900,marginBottom:4}}>Annual Savings Breakdown</div>
            <div style={{color:C.textMuted,fontSize:11,marginBottom:12}}>Total: ₱{(total/1000).toFixed(1)}K/year for {hotel}</div>
            <div style={{background:C.card,borderRadius:14,padding:"16px",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:12}}>
              {saves.map(s=>{
                const w=Math.round((s.amt/maxBar)*100);
                return (
                  <div key={s.l} style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{color:C.text,fontSize:13,fontWeight:700}}>{s.l}</span>
                      <span style={{color:s.c,fontSize:13,fontWeight:800}}>₱{(s.amt/1000).toFixed(1)}K/yr &nbsp;-{s.pct}%</span>
                    </div>
                    <div style={{background:C.bg,borderRadius:6,height:12,overflow:"hidden"}}>
                      <div style={{width:`${w}%`,height:"100%",background:s.c,borderRadius:6}}/>
                    </div>
                  </div>
                );
              })}
              <div style={{background:C.navy,borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
                <div style={{color:"#fff",fontSize:13,fontWeight:800}}>TOTAL ANNUAL SAVINGS</div>
                <div style={{color:"#fff",fontSize:22,fontWeight:900}}>₱{(total/1000).toFixed(1)}K</div>
              </div>
            </div>
            <div style={{background:C.card,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",background:C.navy,padding:"9px 14px"}}>
                {["Category","Annual Savings","Reduction"].map(h=>(
                  <div key={h} style={{color:"rgba(255,255,255,0.7)",fontSize:9,fontWeight:700,textTransform:"uppercase",textAlign:h==="Category"?"left":"right"}}>{h}</div>
                ))}
              </div>
              {[
                ["Chemicals",   annualSave, `${pctSave}%`],
                ["Water",       waterSave,  "18%"],
                ["Energy",      energySave, "18%"],
                ["Linen Life",  linenSave,  "25%"],
              ].map(([lbl,amt,pct],i)=>(
                <div key={lbl} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",padding:"10px 14px",borderBottom:`1px solid ${C.borderLight}`,background:i%2===0?C.card:"#F9F9FB"}}>
                  <div style={{color:C.text,fontSize:12,fontWeight:600}}>{lbl}</div>
                  <div style={{textAlign:"right",color:C.blue,fontSize:12,fontWeight:800}}>₱{amt.toFixed(0)}</div>
                  <div style={{textAlign:"right",color:C.green,fontSize:12,fontWeight:700}}>{pct}</div>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",padding:"12px 14px",borderTop:`2px solid ${C.border}`,background:"#EBF5FF"}}>
                <div style={{color:C.text,fontSize:13,fontWeight:900}}>TOTAL</div>
                <div style={{textAlign:"right",color:C.blue,fontSize:14,fontWeight:900}}>₱{total.toFixed(0)}</div>
                <div style={{textAlign:"right",color:C.green,fontSize:12,fontWeight:900}}>{pctSave}% avg</div>
              </div>
            </div>
          </div>

          {/* MONTHLY CHART */}
          <div style={{marginBottom:20}}>
            <div style={{color:C.navy,fontSize:16,fontWeight:900,marginBottom:4}}>Monthly Cost Projection</div>
            <div style={{color:C.textMuted,fontSize:11,marginBottom:12}}>12-month: Competitor (red) vs NORTKEM (blue)</div>
            <div style={{background:C.card,borderRadius:14,padding:"16px",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"flex-end",gap:3,height:100,marginBottom:8}}>
                {chartData.map(d=>{
                  const hC=Math.round((d.cur/maxMo)*90);
                  const hN=Math.round((d.nk/maxMo)*90);
                  return (
                    <div key={d.m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{display:"flex",alignItems:"flex-end",gap:1,height:90}}>
                        <div style={{width:7,background:C.red,height:hC,borderRadius:"2px 2px 0 0",opacity:0.75}}/>
                        <div style={{width:7,background:C.blue,height:hN,borderRadius:"2px 2px 0 0"}}/>
                      </div>
                      <div style={{color:C.textMuted,fontSize:7}}>{d.m}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:4}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:C.red,borderRadius:3,opacity:0.75}}/><span style={{fontSize:11,color:C.textMuted}}>Competitor</span></div>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:C.blue,borderRadius:3}}/><span style={{fontSize:11,color:C.textMuted}}>NORTKEM</span></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
                <div style={{background:`${C.red}10`,borderRadius:10,padding:"11px",textAlign:"center"}}>
                  <div style={{color:C.textMuted,fontSize:9}}>Competitor /kg</div>
                  <div style={{color:C.red,fontSize:18,fontWeight:900}}>₱{cpk.toFixed(3)}</div>
                </div>
                <div style={{background:`${C.blue}10`,borderRadius:10,padding:"11px",textAlign:"center"}}>
                  <div style={{color:C.textMuted,fontSize:9}}>NORTKEM /kg</div>
                  <div style={{color:C.blue,fontSize:18,fontWeight:900}}>₱{ourCPK.toFixed(3)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* PROPERTY SUMMARY */}
          <div style={{marginBottom:20}}>
            <div style={{color:C.navy,fontSize:16,fontWeight:900,marginBottom:12}}>Property Summary</div>
            <div style={{background:C.card,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
              {[
                ["Property",       hotel],
                ["Prepared By",    `${user.name} · ${user.role}`],
                ["Rooms",          `${rooms} rooms`],
                ["Occupancy",      `${occ}%`],
                ["Linen/Day",      `${dailyKg.toFixed(1)} kg/day`],
                ["Annual Volume",  `${(dailyKg*365/1000).toFixed(1)} metric tons/yr`],
                ["Water Rate",     `₱${wRate}/L`],
                ["Electricity",    `₱${eRate}/kWh`],
                ["Report Date",    today],
              ].map(([k,v],i,a)=>(
                <div key={k} style={{display:"flex",padding:"10px 16px",borderBottom:i<a.length-1?`1px solid ${C.borderLight}`:"none",background:i%2===0?C.card:"#F9F9FB"}}>
                  <div style={{color:C.textMuted,fontSize:12,fontWeight:700,width:"42%"}}>{k}</div>
                  <div style={{color:C.text,fontSize:12,flex:1}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div style={{marginBottom:24}}>
            <div style={{color:C.navy,fontSize:16,fontWeight:900,marginBottom:12}}>Recommendations</div>
            {[
              ["Switch to NORTKEM Chemicals", `Replacing competitor chemicals reduces cost from ₱${cpk.toFixed(3)}/kg to ₱${ourCPK.toFixed(3)}/kg — a ${pctSave}% reduction saving ₱${dailySave.toFixed(0)}/day.`],
              ["Maintain Proper Dosing", "Use the Simulator tab to verify optimal dose (mL/kg) per linen type. Under-dosing causes rewash (2× cost); over-dosing wastes chemicals."],
              ["Monitor Rewash Rate", `Target under 2% rewash rate. Every 1% increase adds ≈₱${Math.round(dailyKg*0.01*ourCPK*365).toLocaleString()}/year in extra costs.`],
              ["Optimize Water & Energy", `Estimated ₱${waterSave.toFixed(0)}/yr water savings and ₱${energySave.toFixed(0)}/yr energy savings available through cycle temperature and rinse volume optimization.`],
              ["Schedule Quarterly Reviews", "Review chemical pricing every quarter. With competitor prices rising, the savings gap typically widens over time."],
            ].map(([t,b],i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}>
                <div style={{width:26,height:26,borderRadius:13,background:C.blue,color:"#fff",fontSize:12,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>{i+1}</div>
                <div>
                  <div style={{color:C.navy,fontSize:13,fontWeight:800,marginBottom:3}}>{t}</div>
                  <div style={{color:C.textSub,fontSize:12,lineHeight:1.5}}>{b}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div style={{background:C.navy,borderRadius:14,padding:"16px 20px",marginBottom:32,textAlign:"center"}}>
            <div style={{color:"#fff",fontSize:12,fontWeight:700,marginBottom:4}}>{settings?.appName||"NORTKEM WASH IQ"}</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:10,lineHeight:1.6}}>
              Ecolab Benchmarked · TRSA Standard · DOH Compliant · Pampanga, Philippines<br/>
              Savings projections are estimates based on provided inputs. {today}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN SAVINGS VIEW ────────────────────────────────────────
  return (
    <div>
      <SectionHead title="Savings Report" subtitle="Based on your real chemical prices"/>

      {/* View Report button */}
      <div style={{marginBottom:14}}>
        <button onClick={()=>{ setShowReport(true); if(onViewReport) onViewReport(); }}
          style={{width:"100%",padding:"15px 20px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 16px rgba(26,111,219,0.28)"}}>
          <span style={{fontSize:20}}>📊</span> View Full Report
        </button>
        <div style={{textAlign:"center",color:C.textMuted,fontSize:11,fontFamily:F,marginTop:7}}>
          Opens the full savings report inside the app
        </div>
      </div>

      <div style={{marginBottom:16}}><Seg options={["Report","Inputs","Chart"]} value={tab} onChange={setTab}/></div>

      {tab==="Inputs"&&(
        <Card>
          <Input label="Property Name" value={hotel} onChange={setHotel} type="text"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Rooms" value={rooms} onChange={setRooms} min={10} max={2000} small/>
            <Input label="Occupancy %" value={occ} onChange={setOcc} min={10} max={100} suffix="%" small/>
            <div style={{gridColumn:"1/-1"}}><Input label="Kg linen per occupied room/day" value={kgPerRoom} onChange={setKgPerRoom} min={1} max={30} step={0.5} suffix="kg" note="Industry avg: 7 kg/room/day (Ecolab)"/></div>
          </div>
          <button onClick={async()=>{await saveSavingsInputs();}}
            style={{width:"100%",padding:"11px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.navy},${C.blue})`,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:F,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            💾 Save Inputs
          </button>
          <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <div style={{color:C.textSub,fontSize:12,fontWeight:700,fontFamily:F,marginBottom:10}}>📊 Prices pulled from Chemicals tab:</div>
            {(chemicals||[]).map(ch=>{
              const mPrice=ch.marketCostPerL??ch.costPerL;
              const diff=mPrice-ch.costPerL;
              return (
                <div key={ch.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:8,marginBottom:8,borderBottom:`1px solid ${C.borderLight}`}}>
                  <span style={{color:C.text,fontSize:12,fontFamily:F,flex:1}}>{ch.name}</span>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{color:C.red,fontSize:12,fontFamily:F}}>₱{mPrice}/L</span>
                    <span style={{color:C.textMuted,fontSize:11}}>→</span>
                    <span style={{color:C.blue,fontSize:12,fontWeight:700,fontFamily:F}}>₱{ch.costPerL}/L</span>
                    {diff>0&&<span style={{color:C.green,fontSize:10,fontWeight:700,fontFamily:F}}>-₱{diff}</span>}
                  </div>
                </div>
              );
            })}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{color:C.textSub,fontSize:13,fontWeight:700,fontFamily:F}}>Total chem cost/kg</span>
              <div style={{display:"flex",gap:12}}>
                <span style={{color:C.red,fontSize:13,fontWeight:700,fontFamily:F}}>₱{cpk.toFixed(3)}/kg</span>
                <span style={{color:C.blue,fontSize:13,fontWeight:700,fontFamily:F}}>₱{ourCPK.toFixed(3)}/kg</span>
              </div>
            </div>
          </div>
          <Btn onClick={()=>setTab("Report")} full>View Report →</Btn>
        </Card>
      )}

      {tab==="Report"&&(
        <>
          <Card style={{marginBottom:14,background:`linear-gradient(135deg,${C.navy},${C.navyMid})`,border:"none"}}>
            <div style={{textAlign:"center",padding:"6px 0"}}>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:F,marginBottom:6}}>Estimated Annual Savings</div>
              <div style={{color:"#fff",fontSize:42,fontWeight:800,fontFamily:F,letterSpacing:"-0.03em"}}>₱{(total/1000).toFixed(1)}K</div>
              <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,fontFamily:F,marginTop:4}}>for {hotel}</div>
              <div style={{display:"flex",justifyContent:"center",gap:18,marginTop:16}}>
                {[{l:"Per day",v:`₱${dailySave.toFixed(0)}`},{l:"Per month",v:`₱${(total/12/1000).toFixed(1)}K`},{l:"Reduction",v:`${pctSave}%`}].map((s,i,a)=>(
                  <div key={s.l} style={{display:"flex",alignItems:"center",gap:18}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{color:"#fff",fontWeight:800,fontSize:16,fontFamily:F}}>{s.v}</div>
                      <div style={{color:"rgba(255,255,255,0.45)",fontSize:10,fontFamily:F}}>{s.l}</div>
                    </div>
                    {i<a.length-1&&<div style={{width:1,height:26,background:"rgba(255,255,255,0.15)"}}/>}
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card style={{marginBottom:14}}>
            <Label>Chemical Price Comparison</Label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,marginBottom:8}}>
              {["Product","Competitor","NORTKEM"].map(h=>(
                <div key={h} style={{color:C.textMuted,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F,paddingBottom:8,borderBottom:`1px solid ${C.border}`,textAlign:h==="Product"?"left":"right"}}>{h}</div>
              ))}
            </div>
            {(chemicals||[]).map((ch,i,a)=>{
              const mPrice=ch.marketCostPerL??ch.costPerL;
              const pct=mPrice>0?Math.round((1-ch.costPerL/mPrice)*100):0;
              return (
                <div key={ch.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,padding:"9px 0",borderBottom:i<a.length-1?`1px solid ${C.borderLight}`:"none",alignItems:"center"}}>
                  <div>
                    <div style={{color:C.text,fontSize:12,fontWeight:600,fontFamily:F}}>{ch.name.replace("Nortkem ","")}</div>
                    <div style={{color:C.textMuted,fontSize:10,fontFamily:F}}>{ch.doseML} mL/kg</div>
                  </div>
                  <div style={{textAlign:"right",color:C.red,fontSize:13,fontWeight:700,fontFamily:F}}>₱{mPrice}</div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:C.blue,fontSize:13,fontWeight:800,fontFamily:F}}>₱{ch.costPerL}</div>
                    {pct>0&&<div style={{color:C.green,fontSize:9,fontWeight:700,fontFamily:F}}>-{pct}%</div>}
                  </div>
                </div>
              );
            })}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,padding:"11px 0 0",borderTop:`2px solid ${C.border}`,marginTop:4}}>
              <div style={{color:C.text,fontSize:12,fontWeight:800,fontFamily:F}}>Total /kg</div>
              <div style={{textAlign:"right",color:C.red,fontSize:14,fontWeight:800,fontFamily:F}}>₱{cpk.toFixed(3)}</div>
              <div style={{textAlign:"right"}}>
                <div style={{color:C.blue,fontSize:14,fontWeight:800,fontFamily:F}}>₱{ourCPK.toFixed(3)}</div>
                {pctSave>0&&<div style={{color:C.green,fontSize:10,fontWeight:800,fontFamily:F}}>-{pctSave}%</div>}
              </div>
            </div>
          </Card>
          <Card style={{marginBottom:14}}>
            <Label>Savings by Category</Label>
            {saves.map(s=>(
              <div key={s.l} style={{display:"flex",alignItems:"center",gap:12,marginBottom:13}}>
                <div style={{width:30,height:30,borderRadius:8,background:`${s.c}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{s.l==="Chemicals"?"🧪":s.l==="Water"?"💧":s.l==="Energy"?"⚡":"🧺"}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{color:C.textSub,fontSize:13,fontFamily:F}}>{s.l}</span>
                    <span style={{color:s.c,fontSize:13,fontWeight:700,fontFamily:F}}>₱{(s.amt/1000).toFixed(1)}K/yr · -{s.pct}%</span>
                  </div>
                  <div style={{background:C.bg,borderRadius:5,height:6,overflow:"hidden"}}>
                    <div style={{width:`${Math.min(100,s.pct*3.2)}%`,height:"100%",background:s.c,borderRadius:5}}/>
                  </div>
                </div>
              </div>
            ))}
          </Card>
          <Tip color={C.green} text={`At ₱${ourCPK.toFixed(3)}/kg (NORTKEM) vs ₱${cpk.toFixed(3)}/kg (competitor), you save ₱${(total/1000).toFixed(1)}K/year. ROI in under 3 months.`}/>
        </>
      )}

      {tab==="Chart"&&(
        <Card>
          <Label>Monthly Cost Comparison (₱)</Label>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.map(d=>({m:d.m,current:d.cur,nortkem:d.nk}))} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} vertical={false}/>
              <XAxis dataKey="m" tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.textMuted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`₱${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<TTip/>} formatter={v=>`₱${v.toLocaleString()}`}/>
              <Bar dataKey="current" name="Competitor" fill={C.red}  radius={[4,4,0,0]} fillOpacity={0.7}/>
              <Bar dataKey="nortkem" name="NORTKEM"    fill={C.blue} radius={[4,4,0,0]}/>
              <Legend wrapperStyle={{color:C.textMuted,fontSize:11}}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
            <div style={{background:`${C.red}10`,borderRadius:12,padding:"11px 13px",textAlign:"center"}}>
              <div style={{color:C.textMuted,fontSize:10,fontFamily:F}}>Competitor /kg</div>
              <div style={{color:C.red,fontSize:18,fontWeight:800,fontFamily:F}}>₱{cpk.toFixed(3)}</div>
            </div>
            <div style={{background:`${C.blue}10`,borderRadius:12,padding:"11px 13px",textAlign:"center"}}>
              <div style={{color:C.textMuted,fontSize:10,fontFamily:F}}>NORTKEM /kg</div>
              <div style={{color:C.blue,fontSize:18,fontWeight:800,fontFamily:F}}>₱{ourCPK.toFixed(3)}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── ACCOUNT ────────────────────────────────────────────────
function Account({user,setUser,onLogout,linenTypes,chemicals,settings,setSettings,reportCount,daysActive}) {
  const [editProfile, setEditProfile] = useState(false);
  const [editCosts,   setEditCosts]   = useState(false);
  const [pName,  setPName]  = useState(user.property);
  const [pRooms, setPRooms] = useState(user.rooms);
  const [pLabel, setPLabel] = useState(settings.appName || "NORTKEM WASH IQ");
  const [wCost,  setWCost]  = useState(settings.waterCostPerL);
  const [eCost,  setECost]  = useState(settings.energyCostPerKwh);

  const saveProfile = () => {
    setUser(u => ({...u, property:pName, rooms:pRooms}));
    setSettings(s => ({...s, appName:pLabel}));
    setEditProfile(false);
  };
  const saveCosts = () => {
    setSettings(s => ({...s, waterCostPerL:wCost, energyCostPerKwh:eCost}));
    setEditCosts(false);
  };

  const info=[{icon:"💱",l:"Currency",v:"Philippine Peso (₱)"},{icon:"⚖️",l:"Weight",v:"Kilogram (kg)"},{icon:"🧪",l:"Chemicals",v:"mL per kg linen"},{icon:"🌡️",l:"Temperature",v:"Celsius (°C)"},{icon:"💧",l:"Water Volume",v:"Litres (L) · fill level: cm"},{icon:"📐",l:"Standard",v:"Metric System (SI)"},{icon:"📱",l:"Version",v:"NORTKEM WASH IQ v3.2"}];

  return (
    <div>
      <SectionHead title="Account"/>

      {/* Profile card */}
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:15,marginBottom:16}}>
          <div style={{width:56,height:56,borderRadius:17,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.blue,fontFamily:F}}>{user.avatar}</div>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontSize:18,fontWeight:800,fontFamily:F}}>{user.name}</div>
            <div style={{color:C.textSub,fontSize:13,fontFamily:F}}>{user.role}</div>
            <div style={{color:C.blue,fontSize:13,fontFamily:F}}>{user.email}</div>
          </div>
          <button onClick={()=>setEditProfile(v=>!v)} style={{background:editProfile?C.blueLight:C.bg,border:`1.5px solid ${editProfile?C.blue:C.border}`,color:editProfile?C.blue:C.textSub,borderRadius:11,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>{editProfile?"Cancel":"Edit"}</button>
        </div>
        {editProfile ? (
          <div>
            <Input label="Property / Hotel Name" value={pName} onChange={setPName} type="text" small/>
            <Input label="Number of Rooms" value={pRooms} onChange={setPRooms} min={1} max={5000} suffix="rooms" small/>
            <Input label="App Display Name" value={pLabel} onChange={setPLabel} type="text" small note="Shown in top bar and branding"/>
            <Btn onClick={saveProfile} full small>Save Profile</Btn>
          </div>
        ) : (
          <div style={{background:C.bg,borderRadius:12,padding:"11px 15px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:18}}>🏨</span>
            <div style={{flex:1}}>
              <div style={{color:C.text,fontWeight:700,fontSize:14,fontFamily:F}}>{user.property}</div>
              <div style={{color:C.textMuted,fontSize:12,fontFamily:F}}>{user.rooms} rooms · Member since {user.createdAt}</div>
            </div>
            <Badge label="Active" color={C.green}/>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <StatCard label="Linen Types"  value={linenTypes.length}                    color={C.blue}   icon="🧺"/>
        <StatCard label="Chemicals"    value={chemicals.filter(c=>c.active).length} color={C.orange} icon="🧴"/>
        <StatCard label="Reports Run"  value={reportCount}                           color={C.purple} icon="📊"/>
        <StatCard label="Days Active"  value={daysActive}                            color={C.teal}   icon="📅"/>
      </div>

      {/* Cost Settings */}
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:editCosts?14:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>⚙️</span>
            <div>
              <div style={{color:C.text,fontWeight:700,fontSize:14,fontFamily:F}}>Cost Settings</div>
              <div style={{color:C.textMuted,fontSize:11,fontFamily:F}}>Water, energy & chemical rates</div>
            </div>
          </div>
          <button onClick={()=>{ setWCost(settings.waterCostPerL); setECost(settings.energyCostPerKwh); setEditCosts(v=>!v); }} style={{background:editCosts?C.blueLight:C.bg,border:`1.5px solid ${editCosts?C.blue:C.border}`,color:editCosts?C.blue:C.textSub,borderRadius:11,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F}}>{editCosts?"Cancel":"Edit"}</button>
        </div>
        {editCosts ? (
          <div>
            <Input label="Water Cost" value={wCost} onChange={setWCost} min={0} max={50} step={0.001} prefix="₱" suffix="/L" small note="Set 0 to isolate chemical costs only"/>
            <Input label="Electricity Cost" value={eCost} onChange={setECost} min={1} max={50} step={0.1} prefix="₱" suffix="/kWh" small note="Philippine avg: ₱9–₱12 per kWh (Meralco)"/>
            <div style={{background:C.bg,borderRadius:12,padding:"11px 14px",marginBottom:12}}>
              <div style={{color:C.textSub,fontSize:12,fontFamily:F,marginBottom:4}}>Chemical costs are set per-product in the <strong>Chemicals</strong> tab (₱/L).</div>
              <div style={{color:C.textMuted,fontSize:11,fontFamily:F}}>Changes apply immediately to all cost calculations in the Simulator.</div>
            </div>
            <Btn onClick={saveCosts} full small>Save Cost Settings</Btn>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
            {[
              {i:"💧",l:"Water",v:`₱${settings.waterCostPerL.toFixed(3)}/L`,c:C.teal},
              {i:"⚡",l:"Electricity",v:`₱${settings.energyCostPerKwh.toFixed(2)}/kWh`,c:C.orange},
            ].map(s=>(
              <div key={s.l} style={{background:C.bg,borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>{s.i}</span>
                <div>
                  <div style={{color:C.textMuted,fontSize:10,fontFamily:F}}>{s.l}</div>
                  <div style={{color:s.c,fontSize:14,fontWeight:800,fontFamily:F}}>{s.v}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* App info */}
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0 14px",borderBottom:`1px solid ${C.borderLight}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:34,height:34,borderRadius:10,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center"}}><Logo size={24}/></div>
            <div><div style={{color:C.text,fontWeight:700,fontSize:14,fontFamily:F}}>{settings.appName||"NORTKEM WASH IQ"}</div><div style={{color:C.textMuted,fontSize:12,fontFamily:F}}>Laundry Intelligence v3.2</div></div>
          </div>
          <Badge label="PRO" color={C.blue}/>
        </div>
        {info.map((s,i,a)=>(
          <div key={s.l} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<a.length-1?`1px solid ${C.borderLight}`:"none"}}>
            <span style={{fontSize:16,width:22,textAlign:"center"}}>{s.icon}</span>
            <div style={{flex:1}}><div style={{color:C.text,fontSize:14,fontFamily:F}}>{s.l}</div><div style={{color:C.textMuted,fontSize:12,fontFamily:F}}>{s.v}</div></div>
            <span style={{color:C.textMuted,fontSize:16}}>›</span>
          </div>
        ))}
      </Card>

      <Card style={{marginBottom:14,background:`linear-gradient(135deg,${C.blueLight},#fff)`,border:`1px solid ${C.blue}20`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}><Logo size={28}/><div style={{color:C.blue,fontWeight:800,fontSize:14,fontFamily:F}}>About NORTKEM</div></div>
        <div style={{color:C.textSub,fontSize:13,lineHeight:1.7,fontFamily:F}}>NORTKEM provides premium commercial laundry chemicals for hotels, hospitals, and commercial laundries across the Philippines. Solutions are benchmarked against Ecolab, TRSA, and DOH standards.</div>
        <div style={{marginTop:10,display:"flex",gap:7,flexWrap:"wrap"}}><Badge label="Ecolab Benchmarked" color={C.blue}/><Badge label="TRSA Standard" color={C.green}/><Badge label="DOH Compliant" color={C.teal}/><Badge label="Pampanga, PH" color={C.purple}/></div>
      </Card>
      <Btn onClick={onLogout} full color={C.red}>Sign Out</Btn>
    </div>
  );
}

// ─── NAV ────────────────────────────────────────────────────
const NAV=[
  {id:"dashboard",icon:"📊",label:"Home"},
  {id:"formula",  icon:"🧪",label:"Simulator"},
  {id:"linen",    icon:"🧺",label:"Linen Types"},
  {id:"chemicals",icon:"🧴",label:"Chemicals"},
  {id:"process",  icon:"✅",label:"Process"},
  {id:"savings",  icon:"📈",label:"Savings"},
  {id:"account",  icon:"👤",label:"Account"},
];

// ─── ROOT ────────────────────────────────────────────────────
export default function App() {
  const [screen,     setScreen]     = useState("login");
  const [user,       setUser]       = useState(null);
  const [active,     setActive]     = useState("dashboard");
  const [linenTypes, setLinenTypes] = useState(DEFAULT_LINEN_TYPES);
  const [chemicals,  setChemicals]  = useState(DEFAULT_CHEMICALS);
  const [extraUsers, setExtraUsers] = useState([]);
  const [settings,   setSettings]   = useState({ waterCostPerL:0.02, energyCostPerKwh:9.20, appName:"NORTKEM WASH IQ" });
  const [reportCount,setReportCount]= useState(0);
  const [winW,       setWinW]       = useState(typeof window!=="undefined"?window.innerWidth:480);
  const tabRef = useRef(null);

  // ── Load all persisted data on startup ─────────────────
  useEffect(() => {
    (async () => {
      try { const r=await window.storage.get("nortkem_user");      if(r?.value){setUser(JSON.parse(r.value));}} catch(e){}
      try { const r=await window.storage.get("nortkem_users");     if(r?.value){setExtraUsers(JSON.parse(r.value));}} catch(e){}
      try {
        const rv = await window.storage.get("nortkem_chem_version");
        const r  = await window.storage.get("nortkem_chemicals");
        if (rv?.value === CHEM_VERSION && r?.value) {
          setChemicals(JSON.parse(r.value));
        } else {
          // New price list — reset to updated defaults
          await window.storage.set("nortkem_chemicals", JSON.stringify(DEFAULT_CHEMICALS));
          await window.storage.set("nortkem_chem_version", CHEM_VERSION);
          setChemicals(DEFAULT_CHEMICALS);
        }
      } catch(e) {}
      try { const r=await window.storage.get("nortkem_settings");  if(r?.value){setSettings(JSON.parse(r.value));}} catch(e){}
      try { const r=await window.storage.get("nortkem_linen");     if(r?.value){setLinenTypes(JSON.parse(r.value));}} catch(e){}
      try { const r=await window.storage.get("nortkem_reports");   if(r?.value){setReportCount(JSON.parse(r.value));}} catch(e){}
    })();
  }, []);

  // ── Storage helpers ────────────────────────────────────
  const saveChemicals  = async (v) => {
    try {
      await window.storage.set("nortkem_chemicals", JSON.stringify(v));
      await window.storage.set("nortkem_chem_version", CHEM_VERSION);
    } catch(e) {}
  };
  const saveSettings   = async (v) => { try{await window.storage.set("nortkem_settings", JSON.stringify(v));}catch(e){} };
  const saveLinenTypes = async (v) => { try{await window.storage.set("nortkem_linen",    JSON.stringify(v));}catch(e){} };

  const resetChemicals = async () => {
    if(!window.confirm("Reset all chemicals to NORTKEM defaults?")) return;
    setChemicals(DEFAULT_CHEMICALS);
    try {
      await window.storage.set("nortkem_chemicals", JSON.stringify(DEFAULT_CHEMICALS));
      await window.storage.set("nortkem_chem_version", CHEM_VERSION);
    } catch(e) {}
  };

  const incReports = async () => {
    const next = reportCount + 1;
    setReportCount(next);
    try{await window.storage.set("nortkem_reports",JSON.stringify(next));}catch(e){}
  };

  const handleSetSettings = (updater) => {
    setSettings(prev => { const next=typeof updater==="function"?updater(prev):updater; saveSettings(next); return next; });
  };
  const handleSetLinenTypes = (updater) => {
    setLinenTypes(prev => { const next=typeof updater==="function"?updater(prev):updater; saveLinenTypes(next); return next; });
  };
  const handleSetUser = (updater) => {
    setUser(prev => {
      const next=typeof updater==="function"?updater(prev):updater;
      try{window.storage.set("nortkem_user",JSON.stringify(next));}catch(e){}
      return next;
    });
  };

  const handleLogin = (u) => {
    const withDate = {...u, joinDate: u.joinDate||new Date().toISOString().split("T")[0]};
    setUser(withDate);
    try{window.storage.set("nortkem_user",JSON.stringify(withDate));}catch(e){}
  };
  const handleRegister = (u) => {
    const withDate = {...u, joinDate:new Date().toISOString().split("T")[0]};
    const newUsers = [...extraUsers, withDate];
    setExtraUsers(newUsers);
    try{window.storage.set("nortkem_users",JSON.stringify(newUsers));}catch(e){}
    setUser(withDate);
    try{window.storage.set("nortkem_user",JSON.stringify(withDate));}catch(e){}
  };
  const handleLogout = () => {
    setUser(null);
    try{window.storage.delete("nortkem_user");}catch(e){}
    setActive("dashboard");
  };

  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if(!tabRef.current) return;
    const btn = tabRef.current.querySelector(`[data-tab="${active}"]`);
    if(btn) btn.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  }, [active]);

  const isDesktop = winW >= 768;

  if(!user) {
    if(screen==="register") return <RegisterScreen onBack={()=>setScreen("login")} onRegister={handleRegister}/>;
    return <LoginScreen onLogin={handleLogin} onRegister={()=>setScreen("register")} users={extraUsers}/>;
  }

  const appName = settings.appName || "NORTKEM WASH IQ";
  const daysActive = user.joinDate
    ? Math.max(1, Math.round((Date.now()-new Date(user.joinDate).getTime())/(1000*60*60*24)))
    : 1;

  const render = () => {
    switch(active) {
      case "dashboard": return <Dashboard user={user} setActive={setActive} chemicals={chemicals} settings={settings} linenTypes={linenTypes}/>;
      case "formula":   return <FormulaSimulator linenTypes={linenTypes} chemicals={chemicals} settings={settings}/>;
      case "linen":     return <LinenTypes linenTypes={linenTypes} setLinenTypes={handleSetLinenTypes} chemicals={chemicals}/>;
      case "chemicals": return <Chemicals chemicals={chemicals} setChemicals={setChemicals} onSave={saveChemicals} onReset={resetChemicals}/>;
      case "process":   return <Process linenTypes={linenTypes}/>;
      case "savings":   return <Savings user={user} settings={settings} chemicals={chemicals} onViewReport={incReports}/>;
      case "account":   return <Account user={user} setUser={handleSetUser} onLogout={handleLogout} linenTypes={linenTypes} chemicals={chemicals} settings={settings} setSettings={handleSetSettings} reportCount={reportCount} daysActive={daysActive}/>;
      default:          return <Dashboard user={user} setActive={setActive} chemicals={chemicals} settings={settings} linenTypes={linenTypes}/>;
    }
  };

  const globalStyle = `*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#d1d1d6;border-radius:4px}body{background:${C.bg};overscroll-behavior:none}input[type=range]{height:4px}`;

  // ── DESKTOP LAYOUT ──────────────────────────────────────────
  if (isDesktop) {
    return (
      <IsMobile.Provider value={false}>
      <>
      <style>{globalStyle}</style>
      <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:F}}>

        {/* Sidebar */}
        <nav style={{width:224,position:"fixed",top:0,left:0,height:"100vh",background:C.card,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",zIndex:200,boxShadow:"2px 0 16px rgba(0,0,0,0.05)"}}>
          {/* Brand */}
          <div style={{padding:"18px 16px 16px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Logo size={26}/></div>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:C.text,letterSpacing:"-0.02em",lineHeight:1.2}}>{appName}</div>
                <div style={{fontSize:9,color:C.textMuted,fontWeight:500,marginTop:1}}>Laundry Intelligence v3.2</div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div style={{flex:1,padding:"10px 10px",overflowY:"auto"}}>
            {NAV.map(t=>(
              <button key={t.id} onClick={()=>setActive(t.id)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"10px 12px",borderRadius:12,border:"none",background:active===t.id?C.blueLight:"transparent",cursor:"pointer",marginBottom:3,textAlign:"left",transition:"background 0.15s"}}>
                <span style={{fontSize:19,flexShrink:0,filter:active===t.id?"none":"grayscale(40%) opacity(70%)"}}>{t.icon}</span>
                <span style={{color:active===t.id?C.blue:C.textSub,fontSize:13,fontWeight:active===t.id?700:500,fontFamily:F}}>{t.label}</span>
                {active===t.id&&<div style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:C.blue}}/>}
              </button>
            ))}
          </div>

          {/* User info at bottom */}
          <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.blue,fontFamily:F,flexShrink:0}}>{user.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:C.text,fontSize:12,fontWeight:700,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
                <div style={{color:C.textMuted,fontSize:10,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.property}</div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:C.green,flexShrink:0}}/>
            </div>
          </div>
        </nav>

        {/* Main content area */}
        <div style={{marginLeft:224,flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          {/* Top bar */}
          <header style={{background:"rgba(255,255,255,0.94)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"12px 28px",position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>{NAV.find(t=>t.id===active)?.icon}</span>
              <span style={{color:C.text,fontSize:17,fontWeight:700,fontFamily:F,letterSpacing:"-0.02em"}}>{NAV.find(t=>t.id===active)?.label}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:C.greenLight,borderRadius:20,padding:"3px 10px",color:C.green,fontSize:11,fontWeight:700}}>● Live</div>
              <div style={{display:"flex",alignItems:"center",gap:8,background:C.bg,borderRadius:12,padding:"6px 12px",border:`1px solid ${C.border}`}}>
                <div style={{width:26,height:26,borderRadius:8,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.blue,fontFamily:F}}>{user.avatar}</div>
                <div>
                  <div style={{color:C.text,fontSize:11,fontWeight:700,fontFamily:F,lineHeight:1.2}}>{user.name}</div>
                  <div style={{color:C.textMuted,fontSize:9,fontFamily:F}}>{user.property}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main style={{flex:1,padding:"28px 32px 40px",overflowY:"auto"}}>
            <div style={{maxWidth:960,margin:"0 auto"}}>
              {render()}
            </div>
          </main>
        </div>
      </div>
    </>
    </IsMobile.Provider>
  );
  }

  // ── MOBILE LAYOUT ───────────────────────────────────────────
  return (
    <IsMobile.Provider value={true}>
    <>
    <style>{globalStyle}</style>
    <div style={{maxWidth:480,margin:"0 auto",background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:F}}>
      <div style={{background:"rgba(255,255,255,0.94)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"11px 16px",position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Logo size={22}/></div>
          <div><div style={{fontSize:13,fontWeight:800,color:C.text,letterSpacing:"-0.02em",lineHeight:1.2}}>{appName}</div><div style={{fontSize:9,color:C.textMuted,fontWeight:500}}>Metric · kg · L · °C · mL · cm</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{background:C.greenLight,borderRadius:20,padding:"3px 9px",color:C.green,fontSize:10,fontWeight:700}}>● Live</div>
          <div style={{width:30,height:30,borderRadius:9,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.blue,fontFamily:F}}>{user.avatar}</div>
        </div>
      </div>
      <div style={{flex:1,padding:"16px 13px 105px",overflowY:"auto"}}>{render()}</div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:`1px solid ${C.border}`,zIndex:100}}>
        <div ref={tabRef} style={{display:"flex",overflowX:"auto",padding:"4px 2px 8px",scrollbarWidth:"none",msOverflowStyle:"none"}}>
          <style>{`div::-webkit-scrollbar{display:none}`}</style>
          {NAV.map(t=>(
            <button key={t.id} data-tab={t.id} onClick={()=>setActive(t.id)}
              style={{flex:"0 0 auto",minWidth:58,padding:"7px 4px 1px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:40,height:30,borderRadius:10,background:active===t.id?C.blueLight:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}>
                <span style={{fontSize:17,filter:active===t.id?"none":"grayscale(100%) opacity(40%)"}}>{t.icon}</span>
              </div>
              <span style={{fontSize:9,fontWeight:active===t.id?700:400,color:active===t.id?C.blue:C.textMuted,fontFamily:F,whiteSpace:"nowrap"}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
    </>
    </IsMobile.Provider>
  );
}
