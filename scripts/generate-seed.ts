/**
 * GraphSentry seed generator
 * Produces a synthetic, clearly-fictional criminal-network case study.
 * Run: npm run generate-seed
 *
 * The graph is structured into three dense clusters plus a handful of
 * high-betweenness "broker" nodes so a live demo reads as a real investigation
 * rather than a random hairball.
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

type EntityType = "person" | "phone" | "location" | "organization";
type RelationType = "call" | "transaction" | "co-location" | "family";

interface Entity {
  id: string;
  type: EntityType;
  label: string;
  subtitle: string;
  clusterHint: "harbor" | "remittance" | "fronts" | "bridge";
  meta: Record<string, string | number>;
}

interface Relation {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  timestamp: string;
  meta?: Record<string, string | number>;
}

interface AuditSeed {
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const entities: Entity[] = [
  // --- Cluster A: Harbor logistics (west coast) ---
  { id: "P001", type: "person", label: "Vikram Rao", subtitle: "Logistics coordinator", clusterHint: "harbor", meta: { role: "Coordinator", risk: "medium", notes: "SYNTHETIC. Dispatches yard crews for Meridian Freight." } },
  { id: "P002", type: "person", label: "Neha Kulkarni", subtitle: "Night dispatcher", clusterHint: "harbor", meta: { role: "Dispatcher", risk: "low", notes: "SYNTHETIC. Shift lead at Mundra Yard-7." } },
  { id: "P003", type: "person", label: "Farhan Qureshi", subtitle: "Fleet operator", clusterHint: "harbor", meta: { role: "Transport", risk: "medium", notes: "SYNTHETIC. Controls a 6-truck coastal run." } },
  { id: "P004", type: "person", label: "Smit Patel", subtitle: "Bonded-shed clerk", clusterHint: "harbor", meta: { role: "Paperwork", risk: "high", notes: "SYNTHETIC. Access to Kandla shed manifests." } },
  { id: "P005", type: "person", label: "Leela Nair", subtitle: "Warehouse supervisor", clusterHint: "harbor", meta: { role: "Warehouse", risk: "low", notes: "SYNTHETIC." } },
  { id: "P006", type: "person", label: "Imran Sheikh", subtitle: "Crew lead", clusterHint: "harbor", meta: { role: "Labor", risk: "medium", notes: "SYNTHETIC." } },
  { id: "P007", type: "person", label: "Kavita Deshmukh", subtitle: "Accounts", clusterHint: "harbor", meta: { role: "Finance", risk: "medium", notes: "SYNTHETIC. Books Tideway invoices." } },
  { id: "P008", type: "person", label: "Rohan Iyer", subtitle: "Skipper", clusterHint: "harbor", meta: { role: "Vessel", risk: "medium", notes: "SYNTHETIC." } },

  { id: "PH01", type: "phone", label: "+91 90000 11001", subtitle: "Handset — Rao", clusterHint: "harbor", meta: { imei: "SYN-IMEI-11001", carrier: "DemoTel" } },
  { id: "PH02", type: "phone", label: "+91 90000 11002", subtitle: "Handset — Kulkarni", clusterHint: "harbor", meta: { imei: "SYN-IMEI-11002", carrier: "DemoTel" } },
  { id: "PH03", type: "phone", label: "+91 90000 11003", subtitle: "Yard shared line", clusterHint: "harbor", meta: { imei: "SYN-IMEI-11003", carrier: "DemoTel" } },
  { id: "PH04", type: "phone", label: "+91 90000 11004", subtitle: "Handset — Qureshi", clusterHint: "harbor", meta: { imei: "SYN-IMEI-11004", carrier: "CoastCom" } },

  { id: "L01", type: "location", label: "Mundra Yard-7", subtitle: "Fictional bonded yard", clusterHint: "harbor", meta: { region: "Kutch (synthetic)", kind: "yard" } },
  { id: "L02", type: "location", label: "Kandla Shed-12", subtitle: "Fictional customs shed", clusterHint: "harbor", meta: { region: "Kutch (synthetic)", kind: "shed" } },
  { id: "L03", type: "location", label: "Dwarka Coastal Store", subtitle: "Fictional storehouse", clusterHint: "harbor", meta: { region: "Saurashtra (synthetic)", kind: "store" } },

  { id: "O01", type: "organization", label: "Meridian Freight LLP", subtitle: "Shell logistics firm", clusterHint: "harbor", meta: { cin: "SYN-LLP-8841", status: "active" } },
  { id: "O02", type: "organization", label: "Tideway Trading", subtitle: "Invoice vehicle", clusterHint: "harbor", meta: { cin: "SYN-PVT-2290", status: "active" } },

  // --- Cluster B: Inland remittance ---
  { id: "P010", type: "person", label: "Arjun Malhotra", subtitle: "Exchange desk", clusterHint: "remittance", meta: { role: "Desk lead", risk: "high", notes: "SYNTHETIC. Runs Lotus Exchange cash window." } },
  { id: "P011", type: "person", label: "Priya Banerjee", subtitle: "Runner", clusterHint: "remittance", meta: { role: "Courier", risk: "medium", notes: "SYNTHETIC." } },
  { id: "P012", type: "person", label: "Sameer Joshi", subtitle: "Accountant", clusterHint: "remittance", meta: { role: "Books", risk: "medium", notes: "SYNTHETIC." } },
  { id: "P013", type: "person", label: "Tanvi Reddy", subtitle: "Cashier", clusterHint: "remittance", meta: { role: "Cash", risk: "low", notes: "SYNTHETIC." } },
  { id: "P014", type: "person", label: "Harish Gupta", subtitle: "Field agent", clusterHint: "remittance", meta: { role: "Field", risk: "medium", notes: "SYNTHETIC." } },
  { id: "P015", type: "person", label: "Meera Shah", subtitle: "Bookkeeper", clusterHint: "remittance", meta: { role: "Ledger", risk: "low", notes: "SYNTHETIC." } },
  { id: "P016", type: "person", label: "Yusuf Khan", subtitle: "Night courier", clusterHint: "remittance", meta: { role: "Courier", risk: "medium", notes: "SYNTHETIC." } },
  { id: "P017", type: "person", label: "Ananya Pillai", subtitle: "Compliance officer", clusterHint: "remittance", meta: { role: "Compliance", risk: "high", notes: "SYNTHETIC. Flags suppressed in the case file." } },

  { id: "PH05", type: "phone", label: "+91 90000 22005", subtitle: "Handset — Malhotra", clusterHint: "remittance", meta: { imei: "SYN-IMEI-22005", carrier: "DemoTel" } },
  { id: "PH06", type: "phone", label: "+91 90000 22006", subtitle: "Handset — Banerjee", clusterHint: "remittance", meta: { imei: "SYN-IMEI-22006", carrier: "DemoTel" } },
  { id: "PH07", type: "phone", label: "+91 90000 22007", subtitle: "Desk shared line", clusterHint: "remittance", meta: { imei: "SYN-IMEI-22007", carrier: "InlandNet" } },
  { id: "PH08", type: "phone", label: "+91 90000 22008", subtitle: "Handset — Gupta", clusterHint: "remittance", meta: { imei: "SYN-IMEI-22008", carrier: "InlandNet" } },

  { id: "L04", type: "location", label: "Jaipur Old City Desk", subtitle: "Fictional cash window", clusterHint: "remittance", meta: { region: "Rajasthan (synthetic)", kind: "desk" } },
  { id: "L05", type: "location", label: "Indore Cash Point", subtitle: "Fictional collection point", clusterHint: "remittance", meta: { region: "MP (synthetic)", kind: "cashpoint" } },
  { id: "L06", type: "location", label: "Nagpur Transit Lodge", subtitle: "Fictional layover", clusterHint: "remittance", meta: { region: "Maharashtra (synthetic)", kind: "lodge" } },

  { id: "O03", type: "organization", label: "Lotus Exchange Pvt Ltd", subtitle: "Unlicensed desk (synthetic)", clusterHint: "remittance", meta: { cin: "SYN-PVT-4412", status: "watch" } },
  { id: "O04", type: "organization", label: "Saffron Ledger Co", subtitle: "Layering vehicle", clusterHint: "remittance", meta: { cin: "SYN-PVT-4418", status: "watch" } },

  // --- Cluster C: Procurement fronts ---
  { id: "P020", type: "person", label: "Devika Menon", subtitle: "Director, Apex", clusterHint: "fronts", meta: { role: "Director", risk: "high", notes: "SYNTHETIC. Signatory on Apex Minerals." } },
  { id: "P021", type: "person", label: "Kabir Anand", subtitle: "Northwind imports", clusterHint: "fronts", meta: { role: "Importer", risk: "medium", notes: "SYNTHETIC." } },
  { id: "P022", type: "person", label: "Sana Fathima", subtitle: "Procurement", clusterHint: "fronts", meta: { role: "Buy desk", risk: "medium", notes: "SYNTHETIC." } },
  { id: "P023", type: "person", label: "Nikhil Bose", subtitle: "Cedar Holdings", clusterHint: "fronts", meta: { role: "Holdings", risk: "high", notes: "SYNTHETIC." } },
  { id: "P024", type: "person", label: "Pooja Verma", subtitle: "Invoice clerk", clusterHint: "fronts", meta: { role: "Paper", risk: "low", notes: "SYNTHETIC." } },
  { id: "P025", type: "person", label: "Aditya Rao", subtitle: "Liaison", clusterHint: "fronts", meta: { role: "Liaison", risk: "medium", notes: "SYNTHETIC. Not related to Vikram Rao." } },

  { id: "PH09", type: "phone", label: "+91 90000 33009", subtitle: "Handset — Menon", clusterHint: "fronts", meta: { imei: "SYN-IMEI-33009", carrier: "MetroLink" } },
  { id: "PH10", type: "phone", label: "+91 90000 33010", subtitle: "Northwind office line", clusterHint: "fronts", meta: { imei: "SYN-IMEI-33010", carrier: "MetroLink" } },
  { id: "PH11", type: "phone", label: "+91 90000 33011", subtitle: "Handset — Bose", clusterHint: "fronts", meta: { imei: "SYN-IMEI-33011", carrier: "MetroLink" } },

  { id: "L07", type: "location", label: "Gurugram Serviced Office", subtitle: "Fictional registered office", clusterHint: "fronts", meta: { region: "NCR (synthetic)", kind: "office" } },
  { id: "L08", type: "location", label: "Nhava Sheva Godown B", subtitle: "Fictional import godown", clusterHint: "fronts", meta: { region: "Raigad (synthetic)", kind: "godown" } },

  { id: "O05", type: "organization", label: "Apex Minerals", subtitle: "Commodity front", clusterHint: "fronts", meta: { cin: "SYN-PVT-7701", status: "active" } },
  { id: "O06", type: "organization", label: "Northwind Imports", subtitle: "Import front", clusterHint: "fronts", meta: { cin: "SYN-PVT-7708", status: "active" } },
  { id: "O07", type: "organization", label: "Cedar Holdings", subtitle: "Holding company", clusterHint: "fronts", meta: { cin: "SYN-PVT-7715", status: "dormant" } },

  // --- Bridges / hubs (make the story) ---
  { id: "P030", type: "person", label: "Karan Sethi", subtitle: "Independent consultant", clusterHint: "bridge", meta: { role: "Broker", risk: "critical", notes: "SYNTHETIC. Appears in all three clusters. Primary person of interest." } },
  { id: "P031", type: "person", label: "Zara Hussain", subtitle: "Settlement mule", clusterHint: "bridge", meta: { role: "Mule", risk: "high", notes: "SYNTHETIC. Moves value between harbor invoices and inland desks." } },
  { id: "P032", type: "person", label: "Rakesh Nanda", subtitle: "Counsel / fixer", clusterHint: "bridge", meta: { role: "Fixer", risk: "high", notes: "SYNTHETIC. Connects remittance books to front-company filings." } },

  { id: "PH99", type: "phone", label: "+91 90000 99999", subtitle: "Burner (shared)", clusterHint: "bridge", meta: { imei: "SYN-IMEI-99999", carrier: "Prepaid-X", notes: "SYNTHETIC. Handed between harbor crew and Apex office." } },
  { id: "L09", type: "location", label: "Ahmedabad Meeting Cafe", subtitle: "Fictional meetup", clusterHint: "bridge", meta: { region: "Gujarat (synthetic)", kind: "meetup" } },
  { id: "L99", type: "location", label: "Silent Jetty", subtitle: "Fictional unlisted berth", clusterHint: "bridge", meta: { region: "Gulf of Kutch (synthetic)", kind: "jetty" } },
  { id: "O08", type: "organization", label: "Pinnacle Advisory", subtitle: "Sethi's letterhead", clusterHint: "bridge", meta: { cin: "SYN-LLP-0100", status: "active" } },
];

const relations: Relation[] = [];
let edgeSeq = 1;

function stamp(day: number, hour: number) {
  const d = new Date(Date.UTC(2026, 1, day, hour, (day * 7) % 60));
  return d.toISOString();
}

function link(
  source: string,
  target: string,
  type: RelationType,
  day: number,
  hour: number,
  meta?: Record<string, string | number>,
) {
  relations.push({
    id: `E${String(edgeSeq++).padStart(3, "0")}`,
    source,
    target,
    type,
    timestamp: stamp(day, hour),
    meta,
  });
}

function ownPhone(person: string, phone: string, day: number) {
  link(person, phone, "call", day, 8, { note: "Registered handset (synthetic)", durationSec: 12 });
}

// Phones owned / used
ownPhone("P001", "PH01", 2);
ownPhone("P002", "PH02", 2);
ownPhone("P003", "PH04", 2);
ownPhone("P010", "PH05", 3);
ownPhone("P011", "PH06", 3);
ownPhone("P014", "PH08", 3);
ownPhone("P020", "PH09", 4);
ownPhone("P021", "PH10", 4);
ownPhone("P023", "PH11", 4);
ownPhone("P030", "PH99", 5);

// Shared yard / desk lines
link("P005", "PH03", "call", 6, 9, { durationSec: 180 });
link("P006", "PH03", "call", 6, 10, { durationSec: 90 });
link("P012", "PH07", "call", 7, 11, { durationSec: 240 });
link("P013", "PH07", "call", 7, 12, { durationSec: 60 });
link("P015", "PH07", "call", 7, 13, { durationSec: 75 });

// Harbor internal calls (dense)
link("P001", "P002", "call", 8, 9, { durationSec: 420 });
link("P001", "P003", "call", 8, 10, { durationSec: 300 });
link("P001", "P005", "call", 8, 14, { durationSec: 180 });
link("P002", "P006", "call", 9, 2, { durationSec: 95 });
link("P003", "P008", "call", 9, 4, { durationSec: 610 });
link("P004", "P001", "call", 9, 16, { durationSec: 200 });
link("P004", "P007", "call", 10, 11, { durationSec: 150 });
link("P007", "P005", "call", 10, 12, { durationSec: 80 });
link("P006", "P008", "call", 10, 22, { durationSec: 45 });
link("P002", "P003", "call", 11, 7, { durationSec: 130 });

// Harbor family / org / place
link("P001", "P007", "family", 1, 0, { relation: "cousin (synthetic)" });
link("P004", "P008", "family", 1, 0, { relation: "brother-in-law (synthetic)" });
link("P001", "O01", "co-location", 12, 10, { role: "operations lead" });
link("P007", "O02", "transaction", 12, 15, { amountInr: 480000, note: "invoice batch" });
link("P007", "O01", "transaction", 13, 11, { amountInr: 265000, note: "crew payout" });
link("P003", "O01", "co-location", 13, 8, { role: "contractor" });
link("P001", "L01", "co-location", 14, 6, { visits: 18 });
link("P002", "L01", "co-location", 14, 6, { visits: 22 });
link("P005", "L01", "co-location", 14, 7, { visits: 30 });
link("P006", "L01", "co-location", 14, 7, { visits: 16 });
link("P004", "L02", "co-location", 15, 9, { visits: 11 });
link("P001", "L02", "co-location", 15, 10, { visits: 4 });
link("P008", "L03", "co-location", 16, 3, { visits: 7 });
link("P006", "L03", "co-location", 16, 4, { visits: 5 });
link("O01", "L01", "co-location", 12, 0, { role: "registered yard" });
link("O02", "L02", "co-location", 12, 0, { role: "billing address" });

// Remittance internal
link("P010", "P011", "call", 8, 18, { durationSec: 200 });
link("P010", "P012", "call", 8, 19, { durationSec: 540 });
link("P010", "P013", "call", 9, 9, { durationSec: 90 });
link("P011", "P016", "call", 9, 21, { durationSec: 70 });
link("P014", "P010", "call", 10, 8, { durationSec: 260 });
link("P014", "P016", "call", 10, 20, { durationSec: 110 });
link("P015", "P012", "call", 11, 11, { durationSec: 300 });
link("P017", "P010", "call", 11, 16, { durationSec: 480 });
link("P017", "P012", "call", 12, 10, { durationSec: 190 });
link("P013", "P015", "call", 12, 14, { durationSec: 55 });
link("P011", "P014", "call", 13, 19, { durationSec: 88 });

link("P011", "P016", "family", 1, 0, { relation: "siblings (synthetic)" });
link("P010", "O03", "co-location", 12, 9, { role: "desk lead" });
link("P012", "O04", "co-location", 12, 9, { role: "books" });
link("P017", "O03", "co-location", 12, 9, { role: "compliance" });
link("P010", "L04", "co-location", 14, 10, { visits: 20 });
link("P013", "L04", "co-location", 14, 10, { visits: 20 });
link("P015", "L04", "co-location", 14, 11, { visits: 14 });
link("P011", "L05", "co-location", 15, 17, { visits: 9 });
link("P014", "L05", "co-location", 15, 18, { visits: 8 });
link("P016", "L06", "co-location", 16, 1, { visits: 6 });
link("P014", "L06", "co-location", 16, 2, { visits: 4 });
link("P010", "O03", "transaction", 17, 12, { amountInr: 1250000, note: "desk float" });
link("P012", "O04", "transaction", 17, 13, { amountInr: 890000, note: "layering" });
link("P013", "O03", "transaction", 18, 9, { amountInr: 150000, note: "cash-in" });
link("P011", "O04", "transaction", 18, 21, { amountInr: 210000, note: "runner drop" });
link("P016", "O04", "transaction", 19, 3, { amountInr: 175000, note: "night drop" });
link("O03", "L04", "co-location", 12, 0, { role: "principal desk" });
link("O04", "L05", "co-location", 12, 0, { role: "collection" });

// Fronts internal
link("P020", "P021", "call", 8, 11, { durationSec: 340 });
link("P020", "P023", "call", 8, 15, { durationSec: 410 });
link("P020", "P024", "call", 9, 10, { durationSec: 120 });
link("P021", "P022", "call", 9, 13, { durationSec: 200 });
link("P023", "P025", "call", 10, 9, { durationSec: 160 });
link("P022", "P024", "call", 10, 16, { durationSec: 95 });
link("P021", "P025", "call", 11, 12, { durationSec: 70 });
link("P023", "P022", "call", 12, 18, { durationSec: 250 });

link("P020", "O05", "co-location", 12, 9, { role: "director" });
link("P021", "O06", "co-location", 12, 9, { role: "proprietor" });
link("P023", "O07", "co-location", 12, 9, { role: "director" });
link("P024", "O05", "co-location", 13, 10, { role: "clerk" });
link("P022", "O06", "co-location", 13, 11, { role: "buy desk" });
link("P020", "L07", "co-location", 14, 9, { visits: 12 });
link("P024", "L07", "co-location", 14, 9, { visits: 18 });
link("P023", "L07", "co-location", 14, 10, { visits: 6 });
link("P021", "L08", "co-location", 15, 8, { visits: 9 });
link("P025", "L08", "co-location", 15, 8, { visits: 7 });
link("P022", "L08", "co-location", 15, 9, { visits: 5 });
link("P020", "O05", "transaction", 17, 10, { amountInr: 2400000, note: "director draw" });
link("P021", "O06", "transaction", 17, 14, { amountInr: 980000, note: "import LC" });
link("P023", "O07", "transaction", 18, 11, { amountInr: 3100000, note: "holding transfer" });
link("P024", "O07", "transaction", 19, 10, { amountInr: 420000, note: "invoice set" });
link("O05", "L07", "co-location", 12, 0, { role: "registered office" });
link("O06", "L08", "co-location", 12, 0, { role: "godown" });

// --- Bridges: this is what judges should notice ---
// Karan Sethi (P030) talks to all three cluster leads + uses burner + Pinnacle
link("P030", "P001", "call", 20, 7, { durationSec: 680, note: "harbor coordination" });
link("P030", "P010", "call", 20, 8, { durationSec: 520, note: "settlement window" });
link("P030", "P020", "call", 20, 9, { durationSec: 740, note: "front-company cover" });
link("P030", "P023", "call", 21, 11, { durationSec: 300 });
link("P030", "P004", "call", 21, 22, { durationSec: 140, note: "manifest timing" });
link("P030", "O08", "co-location", 12, 9, { role: "principal" });
link("P030", "L09", "co-location", 22, 16, { visits: 5 });
link("P030", "L99", "co-location", 23, 2, { visits: 3 });
link("P030", "O03", "transaction", 24, 10, { amountInr: 750000, note: "advisory fee" });
link("P030", "O05", "transaction", 24, 14, { amountInr: 1800000, note: "consulting" });
link("P030", "O01", "transaction", 25, 9, { amountInr: 620000, note: "retainers" });

// Zara: harbor invoices <-> remittance
link("P031", "P007", "call", 20, 18, { durationSec: 210 });
link("P031", "P010", "call", 20, 19, { durationSec: 260 });
link("P031", "P012", "call", 21, 10, { durationSec: 180 });
link("P031", "P001", "call", 22, 6, { durationSec: 90 });
link("P031", "O02", "transaction", 24, 11, { amountInr: 390000, note: "Tideway payout" });
link("P031", "O03", "transaction", 24, 20, { amountInr: 385000, note: "desk deposit" });
link("P031", "O04", "transaction", 25, 8, { amountInr: 410000, note: "second hop" });
link("P031", "L04", "co-location", 25, 9, { visits: 4 });
link("P031", "L09", "co-location", 22, 16, { visits: 3 });

// Nanda: remittance <-> fronts
link("P032", "P017", "call", 21, 12, { durationSec: 400, note: "compliance cover" });
link("P032", "P012", "call", 21, 13, { durationSec: 220 });
link("P032", "P020", "call", 21, 15, { durationSec: 310 });
link("P032", "P023", "call", 22, 10, { durationSec: 280 });
link("P032", "O07", "transaction", 26, 11, { amountInr: 900000, note: "legal retainer" });
link("P032", "O04", "transaction", 26, 12, { amountInr: 275000, note: "disbursement" });
link("P032", "L07", "co-location", 26, 14, { visits: 3 });
link("P032", "P030", "call", 27, 8, { durationSec: 900, note: "strategy" });

// Burner PH99 used across harbor + fronts
link("P006", "PH99", "call", 22, 1, { durationSec: 40, note: "borrowed burner" });
link("P020", "PH99", "call", 22, 2, { durationSec: 55, note: "borrowed burner" });
link("P025", "PH99", "call", 23, 23, { durationSec: 30 });

// Silent Jetty co-location across clusters
link("P008", "L99", "co-location", 23, 2, { visits: 2 });
link("P003", "L99", "co-location", 23, 2, { visits: 2 });
link("P025", "L99", "co-location", 23, 3, { visits: 1 });

// Ahmedabad cafe meetup (all three worlds)
link("P001", "L09", "co-location", 22, 16, { visits: 2 });
link("P010", "L09", "co-location", 22, 16, { visits: 2 });
link("P020", "L09", "co-location", 22, 16, { visits: 2 });

const auditSeed: AuditSeed[] = [
  { timestamp: "2026-03-02T04:12:11.000Z", actor: "Inv. A. Chauhan", action: "CASE_OPEN", detail: "Opened synthetic case GS-DEMO-2026-041 Operation Tide Ledger" },
  { timestamp: "2026-03-02T04:18:44.000Z", actor: "Inv. A. Chauhan", action: "SEARCH", detail: "Entity search: Karan Sethi" },
  { timestamp: "2026-03-02T04:19:02.000Z", actor: "Inv. A. Chauhan", action: "NODE_VIEW", detail: "Inspected P030 Karan Sethi" },
  { timestamp: "2026-03-02T04:27:19.000Z", actor: "Inv. R. Dasgupta", action: "SEARCH", detail: "Entity search: Lotus Exchange" },
  { timestamp: "2026-03-02T04:31:55.000Z", actor: "Inv. R. Dasgupta", action: "NODE_VIEW", detail: "Inspected O03 Lotus Exchange Pvt Ltd" },
  { timestamp: "2026-03-02T05:02:08.000Z", actor: "Inv. A. Chauhan", action: "COMMUNITY_TOGGLE", detail: "Enabled Louvain community coloring" },
  { timestamp: "2026-03-02T05:11:40.000Z", actor: "Inv. A. Chauhan", action: "NODE_VIEW", detail: "Inspected PH99 shared burner" },
  { timestamp: "2026-03-02T06:44:12.000Z", actor: "Inv. R. Dasgupta", action: "EXPORT", detail: "Exported neighborhood of P030 (redacted synthetic)" },
  { timestamp: "2026-03-02T07:15:33.000Z", actor: "Supervisor M. Iyer", action: "REVIEW", detail: "Supervisor review of flagged bridge actors" },
  { timestamp: "2026-03-02T08:03:01.000Z", actor: "Inv. A. Chauhan", action: "SEARCH", detail: "Entity search: Silent Jetty" },
];

const payload = {
  disclaimer:
    "CASE STUDY DATA — NOT REAL PERSONS. All names, phone numbers, locations, organizations, and events are synthetic fiction generated for a Smart India Hackathon prototype. They do not represent real people, real investigations, or real surveillance.",
  caseId: "GS-DEMO-2026-041",
  title: "Operation Tide Ledger (Synthetic)",
  generatedAt: new Date().toISOString(),
  entityCount: entities.length,
  relationCount: relations.length,
  entities,
  relations,
  auditSeed,
};

const outDir = join(__dirname, "..", "src", "data");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "network.json");
writeFileSync(outFile, JSON.stringify(payload, null, 2));

console.log(`Wrote ${entities.length} entities and ${relations.length} relations to ${outFile}`);
