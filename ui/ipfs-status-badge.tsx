import { motion } from 'framer-motion';
import { Database, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ipfsService } from '@/lib/ipfsService';
import { useState } from 'react';

interface IPFSStatusBadgeProps {
  ipfsHash?: string;
  status?: 'uploaded' | 'uploading' | 'error' | 'not_uploaded';
  className?: string;
  showGatewayLink?: boolean;
}

export function IPFSStatusBadge({ 
  ipfsHash, 
  status = 'not_uploaded',
  className = '',
  showGatewayLink = true 
}: IPFSStatusBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case 'uploaded':
        return {
          icon: CheckCircle2,
          color: 'from-green-500 to-emerald-500',
          text: 'On IPFS',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
        };
      case 'uploading':
        return {
          icon: Loader2,
          color: 'from-blue-500 to-cyan-500',
          text: 'Uploading...',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          animate: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'from-red-500 to-orange-500',
          text: 'Upload Failed',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
        };
      default:
        return {
          icon: Database,
          color: 'from-gray-500 to-gray-600',
          text: 'Not on IPFS',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const gatewayUrl = ipfsHash ? ipfsService.getGatewayUrl(ipfsHash) : null;

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor} ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Icon 
        className={`w-4 h-4 bg-gradient-to-r ${config.color} bg-clip-text text-transparent ${
          config.animate ? 'animate-spin' : ''
        }`}
      />
      <span className={`text-xs font-medium bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
        {config.text}
      </span>
      
      {showGatewayLink && gatewayUrl && status === 'uploaded' && (
        <motion.a
          href={gatewayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1"
          onClick={(e) => e.stopPropagation()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ExternalLink className="w-3 h-3 text-green-400 hover:text-green-300 transition-colors" />
        </motion.a>
      )}

      {/* Tooltip on hover */}
      {isHovered && ipfsHash && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute top-full mt-2 left-0 z-50 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl"
        >
          <p className="text-xs text-gray-300 font-mono whitespace-nowrap">
            {ipfsHash.slice(0, 8)}...{ipfsHash.slice(-8)}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

interface IPFSMetadataDisplayProps {
  ipfsHash?: string;
  metadataUrl?: string;
  className?: string;
}

export function IPFSMetadataDisplay({ ipfsHash, metadataUrl, className = '' }: IPFSMetadataDisplayProps) {
  if (!ipfsHash && !metadataUrl) return null;

  const hash = ipfsHash || metadataUrl?.replace('ipfs://', '') || '';
  const gatewayUrl = ipfsService.getGatewayUrl(hash);

  return (
    <div className={`p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-300">IPFS Metadata</span>
          </div>
          <p className="text-xs text-gray-400 font-mono break-all">
            {hash}
          </p>
        </div>
        <a
          href={gatewayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-purple-400 hover:text-purple-300" />
        </a>
      </div>
    </div>
  );
}
