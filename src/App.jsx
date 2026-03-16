import { useState, useMemo } from "react";

const POWDER="#89CFF0",NAVY="#1F3864",GREEN="#16a34a",RED="#dc2626",BLUE="#1d4ed8";
const SHIFTS=[{key:"single",label:"Single Shift",hours:8,count:1},{key:"double",label:"Double Shift",hours:16,count:2},{key:"ops24",label:"24hr Ops",hours:24,count:3}];

function peso(v,c=false){if(isNaN(v))return"—";const a=Math.abs(v),n=v<0;let s;if(c){if(a>=1e6)s="₱"+(a/1e6).toFixed(2)+"M";else if(a>=1e3)s="₱"+(a/1e3).toFixed(1)+"K";else s="₱"+a.toFixed(0);}else s="₱"+a.toLocaleString("en-PH",{maximumFractionDigits:0});return n?`(${s})`:s;}
function pct(v){return(v*100).toFixed(1)+"%";}

function calc(a,yi){
  const u=(a.utils[yi]||0)/100,pe=Math.pow(1+a.pe/100,yi),ve=Math.pow(1+a.ve/100,yi),le=Math.pow(1+a.le/100,yi),re=Math.pow(1+a.re/100,yi);
  const sh=SHIFTS.find(s=>s.key===a.shiftType)||SHIFTS[1];
  const gkg=a.hasL?a.lcap*u:0,rkg=gkg*a.rw/100,lkgyr=gkg*a.days*12,tpkgyr=(gkg+rkg)*a.days*12;
  const lrev=lkgyr*a.lp*pe,tvc=(a.e+a.w+a.g+a.ch+a.pk+a.mt+a.ot)*ve,lvc=tpkgyr*tvc,rwcost=rkg*a.days*12*tvc;
  const upcs=a.hasU?a.ucap*sh.hours*u*a.days*12:0,urev=upcs*a.up*pe,uvc=upcs*(a.ue+a.uw+a.uch+a.uo)*ve;
  const rev=lrev+urev,vc=lvc+uvc,roy=rev*a.roy/100,mkt=rev*a.mkt/100;
  const sp=Math.min(a.smax,Math.max(a.smin,Math.round(a.smin+(u-0.15)/0.85*(a.smax-a.smin)))),staff=sp*sh.count;
  const lab=staff*a.dr*le*a.days*12,rnt=a.rent*re*12,ins=a.ins,dep=a.capex*a.dep/100;
  const r=a.ir/100,n=a.lt,pmt=(yi<n&&r>0)?a.loan*r/(1-Math.pow(1+r,-n)):0;
  const ebitda=rev-vc-roy-mkt-lab-rnt-ins,noi=ebitda-dep-pmt;
  return{u,sh,sp,staff,gkg,rkg,lkgyr,lrev,lvc,rwcost,upcs,urev,uvc,rev,vc,roy,mkt,lab,rnt,ins,dep,pmt,ebitda,noi,tvc,em:rev?ebitda/rev:0,nm:rev?noi/rev:0};
}

const D={plantName:"PineWash Angeles",location:"Angeles City, Pampanga",days:30,shiftType:"double",smin:3,smax:8,dr:550,hasL:true,lcap:1000,lp:35,rw:3,e:3.5,w:1.5,g:2.0,ch:2.0,pk:0.5,mt:0.3,ot:0.2,hasU:true,ucap:150,up:80,ue:8,uw:3,uch:12,uo:7,pe:3,ve:4,le:5,re:3,roy:3,mkt:5,capex:15000000,loanMode:"pct",dpct:60,loan:9000000,ir:9,lt:7,dep:5,rent:50000,ins:60000,utils:[15,30,45,60,75,90,105,110,115,120]};

const S={hdr:{background:POWDER,color:NAVY,fontWeight:700,fontSize:11,padding:"8px 14px",letterSpacing:1,textTransform:"uppercase"},body:{background:"#fff",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 8px 8px"},row:{display:"grid",gridTemplateColumns:"1fr 170px",alignItems:"center",padding:"7px 14px",borderBottom:"1px solid #f3f4f6",gap:8},inp:{width:"100%",padding:"5px 8px",border:"1.5px solid #cbd5e1",borderRadius:5,fontSize:12,fontWeight:700,color:NAVY,background:"#f8faff",outline:"none",textAlign:"right"}};

function Sec({t,children}){return<div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}><div style={S.hdr}>{t}</div><div style={S.body}>{children}</div></div>;}
function Row({l,n,children}){return<div style={S.row}><div><div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{l}</div>{n&&<div style={{fontSize:10,color:"#94a3b8"}}>{n}</div>}</div><div style={{display:"flex",alignItems:"center",gap:4}}>{children}</div></div>;}
function Inp({v,on,pre,suf,step=1,min=0}){return<>{pre&&<span style={{fontSize:11,color:"#64748b",flexShrink:0}}>{pre}</span>}<input type="number" value={v} min={min} step={step} onChange={e=>on(+e.target.value)} style={S.inp}/>{suf&&<span style={{fontSize:11,color:"#64748b",flexShrink:0}}>{suf}</span>}</>;}
function Bar({type,text}){const c={green:{background:"#f0fdf4",color:GREEN},blue:{background:"#eff6ff",color:BLUE},yellow:{background:"#fefce8",color:"#92400e"},navy:{background:"#f8faff",color:NAVY},red:{background:"#fef2f2",color:RED}};return<div style={{padding:"8px 14px",fontSize:11,fontWeight:700,borderTop:"1px solid #e2e8f0",...c[type]}}>{text}</div>;}
function Tog({on,onChange,label}){return<div onClick={()=>onChange(!on)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:"1px solid #f3f4f6",cursor:"pointer"}}><div style={{width:40,height:22,borderRadius:11,background:on?NAVY:"#cbd5e1",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,left:on?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.25)"}}/></div><span style={{fontSize:12,fontWeight:600,color:on?NAVY:"#94a3b8"}}>{label}</span></div>;}
function KPI({label,value,sub,color}){return<div style={{background:"#fff",borderRadius:10,padding:"12px 14px",position:"relative",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.08)",border:"1px solid #e2e8f0"}}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:color}}/><div style={{fontSize:9,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{label}</div><div style={{fontSize:17,fontWeight:800,color,marginTop:3,fontFamily:"monospace"}}>{value}</div><div style={{fontSize:10,color:"#64748b",marginTop:2}}>{sub}</div></div>;}
function TH({children,r}){return<th style={{background:POWDER,color:NAVY,padding:"7px 10px",fontWeight:700,whiteSpace:"nowrap",textAlign:r?"right":"left",minWidth:r?85:undefined}}>{children}</th>;}
function VCR({label,color,value,onChange,total}){const p=total>0?(value/total*100).toFixed(1):0;return<div style={{display:"grid",gridTemplateColumns:"1fr 110px 55px",alignItems:"center",padding:"6px 14px",borderBottom:"1px solid #f3f4f6",gap:6}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:2,background:color,flexShrink:0}}/><span style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{label}</span></div><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,color:"#64748b"}}>₱</span><input type="number" value={value} min={0} step={0.1} onChange={e=>onChange(+e.target.value)} style={{...S.inp,padding:"4px 6px"}}/><span style={{fontSize:10,color:"#94a3b8"}}>/kg</span></div><div style={{textAlign:"center"}}><span style={{fontSize:10,fontWeight:700,color,background:color+"22",borderRadius:4,padding:"2px 6px"}}>{p}%</span></div></div>;}

export default function App(){
  const[a,setA]=useState(D);
  const[tab,setTab]=useState("inputs");
  const set=(k,v)=>setA(p=>({...p,[k]:v}));
  const su=(i,v)=>setA(p=>{const u=[...p.utils];u[i]=v;return{...p,utils:u};});
  const yrs=useMemo(()=>Array.from({length:10},(_,i)=>calc(a,i)),[a]);
  const pmt=useMemo(()=>{const r=a.ir/100,n=a.lt;return(r>0&&n>0)?a.loan*r/(1-Math.pow(1+r,-n)):0;},[a.loan,a.ir,a.lt]);
  const be=useMemo(()=>{for(let u=5;u<=120;u++)if(calc({...a,utils:[u]},0).noi>=0)return u;return null;},[a]);
  const sh=SHIFTS.find(s=>s.key===a.shiftType)||SHIFTS[1];
  const tvc=a.e+a.w+a.g+a.ch+a.pk+a.mt+a.ot;
  const eq=a.capex-a.loan,eqp=a.capex?(eq/a.capex*100).toFixed(1):0,dp=a.capex?(a.loan/a.capex*100).toFixed(1):0;
  const y1=yrs[0],y5=yrs[4],y10=yrs[9];
  const TABS=[{k:"inputs",l:"⚙️ Inputs"},{k:"results",l:"📊 Results"},{k:"sensitivity",l:"🎯 Sensitivity"},{k:"loan",l:"🏦 Loan"}];

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#eef2f7",minHeight:"100vh"}}>
      {/* HEADER */}
      <div style={{background:`linear-gradient(135deg,${POWDER},#AEE0F5)`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 8px rgba(31,56,100,.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:"#fff",borderRadius:8,padding:"5px 10px",display:"flex",gap:1}}>
            <span style={{fontWeight:900,fontSize:18,color:NAVY}}>G</span><span style={{fontWeight:900,fontSize:18,color:"#2563eb"}}>N</span><span style={{fontWeight:900,fontSize:18,color:NAVY}}>MI</span>
          </div>
          <div>
            <div style={{fontSize:9,fontWeight:700,color:NAVY,letterSpacing:2,textTransform:"uppercase",opacity:.75}}>Global Nortkem Marketing Inc.</div>
            <div style={{fontSize:13,fontWeight:800,color:NAVY}}>Nortkem Loan &amp; Investment Analysis</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
          {TABS.map(t=><button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"5px 10px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:11,background:tab===t.k?NAVY:"rgba(31,56,100,.12)",color:tab===t.k?"#fff":NAVY}}>{t.l}</button>)}
        </div>
      </div>

      {/* PLANT BAR */}
      <div style={{background:NAVY,padding:"5px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{fontSize:11,fontWeight:700,color:POWDER,textTransform:"uppercase"}}>Project:</span>
        <input value={a.plantName} onChange={e=>set("plantName",e.target.value)} style={{background:"transparent",border:"none",borderBottom:`2px solid ${POWDER}`,fontWeight:800,fontSize:13,color:"#fff",outline:"none",minWidth:140,padding:"1px 4px"}}/>
        <span style={{fontSize:11,fontWeight:700,color:POWDER,textTransform:"uppercase",marginLeft:8}}>Location:</span>
        <input value={a.location} onChange={e=>set("location",e.target.value)} style={{background:"transparent",border:"none",borderBottom:`2px solid ${POWDER}`,fontWeight:800,fontSize:13,color:"#fff",outline:"none",minWidth:140,padding:"1px 4px"}}/>
      </div>

      <div style={{padding:14,maxWidth:1400,margin:"0 auto"}}>

        {/* INPUTS */}
        {tab==="inputs"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(295px,1fr))",gap:14}}>

          <Sec t="⚙️ Operations">
            <Row l="Operating Days / Month"><Inp v={a.days} on={v=>set("days",v)} suf="days"/></Row>
          </Sec>

          <Sec t="🔄 Shift Configuration">
            <div style={{padding:"10px 14px",borderBottom:"1px solid #f3f4f6"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#1e293b",marginBottom:8}}>Shift Type</div>
              <div style={{display:"flex",gap:6}}>
                {SHIFTS.map(o=><button key={o.key} onClick={()=>set("shiftType",o.key)} style={{flex:1,padding:"7px 4px",borderRadius:7,border:`2px solid ${a.shiftType===o.key?NAVY:"#e2e8f0"}`,background:a.shiftType===o.key?NAVY:"#fff",color:a.shiftType===o.key?"#fff":"#374151",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center",lineHeight:1.4}}>{o.label}<br/><span style={{fontSize:10,fontWeight:400,opacity:.8}}>{o.hours}hrs · {o.count} shift{o.count>1?"s":""}</span></button>)}
              </div>
            </div>
            <Row l="Staff per Shift (Min)" n="At 15% utilization"><Inp v={a.smin} on={v=>set("smin",v)} suf="persons"/></Row>
            <Row l="Staff per Shift (Max)" n="At 100% utilization"><Inp v={a.smax} on={v=>set("smax",v)} suf="persons"/></Row>
            <Row l="Daily Rate / Person"><Inp v={a.dr} on={v=>set("dr",v)} pre="₱"/></Row>
            <Bar type="yellow" text={`${sh.count} shift(s) × ${a.smin}–${a.smax} staff = ${sh.count*a.smin}–${sh.count*a.smax} total headcount | ${sh.hours}hrs/day`}/>
          </Sec>

          <Sec t="🧺 Laundry Line">
            <Tog on={a.hasL} onChange={v=>set("hasL",v)} label="Enable Laundry Line"/>
            {a.hasL&&<>
              <Row l="Capacity" n="Max kg/day at 100%"><Inp v={a.lcap} on={v=>set("lcap",v)} suf="kg/day"/></Row>
              <Row l="Price / kg"><Inp v={a.lp} on={v=>set("lp",v)} pre="₱"/></Row>
              <Row l="Rewash Rate" n="Re-processed free — cost incurred, no extra revenue"><Inp v={a.rw} on={v=>set("rw",v)} suf="%" step={0.5}/></Row>
              <Bar type="red" text={`Rewash: ${a.rw}% extra volume processed at full cost, ₱0 extra revenue`}/>
            </>}
          </Sec>

          <Sec t="👔 Uniform Line">
            <Tog on={a.hasU} onChange={v=>set("hasU",v)} label="Enable Uniform Line"/>
            {a.hasU&&<>
              <Row l="Tunnel Finisher Capacity"><Inp v={a.ucap} on={v=>set("ucap",v)} suf="pcs/hr"/></Row>
              <Row l="Price / Piece"><Inp v={a.up} on={v=>set("up",v)} pre="₱"/></Row>
              <div style={{padding:"8px 14px 2px",borderBottom:"1px solid #f3f4f6"}}>
                <div style={{fontSize:11,fontWeight:700,color:NAVY,marginBottom:6}}>Variable Cost (₱/piece)</div>
                {[{k:"ue",l:"⚡ Electricity",c:"#f59e0b"},{k:"uw",l:"💧 Water",c:"#06b6d4"},{k:"uch",l:"🧪 Chemicals",c:"#8b5cf6"},{k:"uo",l:"➕ Other",c:"#94a3b8"}].map(x=>{
                  const tot=a.ue+a.uw+a.uch+a.uo;
                  return<VCR key={x.k} label={x.l} color={x.c} value={a[x.k]} onChange={v=>set(x.k,v)} total={tot}/>;
                })}
              </div>
              <Bar type="blue" text={`Max/Day: ${(a.ucap*sh.hours).toLocaleString()} pcs | VC: ₱${(a.ue+a.uw+a.uch+a.uo).toFixed(2)}/pc`}/>
            </>}
          </Sec>

          <Sec t="⚡ Variable Costs — Laundry (₱/kg)">
            {[{k:"e",l:"⚡ Electricity",c:"#f59e0b"},{k:"w",l:"💧 Water",c:"#06b6d4"},{k:"g",l:"🔥 LPG / Gas",c:"#ef4444"},{k:"ch",l:"🧪 Chemicals",c:"#8b5cf6"},{k:"pk",l:"📦 Packaging",c:"#10b981"},{k:"mt",l:"🔧 Maintenance",c:"#64748b"},{k:"ot",l:"➕ Other",c:"#94a3b8"}].map(x=>(
              <VCR key={x.k} label={x.l} color={x.c} value={a[x.k]} onChange={v=>set(x.k,v)} total={tvc}/>
            ))}
            <Bar type="navy" text={`Total: ₱${tvc.toFixed(2)}/kg | Spread: ₱${(a.lp-tvc).toFixed(2)}/kg (${a.lp?((a.lp-tvc)/a.lp*100).toFixed(1):0}% margin)`}/>
          </Sec>

          <Sec t="📈 Annual Escalations">
            <Row l="Price Escalation" n="Applied to revenue"><Inp v={a.pe} on={v=>set("pe",v)} suf="%/yr" step={0.5}/></Row>
            <Row l="Variable Cost Escalation" n="All utility costs"><Inp v={a.ve} on={v=>set("ve",v)} suf="%/yr" step={0.5}/></Row>
            <Row l="Labor Escalation" n="Annual wage increase"><Inp v={a.le} on={v=>set("le",v)} suf="%/yr" step={0.5}/></Row>
            <Row l="Rent Escalation" n="Lease increase per year"><Inp v={a.re} on={v=>set("re",v)} suf="%/yr" step={0.5}/></Row>
            <Bar type="yellow" text={`Year 5 cumulative: VC +${((Math.pow(1+a.ve/100,4)-1)*100).toFixed(1)}% | Labor +${((Math.pow(1+a.le/100,4)-1)*100).toFixed(1)}% | Rent +${((Math.pow(1+a.re/100,4)-1)*100).toFixed(1)}%`}/>
          </Sec>

          <Sec t="💰 Revenue Deductions">
            <Row l="Royalty"><Inp v={a.roy} on={v=>set("roy",v)} suf="% of rev" step={0.5}/></Row>
            <Row l="Marketing"><Inp v={a.mkt} on={v=>set("mkt",v)} suf="% of rev" step={0.5}/></Row>
          </Sec>

          <Sec t="🏗️ CAPEX &amp; Financing">
            <Row l="Total CAPEX"><Inp v={a.capex} on={v=>setA(p=>({...p,capex:v,loan:p.loanMode==="pct"?v*p.dpct/100:p.loan}))} pre="₱" step={500000}/></Row>
            <div style={{padding:"8px 14px 4px",borderBottom:"1px solid #f3f4f6"}}>
              <div style={{fontSize:11,fontWeight:600,marginBottom:6}}>Loan Input Method</div>
              <div style={{display:"flex",border:"1.5px solid #cbd5e1",borderRadius:6,overflow:"hidden"}}>
                {["pct","amt"].map(m=><button key={m} onClick={()=>setA(p=>({...p,loanMode:m,loan:m==="pct"?p.capex*p.dpct/100:p.loan}))} style={{flex:1,padding:"6px",border:"none",fontSize:11,fontWeight:a.loanMode===m?700:600,background:a.loanMode===m?NAVY:"#fff",color:a.loanMode===m?"#fff":"#64748b",cursor:"pointer"}}>{m==="pct"?"% of CAPEX":"Fixed ₱"}</button>)}
              </div>
            </div>
            {a.loanMode==="pct"
              ?<Row l="Debt %" n="% of CAPEX"><Inp v={a.dpct} on={v=>setA(p=>({...p,dpct:v,loan:p.capex*v/100}))} suf="%" step={5}/></Row>
              :<Row l="Loan Amount"><Inp v={a.loan} on={v=>setA(p=>({...p,loan:v,dpct:p.capex?+(v/p.capex*100).toFixed(1):0}))} pre="₱" step={500000}/></Row>}
            <div style={{padding:"7px 14px",borderBottom:"1px solid #f3f4f6",fontSize:12,fontWeight:700,color:GREEN}}>Equity: {peso(eq)} ({eqp}%) · Loan: {dp}%</div>
            <Row l="Interest Rate" n="PH market: 8–10%"><Inp v={a.ir} on={v=>set("ir",v)} suf="% p.a." step={0.5}/></Row>
            <Row l="Loan Term"><Inp v={a.lt} on={v=>set("lt",v)} suf="years"/></Row>
            <Row l="Depreciation"><Inp v={a.dep} on={v=>set("dep",v)} suf="% p.a." step={0.5}/></Row>
            <Bar type="navy" text={`Loan: ${peso(a.loan)} | PMT: ${peso(pmt)}/yr | Dep: ${peso(a.capex*a.dep/100)}/yr`}/>
          </Sec>

          <Sec t="🏠 Fixed Costs">
            <Row l="Rent / Month" n={`Escalates ${a.re}%/yr`}><Inp v={a.rent} on={v=>set("rent",v)} pre="₱" suf="/mo" step={5000}/></Row>
            <Row l="Insurance &amp; Permits"><Inp v={a.ins} on={v=>set("ins",v)} pre="₱" suf="/yr" step={5000}/></Row>
          </Sec>

          <Sec t="📈 Utilization Ramp (%)">
            {a.utils.map((u,i)=><Row key={i} l={`Year ${i+1}`} n={i===0?"Starting":i===6?"Overtime begins":""}><Inp v={u} on={v=>su(i,v)} suf="%" step={5}/></Row>)}
          </Sec>

        </div>}

        {/* RESULTS */}
        {tab==="results"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginBottom:16}}>
            <KPI label="Yr1 Revenue" value={peso(y1.rev,true)} sub={pct(y1.u)+" util"} color={NAVY}/>
            <KPI label="Yr1 NOI" value={peso(y1.noi,true)} sub={pct(y1.nm)+" margin"} color={y1.noi>=0?GREEN:RED}/>
            <KPI label="Yr5 Revenue" value={peso(y5.rev,true)} sub={pct(y5.u)+" util"} color={NAVY}/>
            <KPI label="Yr5 NOI" value={peso(y5.noi,true)} sub={pct(y5.nm)+" margin"} color={y5.noi>=0?GREEN:RED}/>
            <KPI label="Yr10 Revenue" value={peso(y10.rev,true)} sub={pct(y10.u)+" util"} color={NAVY}/>
            <KPI label="Yr10 NOI" value={peso(y10.noi,true)} sub={pct(y10.nm)+" margin"} color={y10.noi>=0?GREEN:RED}/>
            <KPI label="Breakeven" value={be?be+"%":"N/A"} sub="Min for positive NOI" color="#C9A227"/>
            <KPI label="Loan PMT/yr" value={peso(pmt,true)} sub={`${a.ir}% / ${a.lt}yr`} color="#7c3aed"/>
            <KPI label="Rewash Rate" value={`${a.rw}%`} sub={`${Math.round(y1.rkg*a.days*12).toLocaleString()} kg/yr`} color={RED}/>
            <KPI label="Yr1 Headcount" value={`${y1.staff}`} sub={`${y1.sh.count}×${y1.sp} per shift`} color="#7c3aed"/>
          </div>

          <div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.08)",marginBottom:14}}>
            <div style={S.hdr}>📦 Volume &amp; Revenue by Year</div>
            <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr><TH>Year</TH><TH r>Util%</TH>{a.hasL&&<><TH r>Net kg/yr</TH><TH r>Rewash kg</TH><TH r>Rewash Cost</TH><TH r>Laundry Rev</TH></>}{a.hasU&&<><TH r>Pcs/yr</TH><TH r>Uniform Rev</TH></>}<TH r>Total Rev</TH><TH r>Staff</TH><TH r>NOI</TH></tr></thead>
              <tbody>{yrs.map((d,i)=><tr key={i} style={{background:i%2===0?"#f8faff":"#fff"}}>
                <td style={{padding:"5px 10px",fontWeight:700,color:NAVY}}>Yr{i+1}</td>
                <td style={{padding:"5px 10px",textAlign:"right"}}>{pct(d.u)}</td>
                {a.hasL&&<><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace"}}>{Math.round(d.lkgyr).toLocaleString()}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",color:RED}}>{Math.round(d.rkg*a.days*12).toLocaleString()}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",color:RED}}>({peso(d.rwcost,true)})</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",color:GREEN}}>{peso(d.lrev,true)}</td></>}
                {a.hasU&&<><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace"}}>{Math.round(d.upcs).toLocaleString()}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",color:BLUE}}>{peso(d.urev,true)}</td></>}
                <td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",fontWeight:700,color:NAVY}}>{peso(d.rev,true)}</td>
                <td style={{padding:"5px 10px",textAlign:"right"}}>{d.staff}<span style={{fontSize:9,color:"#94a3b8"}}> ({d.sh.count}×{d.sp})</span></td>
                <td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",fontWeight:700,color:d.noi>=0?GREEN:RED,background:d.noi>=0?"#f0fdf4":"#fef2f2"}}>{peso(d.noi,true)}</td>
              </tr>)}</tbody>
            </table></div>
          </div>

          <div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.08)",marginBottom:14}}>
            <div style={S.hdr}>📊 10-Year Profit &amp; Loss</div>
            <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr><TH>Metric</TH>{yrs.map((_,i)=><TH key={i} r>Yr{i+1}</TH>)}</tr></thead>
              <tbody>{[
                {s:"REVENUE"},{l:"Laundry Rev",k:"lrev",c:GREEN,sk:!a.hasL},{l:"↳ Rewash Cost",k:"rwcost",c:RED,neg:true,sk:!a.hasL},
                {l:"Uniform Rev",k:"urev",c:BLUE,sk:!a.hasU},{l:"Total Revenue",k:"rev",b:true,c:GREEN},
                {s:"COSTS"},{l:"Variable Costs",k:"vc"},{l:"Royalty",k:"roy"},{l:"Marketing",k:"mkt"},{l:"Labor",k:"lab"},{l:"Rent",k:"rnt"},{l:"Insurance",k:"ins"},{l:"Depreciation",k:"dep"},{l:"Loan PMT",k:"pmt"},
                {s:"PROFIT"},{l:"EBITDA",k:"ebitda",b:true},{l:"EBITDA Margin %",k:"em",p:true},{l:"NOI",k:"noi",b:true,dyn:true},{l:"NOI Margin %",k:"nm",p:true},
              ].map((row,ri)=>{
                if(row.sk)return null;
                if(row.s)return<tr key={ri}><td colSpan={yrs.length+1} style={{background:"#dde6f0",color:NAVY,fontWeight:700,fontSize:10,textTransform:"uppercase",padding:"5px 10px"}}>{row.s}</td></tr>;
                return<tr key={ri} style={{background:ri%2===0?"#f8faff":"#fff"}}>
                  <td style={{padding:"5px 10px",fontWeight:row.b?700:400,color:row.c||"#374151"}}>{row.l}</td>
                  {yrs.map((yr,yi)=>{const v=yr[row.k];const tc=row.dyn?(v>=0?GREEN:RED):(row.c||"#374151");return<td key={yi} style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",fontWeight:row.b?700:400,color:row.neg?RED:tc,background:row.dyn?(v>=0?"#f0fdf4":"#fef2f2"):"inherit"}}>{row.p?pct(v):row.neg?`(${peso(v,true)})`:peso(v,true)}</td>;})}
                </tr>;
              })}</tbody>
            </table></div>
          </div>
        </div>}

        {/* SENSITIVITY */}
        {tab==="sensitivity"&&(()=>{
          const SU=[30,50,65,80],SL=["30% Conservative","50% Base Case","65% Target","80% Upside"],SN=["Risk/early stage","Realistic Yr2–3","Stable ops","Strong pipeline"],SY=[1,3,5,7,10];
          return<div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:10,marginBottom:14}}>
              {SU.map((u,i)=>{const d=calc({...a,utils:[u]},0),pos=d.noi>=0;return<div key={i} style={{borderRadius:8,padding:12,border:`2px solid ${pos?"#86efac":"#fca5a5"}`,background:pos?"#f0fdf4":"#fef2f2"}}><div style={{fontWeight:700,fontSize:12,color:NAVY}}>{SL[i]}</div><div style={{fontSize:10,color:"#94a3b8",marginBottom:6}}>{SN[i]}</div><div style={{fontSize:15,fontWeight:800,color:pos?GREEN:RED,fontFamily:"monospace"}}>NOI: {peso(d.noi,true)}</div><div style={{fontSize:10,color:"#64748b"}}>Rev: {peso(d.rev,true)}</div></div>;})}
            </div>
            <div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.08)",marginBottom:14}}>
              <div style={S.hdr}>🎯 NOI Sensitivity Matrix</div>
              <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr><TH>Scenario</TH>{SY.map(y=><TH key={y} r>Year {y}</TH>)}</tr></thead>
                <tbody>{SU.map((u,ri)=><tr key={ri} style={{background:ri%2===0?"#f8faff":"#fff"}}><td style={{padding:"5px 10px",fontWeight:700,color:NAVY}}>{SL[ri]}</td>{SY.map(yr=>{const d=calc({...a,utils:Array(10).fill(u)},yr-1);return<td key={yr} style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",fontWeight:700,color:d.noi>=0?GREEN:RED,background:d.noi>=0?"#f0fdf4":"#fef2f2"}}>{peso(d.noi,true)}</td>;})}</tr>)}</tbody>
              </table></div>
            </div>
            <div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
              <div style={S.hdr}>📉 Breakeven Analysis</div>
              <div style={{background:"#fff",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:14}}>
                {Array.from({length:12},(_,i)=>{const u=(i+1)*10,d=calc({...a,utils:[u]},0),mx=calc({...a,utils:[120]},0).rev||1,bw=Math.max(2,Math.min(100,d.rev/mx*100)),pos=d.noi>=0;return<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:38,fontSize:11,fontWeight:700,color:NAVY,flexShrink:0}}>{u}%</div><div style={{flex:1,height:22,background:"#f1f5f9",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${bw}%`,background:pos?"linear-gradient(90deg,#16a34a,#4ade80)":"linear-gradient(90deg,#dc2626,#f87171)",display:"flex",alignItems:"center",paddingLeft:8}}><span style={{fontSize:10,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>{peso(d.rev,true)} | NOI: {peso(d.noi,true)}</span></div></div><div style={{fontSize:10,fontWeight:700,width:52,textAlign:"right",color:pos?GREEN:RED}}>{pos?"✓ Profit":"✗ Loss"}</div></div>;})}
                <div style={{marginTop:10,padding:"10px 14px",borderRadius:6,background:be?"#f0fdf4":"#fef2f2",border:`1px solid ${be?"#86efac":"#fca5a5"}`,fontWeight:700,fontSize:12,color:be?GREEN:RED}}>Breakeven: {be?be+"% utilization":"Not achievable"}</div>
              </div>
            </div>
          </div>;
        })()}

        {/* LOAN */}
        {tab==="loan"&&(()=>{
          const r=a.ir/100,n=a.lt,tp=pmt*n,ti=tp-a.loan;
          let rows=[],bal=a.loan;
          for(let i=1;i<=n;i++){const int_=bal*r,prin=pmt-int_,clo=Math.max(0,bal-prin);rows.push({i,bal,int_,prin,clo});bal=clo;}
          return<div>
            <div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.08)",marginBottom:14}}>
              <div style={S.hdr}>🏦 Loan Summary</div>
              <div style={{...S.body,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,padding:14}}>
                {[{l:"Total CAPEX",v:peso(a.capex)},{l:`Loan (${dp}%)`,v:peso(a.loan)},{l:`Equity (${eqp}%)`,v:peso(eq)},{l:"Interest Rate",v:`${a.ir}% p.a.`},{l:"Loan Term",v:`${n} years`},{l:"Annual PMT",v:peso(pmt)},{l:"Monthly PMT",v:peso(pmt/12)},{l:"Total Interest",v:peso(ti)},{l:"Total Paid",v:peso(tp)}].map((x,i)=><div key={i} style={{background:"#f8faff",borderRadius:6,padding:"10px 12px",borderLeft:`3px solid ${NAVY}`}}><div style={{fontSize:10,color:"#64748b",fontWeight:600}}>{x.l}</div><div style={{fontSize:14,fontWeight:800,color:NAVY,fontFamily:"monospace",marginTop:2}}>{x.v}</div></div>)}
              </div>
            </div>
            <div style={{borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
              <div style={S.hdr}>📅 Amortization Schedule</div>
              <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr><TH>Yr</TH><TH r>Opening</TH><TH r>Annual PMT</TH><TH r>Monthly PMT</TH><TH r>Interest</TH><TH r>Principal</TH><TH r>Closing</TH></tr></thead>
                <tbody>{rows.map((row,i)=><tr key={i} style={{background:i%2===0?"#f8faff":"#fff"}}><td style={{padding:"5px 10px",fontWeight:700,color:NAVY,textAlign:"center"}}>{row.i}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace"}}>{peso(row.bal)}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",fontWeight:700}}>{peso(pmt)}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace"}}>{peso(pmt/12)}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",color:RED}}>{peso(row.int_)}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",color:GREEN}}>{peso(row.prin)}</td><td style={{padding:"5px 10px",textAlign:"right",fontFamily:"monospace",fontWeight:700,color:NAVY}}>{peso(row.clo)}</td></tr>)}</tbody>
              </table></div>
            </div>
          </div>;
        })()}

      </div>
    </div>
  );
}
