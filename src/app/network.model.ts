// Node interface definition
export interface Node {
  nodeID: number;
  isHub: boolean;
  hasCam: boolean;
  currentMAC: number[];
  previousMAC: number[];
  nextMACsCount: number;
  nextMACs: number[][];
}

// R3ENetwork interface definition
export interface R3ENetwork {
  nodeCount: number;
  nodeList: Node[];
}
