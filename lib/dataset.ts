import network from "@/data/network.json";
import { analyzeGraph } from "./graph";
import type { NetworkDataset } from "./types";

export const dataset = network as unknown as NetworkDataset;
export const analysis = analyzeGraph(dataset.entities, dataset.relations);

export const entityById = Object.fromEntries(dataset.entities.map((e) => [e.id, e]));

export const DEMO_ACTOR = "Demo Investigator";
