export interface MolecularData {
  smiles: string;
  name?: string;
  toxicityScore: number; // 0 to 1
  properties: {
    logP: number;
    qed: number;
    sas: number;
    molecularWeight: number;
  };
  riskFactors: {
    feature: string;
    impact: number; // -1 to 1
    description: string;
  }[];
  prediction: string;
  structuralAlerts: string[];
}

export const SAMPLE_COMPOUNDS: MolecularData[] = [
  {
    smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
    name: "Aspirin",
    toxicityScore: 0.12,
    properties: {
      logP: 1.19,
      qed: 0.53,
      sas: 1.5,
      molecularWeight: 180.16
    },
    riskFactors: [
      { feature: "Carboxylic Acid", impact: -0.2, description: "Common functional group, generally low toxicity." },
      { feature: "Ester linkage", impact: 0.1, description: "Metabolically labile, reduces systemic exposure." }
    ],
    prediction: "Low toxicity predicted. Well-characterized safety profile.",
    structuralAlerts: []
  },
  {
    smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    name: "Caffeine",
    toxicityScore: 0.25,
    properties: {
      logP: -0.07,
      qed: 0.48,
      sas: 2.1,
      molecularWeight: 194.19
    },
    riskFactors: [
      { feature: "Xanthine core", impact: 0.2, description: "Stimulant properties, potential for cardiovascular effects at high doses." }
    ],
    prediction: "Moderate-low toxicity. Primary risks associated with CNS stimulation.",
    structuralAlerts: []
  },
  {
    smiles: "ClC1=CC=C(C=C1)C(C2=CC=C(Cl)C=C2)C(Cl)(Cl)Cl",
    name: "DDT",
    toxicityScore: 0.85,
    properties: {
      logP: 6.91,
      qed: 0.32,
      sas: 3.8,
      molecularWeight: 354.49
    },
    riskFactors: [
      { feature: "Organochlorine", impact: 0.9, description: "High environmental persistence and bioaccumulation risk." },
      { feature: "High Lipophilicity", impact: 0.7, description: "Promotes accumulation in fatty tissues." }
    ],
    prediction: "High toxicity predicted. Significant environmental and biological persistence concerns.",
    structuralAlerts: ["Organohalogen", "High logP"]
  }
];
