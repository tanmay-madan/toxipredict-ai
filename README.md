# ToxiPredict AI

## Overview
ToxiPredict AI is a web-based application designed to analyze chemical compounds and evaluate their toxicity.

The platform enables users to input either a compound name or a SMILES string and returns a structured, interpretable analysis including toxicity scores, molecular descriptors, structural risk indicators, and a concise prediction summary.

The system is built to simplify complex chemical insights through an intuitive and responsive interface, making it suitable for educational, research, and demonstration purposes.


#Live Application
https://toxipredict-ai.vercel.app/


Technology Stack
Frontend
* React (TypeScript)
* Vite
* Tailwind CSS

Data Visualization
* Recharts

UI and Animation
* Lucide React
* Framer Motion

Development Tools
* Git and GitHub
* Visual Studio Code
* npm

# Setup Instructions
1. Clone Repository

```bash id="k2m9rl"
git clone https://github.com/tanmay-madan/toxipredict-ai.git
cd toxipredict-ai
```

2. Install Dependencies

```bash id="t0kqpm"
npm install
```

3. Run Development Server

```bash id="l9a7xf"
npm run dev
```

Application will be available at:

```id="y2bdw1"
http://localhost:5173
```

Key Features
* Supports input via chemical names and SMILES notation
* Generates quantitative toxicity evaluation
* Computes essential molecular properties:
  * LogP (lipophilicity)
  * QED (drug-likeness)
  * SAS (synthetic accessibility)
  * Molecular weight
* Identifies structural risk factors with explanations
* Detects toxicological structural alerts
* Produces a clear prediction summary

Visualization
* Radar charts for molecular property distribution
* Bar charts for comparative toxicity analysis
  
Additional Functionality
* Maintains a session-based history of analyzed compounds
* Fully responsive and interactive user interface

System Workflow
1. User submits a compound (name or SMILES string)
2. Input is processed and analyzed to generate structured results
3. Output includes:
   * Toxicity score
   * Molecular descriptors
   * Structural risk factors
   * Structural alerts
   * Prediction summary
4. Data is stored in application state
5. UI components dynamically render results
6. Visualizations are generated for interpretability
7. Results are appended to analysis history

Design Considerations
* Emphasis on clarity and interpretability of results
* Modular and scalable frontend architecture
* Optimized for performance and user experience

Future Enhancements
* User authentication and profile management
* Persistent database integration for history storage
* Exportable reports (PDF/CSV)
* Expanded chemical and toxicological analysis capabilities

Author:
Tanmay Madan
