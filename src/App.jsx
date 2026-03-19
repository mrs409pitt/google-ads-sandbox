import { useState, useEffect, useRef } from "react";

const STEPS = [
  { id: "campaign", label: "Campaign", icon: "📊" },
  { id: "adgroups", label: "Ad Groups", icon: "📁" },
  { id: "keywords", label: "Keywords", icon: "🔑" },
  { id: "negatives", label: "Negatives", icon: "🚫" },
  { id: "ads", label: "Responsive Ads", icon: "📝" },
  { id: "review", label: "Review", icon: "✅" },
];

const MATCH_TYPES = ["Broad", "Phrase", "Exact"];
const BID_STRATEGIES = [
  "Maximize Clicks",
  "Maximize Conversions",
  "Target CPA",
  "Target ROAS",
  "Manual CPC",
  "Maximize Conversion Value",
];
const NETWORKS = ["Google Search", "Search Partners", "Display Network"];
const DEVICE_OPTIONS = ["All Devices", "Mobile Only", "Desktop Only", "Tablet Only"];
const AD_SCHEDULE_PRESETS = ["All Day", "Business Hours (9am-5pm)", "Custom"];

// ── Utility Components ──

function Pill({ children, onRemove, color = "blue" }) {
  const colors = {
    blue: { bg: "#e8f0fe", text: "#1a56db", border: "#c3d9f7" },
    green: { bg: "#e6f4ea", text: "#137333", border: "#b7dfbf" },
    red: { bg: "#fce8e6", text: "#c5221f", border: "#f5c6c2" },
    orange: { bg: "#fef3e1", text: "#b45309", border: "#fbd38d" },
    purple: { bg: "#f3e8fd", text: "#7c3aed", border: "#ddd6fe" },
  };
  const c = colors[color] || colors.blue;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 4,
        background: c.bg, color: c.text, border: `1px solid ${c.border}`,
        fontSize: 13, fontFamily: "'Google Sans', 'Roboto', sans-serif",
        lineHeight: "22px",
      }}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: "none", border: "none", color: c.text,
            cursor: "pointer", padding: 0, fontSize: 15, lineHeight: 1,
            marginLeft: 2, fontWeight: 700, opacity: 0.6,
          }}
          onMouseEnter={e => e.target.style.opacity = 1}
          onMouseLeave={e => e.target.style.opacity = 0.6}
        >×</button>
      )}
    </span>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", hint, error, prefix, suffix, ...rest }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={styles.label}>{label}</label>}
      {hint && <div style={styles.hint}>{hint}</div>}
      <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, color: "#5f6368", fontSize: 14, fontFamily: "'Google Sans', sans-serif" }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            ...styles.input,
            ...(prefix ? { paddingLeft: 24 } : {}),
            ...(suffix ? { paddingRight: 40 } : {}),
            ...(error ? { borderColor: "#d93025" } : {}),
          }}
          {...rest}
        />
        {suffix && <span style={{ position: "absolute", right: 10, color: "#5f6368", fontSize: 13, fontFamily: "'Google Sans', sans-serif" }}>{suffix}</span>}
      </div>
      {error && <div style={{ color: "#d93025", fontSize: 12, marginTop: 4, fontFamily: "'Google Sans', sans-serif" }}>{error}</div>}
    </div>
  );
}

function Select({ label, value, onChange, options, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={styles.label}>{label}</label>}
      {hint && <div style={styles.hint}>{hint}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={styles.select}>
        {options.map(o => (
          <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Google Sans', sans-serif", color: "#3c4043" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ accentColor: "#1a73e8", width: 16, height: 16 }} />
      {label}
    </label>
  );
}

function CharCounter({ current, max, label }) {
  const pct = (current / max) * 100;
  const over = current > max;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#e8eaed" }}>
        <div style={{
          height: 3, borderRadius: 2, width: `${Math.min(pct, 100)}%`,
          background: over ? "#d93025" : pct > 80 ? "#f9ab00" : "#1a73e8",
          transition: "width 0.3s, background 0.3s",
        }} />
      </div>
      <span style={{ fontSize: 11, color: over ? "#d93025" : "#80868b", fontFamily: "'Google Sans', sans-serif", whiteSpace: "nowrap" }}>
        {current}/{max} {label || "chars"}
      </span>
    </div>
  );
}

function SectionCard({ title, subtitle, children, actions }) {
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={styles.cardTitle}>{title}</h3>
          {subtitle && <p style={styles.cardSubtitle}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, small, style: extraStyle }) {
  const base = {
    fontFamily: "'Google Sans', sans-serif",
    fontSize: small ? 12 : 13,
    fontWeight: 500,
    padding: small ? "4px 12px" : "8px 20px",
    borderRadius: 4,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.15s",
    letterSpacing: "0.01em",
    ...extraStyle,
  };
  const variants = {
    primary: { ...base, background: "#1a73e8", color: "#fff" },
    secondary: { ...base, background: "#fff", color: "#1a73e8", border: "1px solid #dadce0" },
    danger: { ...base, background: "#fff", color: "#d93025", border: "1px solid #dadce0" },
    ghost: { ...base, background: "transparent", color: "#1a73e8", padding: small ? "4px 8px" : "8px 12px" },
    success: { ...base, background: "#137333", color: "#fff" },
  };
  return <button onClick={onClick} disabled={disabled} style={variants[variant]}>{children}</button>;
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "#80868b" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#5f6368", fontFamily: "'Google Sans', sans-serif" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, marginTop: 6, fontFamily: "'Google Sans', sans-serif" }}>{subtitle}</div>}
    </div>
  );
}

// ── Step Components ──

function CampaignStep({ data, setData }) {
  return (
    <div>
      <SectionCard title="Campaign Settings" subtitle="Configure your search campaign basics">
        <Input label="Campaign Name" value={data.name} onChange={v => setData({ ...data, name: v })} placeholder="e.g. Brand - Search - US" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Select label="Bid Strategy" value={data.bidStrategy} onChange={v => setData({ ...data, bidStrategy: v })} options={BID_STRATEGIES}
            hint="How Google optimizes your bids" />
          <Select label="Device Targeting" value={data.devices} onChange={v => setData({ ...data, devices: v })} options={DEVICE_OPTIONS} />
        </div>
        {(data.bidStrategy === "Target CPA") && (
          <Input label="Target CPA" value={data.targetCpa} onChange={v => setData({ ...data, targetCpa: v })} placeholder="30.00" prefix="$" type="number" hint="Average amount you'd like to pay per conversion" />
        )}
        {(data.bidStrategy === "Target ROAS") && (
          <Input label="Target ROAS" value={data.targetRoas} onChange={v => setData({ ...data, targetRoas: v })} placeholder="400" suffix="%" type="number" hint="Target return on ad spend percentage" />
        )}
      </SectionCard>

      <SectionCard title="Budget & Schedule" subtitle="Set your daily budget and campaign dates">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Input label="Daily Budget" value={data.dailyBudget} onChange={v => setData({ ...data, dailyBudget: v })} placeholder="50.00" prefix="$" type="number" />
          <Input label="Start Date" value={data.startDate} onChange={v => setData({ ...data, startDate: v })} type="date" label="Start Date" />
          <Input label="End Date (optional)" value={data.endDate} onChange={v => setData({ ...data, endDate: v })} type="date" />
        </div>
        <Select label="Ad Schedule" value={data.adSchedule} onChange={v => setData({ ...data, adSchedule: v })} options={AD_SCHEDULE_PRESETS} />
      </SectionCard>

      <SectionCard title="Networks" subtitle="Where your ads will appear">
        {NETWORKS.map(n => (
          <Checkbox key={n} label={n} checked={data.networks.includes(n)}
            onChange={checked => {
              setData({ ...data, networks: checked ? [...data.networks, n] : data.networks.filter(x => x !== n) });
            }}
          />
        ))}
      </SectionCard>

      <SectionCard title="Location & Language" subtitle="Geographic and language targeting">
        <Input label="Target Locations" value={data.locations} onChange={v => setData({ ...data, locations: v })} placeholder="e.g. United States, Pennsylvania, Pittsburgh" hint="Comma-separated locations" />
        <Input label="Languages" value={data.languages} onChange={v => setData({ ...data, languages: v })} placeholder="e.g. English, Spanish" hint="Comma-separated languages" />
      </SectionCard>
    </div>
  );
}

function AdGroupsStep({ adGroups, setAdGroups }) {
  const [newName, setNewName] = useState("");
  const [newBid, setNewBid] = useState("");

  const add = () => {
    if (!newName.trim()) return;
    setAdGroups([...adGroups, {
      id: Date.now(), name: newName.trim(), defaultBid: newBid || "1.00",
      keywords: [], negativeKeywords: [], ads: [],
    }]);
    setNewName(""); setNewBid("");
  };

  return (
    <div>
      <SectionCard title="Create Ad Groups" subtitle="Organize your campaign into themed ad groups. Each ad group should contain tightly related keywords.">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 2 }}>
            <Input label="Ad Group Name" value={newName} onChange={setNewName} placeholder="e.g. Brand Terms, Product - Widgets" />
          </div>
          <div style={{ flex: 1 }}>
            <Input label="Default Max CPC" value={newBid} onChange={setNewBid} placeholder="1.00" prefix="$" type="number" />
          </div>
          <Btn onClick={add} disabled={!newName.trim()} style={{ marginBottom: 16 }}>+ Add Group</Btn>
        </div>
      </SectionCard>

      {adGroups.length === 0 ? (
        <EmptyState icon="📁" title="No ad groups yet" subtitle="Create your first ad group above to get started" />
      ) : (
        adGroups.map((ag, i) => (
          <SectionCard key={ag.id} title={ag.name}
            subtitle={`Default CPC: $${ag.defaultBid} · ${ag.keywords.length} keywords · ${ag.ads.length} ads`}
            actions={<Btn variant="danger" small onClick={() => setAdGroups(adGroups.filter(x => x.id !== ag.id))}>Remove</Btn>}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill color="blue">{ag.keywords.length} Keywords</Pill>
              <Pill color="red">{ag.negativeKeywords.length} Negatives</Pill>
              <Pill color="green">{ag.ads.length} Ads</Pill>
            </div>
          </SectionCard>
        ))
      )}
    </div>
  );
}

function KeywordsStep({ adGroups, setAdGroups }) {
  const [selectedGroup, setSelectedGroup] = useState(adGroups[0]?.id || "");
  const [kwInput, setKwInput] = useState("");
  const [matchType, setMatchType] = useState("Broad");

  const addKeywords = () => {
    if (!kwInput.trim() || !selectedGroup) return;
    const newKws = kwInput.split("\n").filter(k => k.trim()).map(k => ({
      id: Date.now() + Math.random(),
      text: k.trim(),
      matchType,
    }));
    setAdGroups(adGroups.map(ag =>
      ag.id === +selectedGroup ? { ...ag, keywords: [...ag.keywords, ...newKws] } : ag
    ));
    setKwInput("");
  };

  const group = adGroups.find(ag => ag.id === +selectedGroup);

  const formatKw = (kw) => {
    if (kw.matchType === "Phrase") return `"${kw.text}"`;
    if (kw.matchType === "Exact") return `[${kw.text}]`;
    return kw.text;
  };

  const matchColor = { Broad: "blue", Phrase: "orange", Exact: "green" };

  return (
    <div>
      <SectionCard title="Add Keywords" subtitle="Add keywords to your ad groups. Enter one keyword per line.">
        {adGroups.length === 0 ? (
          <EmptyState icon="📁" title="No ad groups yet" subtitle="Go back and create ad groups first" />
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Select label="Ad Group" value={selectedGroup}
                onChange={v => setSelectedGroup(v)}
                options={adGroups.map(ag => ({ value: ag.id.toString(), label: ag.name }))} />
              <Select label="Match Type" value={matchType} onChange={setMatchType} options={MATCH_TYPES}
                hint={matchType === "Broad" ? "Widest reach — includes related searches" :
                  matchType === "Phrase" ? "Includes the meaning of your keyword" :
                    "Most precise — exact meaning or intent"} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Keywords (one per line)</label>
              <textarea
                value={kwInput}
                onChange={e => setKwInput(e.target.value)}
                placeholder={"online mba program\nmba degree online\naffordable mba\nbest online mba programs"}
                rows={5}
                style={styles.textarea}
              />
            </div>
            <Btn onClick={addKeywords} disabled={!kwInput.trim()}>+ Add Keywords</Btn>
          </>
        )}
      </SectionCard>

      {group && group.keywords.length > 0 && (
        <SectionCard title={`Keywords in "${group.name}"`} subtitle={`${group.keywords.length} keywords total`}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {group.keywords.map(kw => (
              <Pill key={kw.id} color={matchColor[kw.matchType]}
                onRemove={() => setAdGroups(adGroups.map(ag =>
                  ag.id === group.id ? { ...ag, keywords: ag.keywords.filter(k => k.id !== kw.id) } : ag
                ))}
              >
                {formatKw(kw)}
              </Pill>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Keyword Overview Table */}
      {adGroups.some(ag => ag.keywords.length > 0) && (
        <SectionCard title="All Keywords Overview">
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ad Group</th>
                  <th style={styles.th}>Keyword</th>
                  <th style={styles.th}>Match Type</th>
                </tr>
              </thead>
              <tbody>
                {adGroups.flatMap(ag => ag.keywords.map(kw => (
                  <tr key={kw.id}>
                    <td style={styles.td}>{ag.name}</td>
                    <td style={styles.td}><code style={{ fontSize: 13, fontFamily: "'Roboto Mono', monospace" }}>{formatKw(kw)}</code></td>
                    <td style={styles.td}><Pill color={matchColor[kw.matchType]}>{kw.matchType}</Pill></td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function NegativesStep({ adGroups, setAdGroups, campaignNegatives, setCampaignNegatives }) {
  const [level, setLevel] = useState("campaign");
  const [selectedGroup, setSelectedGroup] = useState(adGroups[0]?.id?.toString() || "");
  const [nkInput, setNkInput] = useState("");
  const [matchType, setMatchType] = useState("Phrase");

  const add = () => {
    if (!nkInput.trim()) return;
    const newNks = nkInput.split("\n").filter(k => k.trim()).map(k => ({
      id: Date.now() + Math.random(), text: k.trim(), matchType,
    }));
    if (level === "campaign") {
      setCampaignNegatives([...campaignNegatives, ...newNks]);
    } else {
      setAdGroups(adGroups.map(ag =>
        ag.id === +selectedGroup ? { ...ag, negativeKeywords: [...ag.negativeKeywords, ...newNks] } : ag
      ));
    }
    setNkInput("");
  };

  const matchColor = { Broad: "blue", Phrase: "orange", Exact: "green" };
  const formatKw = (kw) => {
    if (kw.matchType === "Phrase") return `"${kw.text}"`;
    if (kw.matchType === "Exact") return `[${kw.text}]`;
    return kw.text;
  };

  return (
    <div>
      <SectionCard title="Negative Keywords" subtitle="Prevent your ads from showing on irrelevant searches. Apply at campaign level (affects all ad groups) or ad group level.">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["campaign", "adgroup"].map(l => (
            <button key={l} onClick={() => setLevel(l)} style={{
              ...styles.tab, ...(level === l ? styles.tabActive : {}),
            }}>{l === "campaign" ? "Campaign Level" : "Ad Group Level"}</button>
          ))}
        </div>

        {level === "adgroup" && adGroups.length > 0 && (
          <Select label="Ad Group" value={selectedGroup} onChange={setSelectedGroup}
            options={adGroups.map(ag => ({ value: ag.id.toString(), label: ag.name }))} />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div>
            <label style={styles.label}>Negative Keywords (one per line)</label>
            <textarea value={nkInput} onChange={e => setNkInput(e.target.value)}
              placeholder={"free\njobs\nsalary\nreddit\nreview"}
              rows={4} style={styles.textarea} />
          </div>
          <Select label="Match Type" value={matchType} onChange={setMatchType} options={MATCH_TYPES} />
        </div>
        <Btn onClick={add} disabled={!nkInput.trim()}>+ Add Negatives</Btn>
      </SectionCard>

      {campaignNegatives.length > 0 && (
        <SectionCard title="Campaign-Level Negatives" subtitle={`${campaignNegatives.length} negative keywords`}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {campaignNegatives.map(nk => (
              <Pill key={nk.id} color="red"
                onRemove={() => setCampaignNegatives(campaignNegatives.filter(x => x.id !== nk.id))}
              >{formatKw(nk)}</Pill>
            ))}
          </div>
        </SectionCard>
      )}

      {adGroups.filter(ag => ag.negativeKeywords.length > 0).map(ag => (
        <SectionCard key={ag.id} title={`Negatives in "${ag.name}"`} subtitle={`${ag.negativeKeywords.length} negative keywords`}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ag.negativeKeywords.map(nk => (
              <Pill key={nk.id} color="red"
                onRemove={() => setAdGroups(adGroups.map(g =>
                  g.id === ag.id ? { ...g, negativeKeywords: g.negativeKeywords.filter(x => x.id !== nk.id) } : g
                ))}
              >{formatKw(nk)}</Pill>
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function AdsStep({ adGroups, setAdGroups }) {
  const [selectedGroup, setSelectedGroup] = useState(adGroups[0]?.id?.toString() || "");
  const [ad, setAd] = useState({
    headlines: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    descriptions: ["", "", "", ""],
    finalUrl: "",
    path1: "",
    path2: "",
    sitelinks: [],
  });
  const [showPreview, setShowPreview] = useState(false);

  const group = adGroups.find(ag => ag.id === +selectedGroup);

  const updateHeadline = (i, v) => {
    const h = [...ad.headlines]; h[i] = v; setAd({ ...ad, headlines: h });
  };
  const updateDescription = (i, v) => {
    const d = [...ad.descriptions]; d[i] = v; setAd({ ...ad, descriptions: d });
  };

  const filledHeadlines = ad.headlines.filter(h => h.trim());
  const filledDescs = ad.descriptions.filter(d => d.trim());
  const canSave = filledHeadlines.length >= 3 && filledDescs.length >= 2 && ad.finalUrl.trim();

  const saveAd = () => {
    if (!canSave || !group) return;
    const newAd = {
      id: Date.now(),
      headlines: ad.headlines.filter(h => h.trim()),
      descriptions: ad.descriptions.filter(d => d.trim()),
      finalUrl: ad.finalUrl,
      path1: ad.path1,
      path2: ad.path2,
    };
    setAdGroups(adGroups.map(ag =>
      ag.id === group.id ? { ...ag, ads: [...ag.ads, newAd] } : ag
    ));
    setAd({
      headlines: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      descriptions: ["", "", "", ""],
      finalUrl: "", path1: "", path2: "", sitelinks: [],
    });
  };

  const previewUrl = ad.finalUrl ? ad.finalUrl.replace(/^https?:\/\//, "").split("/")[0] : "example.com";

  return (
    <div>
      {adGroups.length === 0 ? (
        <EmptyState icon="📁" title="No ad groups yet" subtitle="Go back and create ad groups first" />
      ) : (
        <>
          <SectionCard title="Responsive Search Ad Builder" subtitle="Google Ads will automatically test combinations of your headlines and descriptions to find the best performers.">
            <Select label="Ad Group" value={selectedGroup} onChange={setSelectedGroup}
              options={adGroups.map(ag => ({ value: ag.id.toString(), label: ag.name }))} />

            <Input label="Final URL" value={ad.finalUrl} onChange={v => setAd({ ...ad, finalUrl: v })}
              placeholder="https://www.example.com/landing-page" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Display Path 1" value={ad.path1} onChange={v => setAd({ ...ad, path1: v })}
                placeholder="e.g. programs" hint="15 chars max" />
              <Input label="Display Path 2" value={ad.path2} onChange={v => setAd({ ...ad, path2: v })}
                placeholder="e.g. mba" hint="15 chars max" />
            </div>
          </SectionCard>

          <SectionCard title={`Headlines (${filledHeadlines.length}/15)`}
            subtitle="Add 3-15 headlines. Each up to 30 characters. Google will show up to 3 at a time.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {ad.headlines.map((h, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: "#80868b", marginBottom: 2, fontFamily: "'Google Sans', sans-serif" }}>
                    Headline {i + 1} {i < 3 ? <span style={{ color: "#d93025" }}>*</span> : ""}
                  </div>
                  <input
                    value={h} onChange={e => updateHeadline(i, e.target.value)}
                    maxLength={30}
                    placeholder={i < 3 ? "Required" : "Optional"}
                    style={{ ...styles.input, fontSize: 13, padding: "6px 10px", borderColor: h.length > 30 ? "#d93025" : "#dadce0" }}
                  />
                  <CharCounter current={h.length} max={30} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={`Descriptions (${filledDescs.length}/4)`}
            subtitle="Add 2-4 descriptions. Each up to 90 characters. Google will show up to 2 at a time.">
            {ad.descriptions.map((d, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#80868b", marginBottom: 2, fontFamily: "'Google Sans', sans-serif" }}>
                  Description {i + 1} {i < 2 ? <span style={{ color: "#d93025" }}>*</span> : ""}
                </div>
                <textarea
                  value={d} onChange={e => updateDescription(i, e.target.value)}
                  maxLength={90}
                  placeholder={i < 2 ? "Required — up to 90 characters" : "Optional — up to 90 characters"}
                  rows={2}
                  style={{ ...styles.textarea, fontSize: 13 }}
                />
                <CharCounter current={d.length} max={90} />
              </div>
            ))}
          </SectionCard>

          {/* Ad Preview */}
          <SectionCard title="Ad Preview" subtitle="This is an approximation of how your ad might appear on Google Search">
            <div style={{
              background: "#fff", borderRadius: 8, padding: 20, maxWidth: 600,
              border: "1px solid #e8eaed",
            }}>
              <div style={{ fontSize: 12, color: "#202124", marginBottom: 4, fontFamily: "Arial, sans-serif" }}>
                <span style={{ fontWeight: 600, fontSize: 11, color: "#202124", background: "#f1f3f4", padding: "1px 6px", borderRadius: 3, marginRight: 6 }}>Sponsored</span>
                {previewUrl}{ad.path1 ? `/${ad.path1}` : ""}{ad.path2 ? `/${ad.path2}` : ""}
              </div>
              <div style={{ fontSize: 20, color: "#1a0dab", fontFamily: "Arial, sans-serif", lineHeight: 1.3, marginBottom: 6, cursor: "pointer" }}>
                {filledHeadlines.length > 0 ? filledHeadlines.slice(0, 3).join(" | ") : "Your Headline 1 | Headline 2 | Headline 3"}
              </div>
              <div style={{ fontSize: 14, color: "#4d5156", fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
                {filledDescs.length > 0 ? filledDescs.slice(0, 2).join(" ") : "Your description will appear here. Add compelling copy to encourage clicks."}
              </div>
            </div>
          </SectionCard>

          <div style={{ display: "flex", gap: 12, marginTop: 8, marginBottom: 16 }}>
            <Btn onClick={saveAd} disabled={!canSave} variant="primary">
              Save Ad to "{group?.name || "..."}"
            </Btn>
            <div style={{ fontSize: 12, color: "#80868b", alignSelf: "center", fontFamily: "'Google Sans', sans-serif" }}>
              {!canSave && "Need at least 3 headlines, 2 descriptions, and a final URL"}
            </div>
          </div>

          {/* Saved Ads */}
          {adGroups.filter(ag => ag.ads.length > 0).map(ag => (
            <SectionCard key={ag.id} title={`Ads in "${ag.name}"`} subtitle={`${ag.ads.length} responsive search ad(s)`}>
              {ag.ads.map(a => (
                <div key={a.id} style={{ background: "#f8f9fa", borderRadius: 6, padding: 14, marginBottom: 10, border: "1px solid #e8eaed" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#1a0dab", fontFamily: "Arial, sans-serif", marginBottom: 4 }}>
                        {a.headlines.slice(0, 3).join(" | ")}
                      </div>
                      <div style={{ fontSize: 13, color: "#4d5156", fontFamily: "Arial, sans-serif" }}>
                        {a.descriptions.slice(0, 2).join(" ")}
                      </div>
                      <div style={{ fontSize: 12, color: "#80868b", marginTop: 4 }}>
                        {a.headlines.length} headlines · {a.descriptions.length} descriptions · {a.finalUrl}
                      </div>
                    </div>
                    <Btn variant="danger" small onClick={() => setAdGroups(adGroups.map(g =>
                      g.id === ag.id ? { ...g, ads: g.ads.filter(x => x.id !== a.id) } : g
                    ))}>Remove</Btn>
                  </div>
                </div>
              ))}
            </SectionCard>
          ))}
        </>
      )}
    </div>
  );
}

function ReviewStep({ campaign, adGroups, campaignNegatives }) {
  const totalKws = adGroups.reduce((s, ag) => s + ag.keywords.length, 0);
  const totalNeg = campaignNegatives.length + adGroups.reduce((s, ag) => s + ag.negativeKeywords.length, 0);
  const totalAds = adGroups.reduce((s, ag) => s + ag.ads.length, 0);

  const issues = [];
  if (!campaign.name) issues.push("Campaign name is empty");
  if (!campaign.dailyBudget) issues.push("No daily budget set");
  if (adGroups.length === 0) issues.push("No ad groups created");
  if (totalKws === 0) issues.push("No keywords added");
  if (totalAds === 0) issues.push("No ads created");
  adGroups.forEach(ag => {
    if (ag.keywords.length === 0) issues.push(`Ad group "${ag.name}" has no keywords`);
    if (ag.ads.length === 0) issues.push(`Ad group "${ag.name}" has no ads`);
  });

  const formatKw = (kw) => {
    if (kw.matchType === "Phrase") return `"${kw.text}"`;
    if (kw.matchType === "Exact") return `[${kw.text}]`;
    return kw.text;
  };

  return (
    <div>
      {issues.length > 0 && (
        <div style={{
          background: "#fef7e0", border: "1px solid #f9ab00", borderRadius: 8,
          padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#b45309", marginBottom: 8, fontFamily: "'Google Sans', sans-serif" }}>
            ⚠️ Issues to Resolve ({issues.length})
          </div>
          {issues.map((iss, i) => (
            <div key={i} style={{ fontSize: 13, color: "#92400e", marginBottom: 4, fontFamily: "'Google Sans', sans-serif" }}>
              • {iss}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Ad Groups", value: adGroups.length, icon: "📁" },
          { label: "Keywords", value: totalKws, icon: "🔑" },
          { label: "Negatives", value: totalNeg, icon: "🚫" },
          { label: "Ads", value: totalAds, icon: "📝" },
          { label: "Daily Budget", value: `$${campaign.dailyBudget || "0"}`, icon: "💰" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "#fff", borderRadius: 8, padding: 16,
            border: "1px solid #e8eaed", textAlign: "center",
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#202124", fontFamily: "'Google Sans', sans-serif" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "#80868b", fontFamily: "'Google Sans', sans-serif" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Campaign Settings Summary */}
      <SectionCard title={`📊 Campaign: ${campaign.name || "(unnamed)"}`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["Bid Strategy", campaign.bidStrategy],
            ["Daily Budget", `$${campaign.dailyBudget || "—"}`],
            ["Networks", campaign.networks.join(", ") || "—"],
            ["Devices", campaign.devices],
            ["Locations", campaign.locations || "—"],
            ["Languages", campaign.languages || "—"],
            ["Start Date", campaign.startDate || "—"],
            ["End Date", campaign.endDate || "None"],
            ["Ad Schedule", campaign.adSchedule],
          ].map(([k, v]) => (
            <div key={k} style={{ fontSize: 13, fontFamily: "'Google Sans', sans-serif", padding: "4px 0" }}>
              <span style={{ color: "#80868b" }}>{k}:</span>{" "}
              <span style={{ color: "#202124", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Per Ad-Group Review */}
      {adGroups.map(ag => (
        <SectionCard key={ag.id} title={`📁 ${ag.name}`} subtitle={`CPC: $${ag.defaultBid}`}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#5f6368", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Google Sans', sans-serif" }}>Keywords ({ag.keywords.length})</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ag.keywords.length > 0 ? ag.keywords.map(kw => (
                <Pill key={kw.id} color={kw.matchType === "Exact" ? "green" : kw.matchType === "Phrase" ? "orange" : "blue"}>
                  {formatKw(kw)}
                </Pill>
              )) : <span style={{ fontSize: 13, color: "#80868b", fontStyle: "italic" }}>None</span>}
            </div>
          </div>
          {ag.negativeKeywords.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#5f6368", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Google Sans', sans-serif" }}>Negatives ({ag.negativeKeywords.length})</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ag.negativeKeywords.map(nk => <Pill key={nk.id} color="red">{formatKw(nk)}</Pill>)}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#5f6368", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Google Sans', sans-serif" }}>Ads ({ag.ads.length})</div>
            {ag.ads.length > 0 ? ag.ads.map(a => (
              <div key={a.id} style={{ background: "#f8f9fa", borderRadius: 6, padding: 12, marginBottom: 8, border: "1px solid #e8eaed" }}>
                <div style={{ fontSize: 14, color: "#1a0dab", fontFamily: "Arial, sans-serif" }}>
                  {a.headlines.slice(0, 3).join(" | ")}
                </div>
                <div style={{ fontSize: 13, color: "#4d5156", fontFamily: "Arial, sans-serif", marginTop: 4 }}>
                  {a.descriptions.slice(0, 2).join(" ")}
                </div>
                <div style={{ fontSize: 11, color: "#80868b", marginTop: 4, fontFamily: "'Google Sans', sans-serif" }}>
                  {a.headlines.length} headlines · {a.descriptions.length} descriptions · {a.finalUrl}
                </div>
              </div>
            )) : <span style={{ fontSize: 13, color: "#80868b", fontStyle: "italic" }}>None</span>}
          </div>
        </SectionCard>
      ))}

      {campaignNegatives.length > 0 && (
        <SectionCard title="🚫 Campaign-Level Negatives" subtitle={`${campaignNegatives.length} negative keywords`}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {campaignNegatives.map(nk => <Pill key={nk.id} color="red">{formatKw(nk)}</Pill>)}
          </div>
        </SectionCard>
      )}

      {issues.length === 0 && (
        <div style={{
          background: "#e6f4ea", border: "1px solid #34a853", borderRadius: 8,
          padding: 20, textAlign: "center", marginTop: 12,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#137333", fontFamily: "'Google Sans', sans-serif" }}>
            Campaign Ready for Launch
          </div>
          <div style={{ fontSize: 13, color: "#137333", marginTop: 4, fontFamily: "'Google Sans', sans-serif" }}>
            All required elements are in place. In a real environment, you'd click "Publish Campaign" to go live.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ──

export default function GoogleAdsSandbox() {
  const [step, setStep] = useState(0);
  const [campaign, setCampaign] = useState({
    name: "", bidStrategy: "Maximize Clicks", dailyBudget: "", startDate: "", endDate: "",
    networks: ["Google Search", "Search Partners"], locations: "", languages: "English",
    devices: "All Devices", adSchedule: "All Day", targetCpa: "", targetRoas: "",
  });
  const [adGroups, setAdGroups] = useState([]);
  const [campaignNegatives, setCampaignNegatives] = useState([]);

  const canProceed = (s) => {
    if (s === 0) return !!campaign.name.trim();
    if (s === 1) return adGroups.length > 0;
    return true;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f2f5",
      fontFamily: "'Google Sans', 'Roboto', 'Helvetica Neue', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #dadce0",
        padding: "0 24px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", height: 56, gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span style={{ fontSize: 18, fontWeight: 500, color: "#5f6368" }}>Ads</span>
            </div>
            <div style={{ width: 1, height: 24, background: "#dadce0" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#202124" }}>
              Campaign Sandbox
            </span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 500, background: "#e8f0fe", color: "#1a73e8",
                padding: "3px 10px", borderRadius: 12, textTransform: "uppercase", letterSpacing: "0.5px",
              }}>Training Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ background: "#fff", borderBottom: "1px solid #dadce0", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              style={{
                flex: 1, padding: "14px 8px",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: step === i ? "3px solid #1a73e8" : "3px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                color: step === i ? "#1a73e8" : i < step ? "#137333" : "#80868b",
                fontWeight: step === i ? 600 : 400,
                fontSize: 13,
                fontFamily: "'Google Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: "50%", display: "inline-flex",
                alignItems: "center", justifyContent: "center", fontSize: 12,
                background: step === i ? "#1a73e8" : i < step ? "#137333" : "#e8eaed",
                color: step === i || i < step ? "#fff" : "#80868b",
                fontWeight: 600, transition: "all 0.2s",
              }}>
                {i < step ? "✓" : i + 1}
              </span>
              <span style={{ display: "inline-block" }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 100px" }}>
        {step === 0 && <CampaignStep data={campaign} setData={setCampaign} />}
        {step === 1 && <AdGroupsStep adGroups={adGroups} setAdGroups={setAdGroups} />}
        {step === 2 && <KeywordsStep adGroups={adGroups} setAdGroups={setAdGroups} />}
        {step === 3 && <NegativesStep adGroups={adGroups} setAdGroups={setAdGroups} campaignNegatives={campaignNegatives} setCampaignNegatives={setCampaignNegatives} />}
        {step === 4 && <AdsStep adGroups={adGroups} setAdGroups={setAdGroups} />}
        {step === 5 && <ReviewStep campaign={campaign} adGroups={adGroups} campaignNegatives={campaignNegatives} />}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #dadce0",
        padding: "12px 24px", zIndex: 100,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Btn variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            ← Back
          </Btn>
          <span style={{ fontSize: 12, color: "#80868b", fontFamily: "'Google Sans', sans-serif" }}>
            Step {step + 1} of {STEPS.length}: {STEPS[step].label}
          </span>
          {step < STEPS.length - 1 ? (
            <Btn onClick={() => setStep(step + 1)} disabled={!canProceed(step)}>
              Continue →
            </Btn>
          ) : (
            <Btn variant="success" disabled={false}>
              🚀 Publish Campaign
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  label: {
    display: "block", fontSize: 12, fontWeight: 500, color: "#5f6368",
    marginBottom: 4, fontFamily: "'Google Sans', sans-serif",
  },
  hint: {
    fontSize: 11, color: "#80868b", marginBottom: 6, fontFamily: "'Google Sans', sans-serif",
  },
  input: {
    width: "100%", padding: "8px 12px", borderRadius: 4,
    border: "1px solid #dadce0", fontSize: 14, color: "#202124",
    fontFamily: "'Google Sans', sans-serif", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  },
  select: {
    width: "100%", padding: "8px 12px", borderRadius: 4,
    border: "1px solid #dadce0", fontSize: 14, color: "#202124",
    fontFamily: "'Google Sans', sans-serif", outline: "none",
    boxSizing: "border-box", background: "#fff", cursor: "pointer",
  },
  textarea: {
    width: "100%", padding: "8px 12px", borderRadius: 4,
    border: "1px solid #dadce0", fontSize: 14, color: "#202124",
    fontFamily: "'Google Sans', sans-serif", outline: "none",
    resize: "vertical", boxSizing: "border-box",
  },
  card: {
    background: "#fff", borderRadius: 8, padding: 20,
    marginBottom: 16, border: "1px solid #e8eaed",
  },
  cardTitle: {
    fontSize: 16, fontWeight: 600, color: "#202124", margin: 0,
    fontFamily: "'Google Sans', sans-serif",
  },
  cardSubtitle: {
    fontSize: 13, color: "#80868b", margin: "4px 0 0",
    fontFamily: "'Google Sans', sans-serif",
  },
  tab: {
    padding: "8px 16px", borderRadius: 20, border: "1px solid #dadce0",
    background: "#fff", color: "#5f6368", fontSize: 13, cursor: "pointer",
    fontFamily: "'Google Sans', sans-serif", fontWeight: 500,
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#e8f0fe", color: "#1a73e8", borderColor: "#c3d9f7",
  },
  table: {
    width: "100%", borderCollapse: "collapse", fontSize: 13,
    fontFamily: "'Google Sans', sans-serif",
  },
  th: {
    textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e8eaed",
    color: "#5f6368", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "8px 12px", borderBottom: "1px solid #f1f3f4", color: "#202124",
  },
};
