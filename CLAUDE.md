## graphify RAG system

The knowledge graph at `D:\dev\FlowOS_prototype\graphify-out\` is the primary RAG index for this codebase. Use it before touching any source file.

Key files:
- `graphify-out/GRAPH_REPORT.md` — god nodes, communities, surprising connections, suggested questions
- `graphify-out/graph.json` — full graph (437 nodes, 750 edges, 33 communities) for programmatic traversal
- `graphify-out/graph.html` — interactive visualization, open in browser

Rules:
- ALWAYS read `graphify-out/GRAPH_REPORT.md` before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map.
- For cross-module "how does X relate to Y" questions, use `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` — these traverse EXTRACTED + INFERRED edges instead of scanning files.
- God nodes to be aware of: `useFlowStore` (35 edges, bridges 11 communities), `escapeHtml()` (16 edges), `renderDashboard()` (15 edges). Changes near these will have wide blast radius.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
