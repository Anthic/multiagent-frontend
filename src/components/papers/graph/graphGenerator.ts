import { IPaper } from '@/src/services/paperService';
import { IGraphData, IGraphNode, IGraphLink } from './graphTypes';

export function buildSemanticGraphFromPaper(paper: IPaper): IGraphData {
  const rootId = paper.id || paper._id || 'root-paper';
  const paperTitle = paper.title || 'Untitled Research Paper';
  const citations = paper.citations || [];

  const nodes: IGraphNode[] = [];
  const links: IGraphLink[] = [];

  // 1. Root Node (Current Paper)
  nodes.push({
    id: rootId,
    label: paperTitle,
    type: 'root_paper',
    cluster: 'Active Paper',
    size: 9.0,
    color: '#00E599', // Formal Emerald
    authors: ['Current Workspace Author'],
    year: new Date().getFullYear().toString(),
    abstractSnippet:
      paper.abstract ||
      paper.contentMarkdown?.substring(0, 200) ||
      'Primary research document in the active workspace.',
    citationsCount: citations.length,
    connections: [],
  });

  // 2. Citation Nodes
  if (citations.length > 0) {
    citations.forEach((c, idx) => {
      const citId = `cit-${c.citationKey || idx}`;
      nodes.push({
        id: citId,
        label: c.title,
        type: 'citation',
        cluster: 'Literature Reference',
        size: 5.5,
        color: '#38BDF8', // Formal Slate/Ice Blue
        authors: c.authors || ['Academic Scholar et al.'],
        year: c.year || '2023',
        doi: c.doi,
        url: c.url,
        abstractSnippet: `Direct reference [${c.citationKey}] linked in the research bibliography.`,
        citationsCount: Math.floor(Math.random() * 45) + 12,
        connections: [rootId],
      });

      links.push({
        source: rootId,
        target: citId,
        type: 'cites',
        label: 'References',
      });
    });
  } else {
    // Default foundational academic citations if none added yet
    const sampleCitations = [
      {
        key: 'Vaswani2017',
        title: 'Attention Is All You Need',
        authors: ['A. Vaswani', 'N. Shazeer', 'N. Parmar'],
        year: '2017',
        doi: '10.48550/arXiv.1706.03762',
      },
      {
        key: 'Devlin2018',
        title: 'BERT: Pre-training of Deep Bidirectional Transformers',
        authors: ['J. Devlin', 'M. Chang', 'K. Lee'],
        year: '2018',
        doi: '10.18653/v1/N19-1423',
      },
      {
        key: 'Brown2020',
        title: 'Language Models are Few-Shot Learners',
        authors: ['T. Brown', 'B. Mann', 'N. Ryder'],
        year: '2020',
        doi: '10.48550/arXiv.2005.14165',
      },
    ];

    sampleCitations.forEach((c) => {
      const citId = `cit-${c.key}`;
      nodes.push({
        id: citId,
        label: c.title,
        type: 'citation',
        cluster: 'Foundational Literature',
        size: 5.5,
        color: '#38BDF8',
        authors: c.authors,
        year: c.year,
        doi: c.doi,
        abstractSnippet: 'Foundational baseline literature relevant to current academic domain.',
        citationsCount: 1450,
        connections: [rootId],
      });

      links.push({
        source: rootId,
        target: citId,
        type: 'cites',
        label: 'Baseline Context',
      });
    });
  }

  // 3. Research Gap Nodes (Formal Amber)
  const gapNodes = [
    {
      id: 'gap-1',
      label: 'Zero-Shot Cross-Domain Generalization',
      cluster: 'Literature Gap',
      desc: 'Limited empirical validation on unobserved edge distributions and multi-modal transferability.',
    },
    {
      id: 'gap-2',
      label: 'Computational & Token Efficiency Bottleneck',
      cluster: 'Literature Gap',
      desc: 'High quadratic latency overhead in multi-agent consensus loops.',
    },
    {
      id: 'gap-3',
      label: 'Benchmark Robustness & Hallucination Guardrails',
      cluster: 'Literature Gap',
      desc: 'Unresolved calibration discrepancies under noisy synthetic citation contexts.',
    },
  ];

  gapNodes.forEach((g) => {
    nodes.push({
      id: g.id,
      label: g.label,
      type: 'gap',
      cluster: g.cluster,
      size: 4.8,
      color: '#F59E0B', // Formal Amber/Gold
      abstractSnippet: g.desc,
      connections: [rootId],
    });

    links.push({
      source: rootId,
      target: g.id,
      type: 'addresses_gap',
      label: 'Target Problem Void',
    });
  });

  // 4. Thematic Concept Pillars (Formal Slate/Violet)
  const conceptNodes = [
    { id: 'concept-1', label: 'Multi-Agent Consensus Architecture', cluster: 'Core Methodology' },
    { id: 'concept-2', label: 'Retrieval-Augmented Synthesis (RAG)', cluster: 'Core Methodology' },
    { id: 'concept-3', label: 'Simulated Peer Review Protocol', cluster: 'Evaluation Protocol' },
  ];

  conceptNodes.forEach((cp) => {
    nodes.push({
      id: cp.id,
      label: cp.label,
      type: 'concept',
      cluster: cp.cluster,
      size: 4.2,
      color: '#A855F7', // Formal Slate Violet
      abstractSnippet: `Key methodological paradigm underpinning the experimental setup.`,
      connections: [rootId],
    });

    links.push({
      source: rootId,
      target: cp.id,
      type: 'thematic_cluster',
      label: 'Methodological Pillar',
    });
  });

  // Interlink some citations to gaps/concepts for rich topology
  if (nodes.length > 4) {
    links.push({
      source: nodes[1].id,
      target: 'gap-1',
      type: 'addresses_gap',
      label: 'Partial Prior Work',
    });
    links.push({
      source: nodes[2] ? nodes[2].id : nodes[1].id,
      target: 'concept-1',
      type: 'thematic_cluster',
      label: 'Method Alignment',
    });
  }

  // Populate connection lists
  links.forEach((l) => {
    const sNode = nodes.find((n) => n.id === l.source);
    const tNode = nodes.find((n) => n.id === l.target);
    if (sNode && !sNode.connections.includes(l.target)) sNode.connections.push(l.target);
    if (tNode && !tNode.connections.includes(l.source)) tNode.connections.push(l.source);
  });

  return { nodes, links };
}
