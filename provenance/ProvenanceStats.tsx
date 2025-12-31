import { ProvenanceMetadata, formatGeneration } from '../../lib/provenanceService';
import { GitBranch, Users, Clock, TrendingUp, Award } from 'lucide-react';

interface ProvenanceStatsProps {
  metadata: ProvenanceMetadata;
}

export default function ProvenanceStats({ metadata }: ProvenanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Generation */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Generation</h3>
        </div>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {formatGeneration(metadata.generation)}
        </p>
        {metadata.isOriginal && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Original Creation
          </p>
        )}
      </div>

      {/* Creator */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Creator</h3>
        </div>
        <p className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
          {metadata.creator.slice(0, 6)}...{metadata.creator.slice(-4)}
        </p>
        <p className="text-xs text-gray-500 mt-1 font-mono truncate">
          {metadata.creator}
        </p>
      </div>

      {/* Created Date */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Created</h3>
        </div>
        <p className="text-lg font-bold text-green-600 dark:text-green-400">
          {metadata.createdAt.toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {metadata.createdAt.toLocaleTimeString()}
        </p>
      </div>

      {/* Parent Count */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Parents</h3>
        </div>
        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {metadata.parents.length}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {metadata.parents.length === 0 ? 'Original work' : 
           metadata.parents.length === 1 ? 'Single parent' : 
           'Composite work'}
        </p>
      </div>

      {/* Children Count */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-lg border border-pink-200 dark:border-pink-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-pink-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Direct Derivatives</h3>
        </div>
        <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
          {metadata.children.length}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Immediate children
        </p>
      </div>

      {/* Total Descendants */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Total Descendants</h3>
        </div>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          {metadata.descendantCount}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          All generations
        </p>
      </div>
    </div>
  );
}
