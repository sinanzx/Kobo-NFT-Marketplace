import { LineageNode, formatGeneration, getRelationshipLabel } from '../../lib/provenanceService';
import { Clock, GitBranch, Users, ArrowRight } from 'lucide-react';

interface TimelineViewProps {
  lineageData: LineageNode[];
  currentTokenId: bigint;
  onNodeClick?: (tokenId: bigint) => void;
}

export default function TimelineView({ lineageData, currentTokenId, onNodeClick }: TimelineViewProps) {
  // Sort by creation time
  const sortedData = [...lineageData].sort((a, b) => 
    Number(a.createdAt) - Number(b.createdAt)
  );

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No timeline data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500" />

      {/* Timeline Items */}
      <div className="space-y-8 relative">
        {sortedData.map((node, index) => {
          const isCurrentToken = node.tokenId === currentTokenId;
          const date = new Date(Number(node.createdAt) * 1000);

          return (
            <div key={node.tokenId.toString()} className="relative pl-20">
              {/* Timeline Dot */}
              <div className={`
                absolute left-6 top-6 w-5 h-5 rounded-full border-4 
                ${isCurrentToken 
                  ? 'bg-purple-500 border-purple-200 dark:border-purple-800 shadow-lg shadow-purple-500/50' 
                  : 'bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700'
                }
              `} />

              {/* Event Card */}
              <div
                onClick={() => onNodeClick?.(node.tokenId)}
                className={`
                  p-6 rounded-lg border-2 cursor-pointer transition-all
                  ${isCurrentToken
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-400 hover:shadow-md'
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Token #{node.tokenId.toString()}
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      {formatGeneration(Number(node.generation))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {date.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {date.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Creator:
                  </span>
                  <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {node.creator.slice(0, 6)}...{node.creator.slice(-4)}
                  </code>
                </div>

                {/* Parent Relationships */}
                {node.parents.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Derived From:
                      </span>
                    </div>
                    <div className="pl-6 space-y-2">
                      {node.parents.map((parent, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {getRelationshipLabel(parent.relationship)}
                          </span>
                          <span className="text-gray-500">of</span>
                          <code className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            #{parent.tokenId.toString()}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Children Count */}
                {node.children.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {node.children.length}
                      </span>
                      {' '}derivative{node.children.length > 1 ? 's' : ''} created from this NFT
                    </p>
                  </div>
                )}

                {/* Current Token Badge */}
                {isCurrentToken && (
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Current NFT
                    </span>
                  </div>
                )}
              </div>

              {/* Connector to Next Item */}
              {index < sortedData.length - 1 && (
                <div className="absolute left-8 top-full w-0.5 h-8 bg-gradient-to-b from-purple-400 to-transparent" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
