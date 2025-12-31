import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface ReverseSearchMatch {
  score: number;
  imageUrl: string;
  domain: string;
  crawlDate: string;
  backlinks: number;
}

export interface ComplianceScanResult {
  status: 'scanning' | 'passed' | 'warning' | 'blocked';
  outputId?: string;
  scanTimestamp: string;
  reverseSearchResult?: {
    totalMatches: number;
    matches: ReverseSearchMatch[];
    highestScore: number;
    isAboveThreshold: boolean;
    threshold: number;
  };
  
  // Flagged content
  flaggedTerms?: string[];
  flaggedCategories?: string[];
  blockedContent?: {
    type: 'trademark' | 'copyright' | 'restricted_term' | 'nsfw';
    term: string;
    reason: string;
    documentationUrl?: string;
  }[];
  
  // Similarity checks
  similarityMatches?: {
    url?: string;
    score?: number;
    source?: string;
    metadata?: Record<string, any>;
    matchType?: 'visual' | 'text' | 'audio';
    confidence?: number;
    reference?: string;
    details?: string;
  }[];
  
  // Recommendations
  recommendations?: string[];
  remediationSteps?: {
    step: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  
  // Metadata
  aiEngine?: string;
  outputType?: string;
  complianceScore?: number;
}

interface ComplianceResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanResult: ComplianceScanResult | null;
  onProceed?: () => void;
  onRemediate?: () => void;
  onCancel?: () => void;
}

export function ComplianceResultsModal({
  open,
  onOpenChange,
  scanResult,
  onProceed,
  onRemediate,
  onCancel,
}: ComplianceResultsModalProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    flagged: true,
    blocked: true,
    reverseSearch: true,
    similarity: false,
    recommendations: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusConfig = () => {
    switch (scanResult?.status) {
      case 'scanning':
        return {
          icon: Loader2,
          iconClass: 'text-blue-500 animate-spin',
          title: 'Scanning Content',
          description: 'Analyzing your content for compliance issues...',
          bgClass: 'bg-blue-50 dark:bg-blue-950/20',
        };
      case 'passed':
        return {
          icon: CheckCircle2,
          iconClass: 'text-green-500',
          title: 'Compliance Check Passed',
          description: 'Your content meets all compliance requirements.',
          bgClass: 'bg-green-50 dark:bg-green-950/20',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconClass: 'text-yellow-500',
          title: 'Review Required',
          description: 'Some potential issues detected. Please review before proceeding.',
          bgClass: 'bg-yellow-50 dark:bg-yellow-950/20',
        };
      case 'blocked':
        return {
          icon: XCircle,
          iconClass: 'text-red-500',
          title: 'Content Blocked',
          description: 'Your content contains restricted elements and cannot be minted.',
          bgClass: 'bg-red-50 dark:bg-red-950/20',
        };
      default:
        return {
          icon: Shield,
          iconClass: 'text-gray-500',
          title: 'Compliance Check',
          description: 'Checking content compliance...',
          bgClass: 'bg-gray-50 dark:bg-gray-950/20',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const canProceed = scanResult?.status === 'passed' || scanResult?.status === 'warning';
  const needsRemediation = scanResult?.status === 'warning' || scanResult?.status === 'blocked';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className={`flex items-center gap-3 p-4 rounded-lg ${statusConfig.bgClass}`}>
            <StatusIcon className={`w-8 h-8 ${statusConfig.iconClass}`} />
            <div className="flex-1">
              <DialogTitle className="text-xl font-jost">{statusConfig.title}</DialogTitle>
              <DialogDescription className="font-dm-sans">
                {statusConfig.description}
              </DialogDescription>
            </div>
            {scanResult?.complianceScore !== undefined && (
              <div className="text-right">
                <div className="text-2xl font-bold font-jost">
                  {scanResult.complianceScore}%
                </div>
                <div className="text-xs text-muted-foreground font-dm-sans">Score</div>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {/* Blocked Content Section */}
            {scanResult?.blockedContent && scanResult.blockedContent.length > 0 && (
              <Collapsible
                open={expandedSections.blocked}
                onOpenChange={() => toggleSection('blocked')}
              >
                <CollapsibleTrigger className="w-full">
                  <Alert className="border-red-500/50 bg-red-50 dark:bg-red-950/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <AlertDescription className="font-semibold font-dm-sans">
                          Blocked Content ({scanResult.blockedContent.length})
                        </AlertDescription>
                      </div>
                      {expandedSections.blocked ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </Alert>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-2">
                    {scanResult.blockedContent.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-white dark:bg-gray-900"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="font-dm-sans">
                                {item.type.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                              <code className="text-sm font-mono bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                                {item.term}
                              </code>
                            </div>
                            <p className="text-sm text-muted-foreground font-dm-sans">
                              {item.reason}
                            </p>
                          </div>
                          {item.documentationUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(item.documentationUrl, '_blank')}
                              className="font-dm-sans"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Learn More
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Flagged Terms Section */}
            {scanResult?.flaggedTerms && scanResult.flaggedTerms.length > 0 && (
              <Collapsible
                open={expandedSections.flagged}
                onOpenChange={() => toggleSection('flagged')}
              >
                <CollapsibleTrigger className="w-full">
                  <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <AlertDescription className="font-semibold font-dm-sans">
                          Flagged Terms ({scanResult.flaggedTerms.length})
                        </AlertDescription>
                      </div>
                      {expandedSections.flagged ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </Alert>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {scanResult.flaggedTerms.map((term, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 font-dm-sans"
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                  {scanResult.flaggedCategories && scanResult.flaggedCategories.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-muted-foreground font-dm-sans">Categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {scanResult.flaggedCategories.map((cat, idx) => (
                          <Badge key={idx} variant="secondary" className="font-dm-sans">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Reverse Image Search Results */}
            {scanResult?.reverseSearchResult && scanResult.reverseSearchResult.totalMatches > 0 && (
              <Collapsible
                open={expandedSections.reverseSearch || false}
                onOpenChange={() => toggleSection('reverseSearch')}
              >
                <CollapsibleTrigger className="w-full">
                  <Alert className={`cursor-pointer transition-colors ${
                    scanResult.reverseSearchResult.isAboveThreshold
                      ? 'border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`h-5 w-5 ${
                          scanResult.reverseSearchResult.isAboveThreshold ? 'text-orange-500' : ''
                        }`} />
                        <AlertDescription className="font-semibold font-dm-sans">
                          Reverse Image Search: {scanResult.reverseSearchResult.totalMatches} matches found
                          {scanResult.reverseSearchResult.isAboveThreshold && (
                            <Badge variant="destructive" className="ml-2">High Similarity</Badge>
                          )}
                        </AlertDescription>
                      </div>
                      {expandedSections.reverseSearch ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </Alert>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      <p className="text-sm font-dm-sans">
                        <span className="font-semibold">Highest Match Score:</span>{' '}
                        <span className={scanResult.reverseSearchResult.highestScore >= scanResult.reverseSearchResult.threshold ? 'text-orange-600 font-bold' : ''}>
                          {scanResult.reverseSearchResult.highestScore}%
                        </span>
                        {' '}(Threshold: {scanResult.reverseSearchResult.threshold}%)
                      </p>
                    </div>
                    {scanResult.reverseSearchResult.matches.slice(0, 5).map((match, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border rounded-lg p-4 bg-white dark:bg-gray-900 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-dm-sans">
                            {match.score}% Match
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(match.imageUrl, '_blank')}
                            className="font-dm-sans"
                          >
                            View Image
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-sm font-dm-sans">
                          <p>
                            <span className="text-muted-foreground">Domain:</span>{' '}
                            <a href={`https://${match.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {match.domain}
                            </a>
                          </p>
                          <p className="text-muted-foreground">
                            Crawled: {new Date(match.crawlDate).toLocaleDateString()}
                          </p>
                          <p className="text-muted-foreground">
                            {match.backlinks} backlink{match.backlinks !== 1 ? 's' : ''} found
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Similarity Matches Section */}
            {scanResult?.similarityMatches && scanResult.similarityMatches.length > 0 && (
              <Collapsible
                open={expandedSections.similarity}
                onOpenChange={() => toggleSection('similarity')}
              >
                <CollapsibleTrigger className="w-full">
                  <Alert className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDescription className="font-semibold font-dm-sans">
                          Similarity Matches ({scanResult.similarityMatches.length})
                        </AlertDescription>
                      </div>
                      {expandedSections.similarity ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </Alert>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-2">
                    {scanResult.similarityMatches.map((match, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 bg-white dark:bg-gray-900 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-dm-sans">
                            {match.matchType?.toUpperCase() || 'VISUAL'}
                          </Badge>
                          <span className="text-sm font-semibold font-dm-sans">
                            {match.score ? `${match.score}%` : match.confidence ? `${(match.confidence * 100).toFixed(1)}%` : 'N/A'} match
                          </span>
                        </div>
                        {match.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(match.url, '_blank')}
                            className="font-dm-sans w-full justify-start"
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Source
                          </Button>
                        )}
                        {match.source && (
                          <p className="text-sm font-dm-sans">
                            <span className="text-muted-foreground">Source:</span> {match.source}
                          </p>
                        )}
                        {match.reference && (
                          <p className="text-sm font-dm-sans">
                            <span className="text-muted-foreground">Reference:</span> {match.reference}
                          </p>
                        )}
                        {match.details && (
                          <p className="text-xs text-muted-foreground font-dm-sans">{match.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Recommendations Section */}
            {scanResult?.recommendations && scanResult.recommendations.length > 0 && (
              <Collapsible
                open={expandedSections.recommendations}
                onOpenChange={() => toggleSection('recommendations')}
              >
                <CollapsibleTrigger className="w-full">
                  <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <AlertDescription className="font-semibold font-dm-sans">
                          Recommendations ({scanResult.recommendations.length})
                        </AlertDescription>
                      </div>
                      {expandedSections.recommendations ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </Alert>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-2 space-y-2">
                    {scanResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm font-dm-sans">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Remediation Steps */}
            {scanResult?.remediationSteps && scanResult.remediationSteps.length > 0 && (
              <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-r-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2 font-jost">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Remediation Steps
                </h4>
                <div className="space-y-3">
                  {scanResult.remediationSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Badge
                        variant={
                          step.priority === 'high'
                            ? 'destructive'
                            : step.priority === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                        className="font-dm-sans"
                      >
                        {step.priority.toUpperCase()}
                      </Badge>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm font-dm-sans">{step.step}</p>
                        <p className="text-sm text-muted-foreground font-dm-sans">{step.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan Metadata */}
            {scanResult && (
              <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t font-dm-sans">
                <p>Scan ID: {scanResult.outputId || 'N/A'}</p>
                <p>Timestamp: {new Date(scanResult.scanTimestamp).toLocaleString()}</p>
                {scanResult.aiEngine && <p>AI Engine: {scanResult.aiEngine}</p>}
                {scanResult.outputType && <p>Output Type: {scanResult.outputType}</p>}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="font-dm-sans">
              Cancel
            </Button>
          )}
          {needsRemediation && onRemediate && (
            <Button variant="secondary" onClick={onRemediate} className="font-dm-sans">
              <FileText className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          )}
          {canProceed && onProceed && (
            <Button onClick={onProceed} className="font-dm-sans">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Proceed to Mint
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
