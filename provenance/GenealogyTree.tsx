import { useEffect, useState } from 'react';
import { LineageNode } from '../../lib/provenanceService';
import { Users, GitBranch, Clock, Hash } from 'lucide-react';

interface GenealogyTreeProps {
  tokenId: bigint;
  lineageData: LineageNode[];
  onNodeClick?: (tokenId: bigint) => void;
}

interface TreeNode {
  node: LineageNode;
  children: TreeNode[];
  level: number;
}

export default function GenealogyTree({ tokenId, lineageData, onNodeClick }: GenealogyTreeProps) {
  const [treeStructure, setTreeStructure] = useState<TreeNode | null>(null);

  useEffect(() => {
    if (lineageData.length === 0) return;

    // Build tree structure from lineage data
    const nodeMap = new Map<string, TreeNode>();
    
    // Create all nodes
    lineageData.forEach(node => {
      nodeMap.set(node.tokenId.toString(), {
        node,
        children: [],
        level: Number(node.generation),
      });
    });

    // Link children to parents
    lineageData.forEach(node => {
      const treeNode = nodeMap.get(node.tokenId.toString());
      if (!treeNode) return;

      node.children.forEach(childId => {
        const childNode = nodeMap.get(childId.toString());
        if (childNode) {
          treeNode.children.push(childNode);
        }
      });
    });

    // Find root (the node we're viewing)
    const root = nodeMap.get(tokenId.toString());
    setTreeStructure(root || null);
  }, [lineageData, tokenId]);

  const renderNode = (treeNode: TreeNode, isRoot: boolean = false) => {
    const { node } = treeNode;
    const isCurrentToken = node.tokenId === tokenId;

    return (
      <div key={node.tokenId.toString()} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => onNodeClick?.(node.tokenId)}
          className={`
            relative p-4 rounded-lg border-2 cursor-pointer transition-all
            ${isCurrentToken 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg' 
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-400 hover:shadow-md'
            }
            min-w-[280px] max-w-[320px]
          `}
        >
          {/* Generation Badge */}
          <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
            Gen {node.generation.toString()}
          </div>

          {/* Token ID */}
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <span className="font-mono text-sm font-semibold">
              Token #{node.tokenId.toString()}
            </span>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {node.creator.slice(0, 6)}...{node.creator.slice(-4)}
            </span>
          </div>

          {/* Created At */}
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {new Date(Number(node.createdAt) * 1000).toLocaleDateString()}
            </span>
          </div>

          {/* Relationship Info */}
          {node.parents.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  {node.parents.length} Parent{node.parents.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Children Count */}
          {node.children.length > 0 && (
            <div className="mt-1">
              <span className="text-xs text-gray-500">
                {node.children.length} Derivative{node.children.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Children */}
        {treeNode.children.length > 0 && (
          <div className="mt-8">
            {/* Connector Line */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-transparent mx-auto" />
            
            {/* Children Grid */}
            <div className="flex gap-8 justify-center flex-wrap">
              {treeNode.children.map(child => (
                <div key={child.node.tokenId.toString()} className="relative">
                  {/* Connector Line to Child */}
                  <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-gradient-to-b from-transparent to-purple-400" />
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!treeStructure) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        <div className="text-center">
          <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No lineage data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full p-8">
        {renderNode(treeStructure, true)}
      </div>
    </div>
  );
}
