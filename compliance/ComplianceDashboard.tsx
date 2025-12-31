import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Calendar,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getComplianceEventHistory,
  getComplianceStats,
  ComplianceEvent,
} from '@/lib/complianceService';
import { ComplianceResultsModal, ComplianceScanResult } from './ComplianceResultsModal';
import { formatDistanceToNow } from 'date-fns';

export function ComplianceDashboard() {
  const [events, setEvents] = useState<ComplianceEvent[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    passed: 0,
    warnings: 0,
    blocked: 0,
    critical: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ComplianceEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | ComplianceEvent['eventType']>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, statsData] = await Promise.all([
        getComplianceEventHistory(100),
        getComplianceStats(),
      ]);
      setEvents(eventsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.eventType === filter);

  const handleViewEvent = (event: ComplianceEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const getEventIcon = (eventType: ComplianceEvent['eventType']) => {
    switch (eventType) {
      case 'scan_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'content_blocked':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning_issued':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'remediation_required':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'blocklist_updated':
        return <Shield className="w-5 h-5 text-blue-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: ComplianceEvent['severity']) => {
    const variants: Record<ComplianceEvent['severity'], { variant: any; label: string }> = {
      info: { variant: 'secondary', label: 'Info' },
      warning: { variant: 'default', label: 'Warning' },
      error: { variant: 'destructive', label: 'Error' },
      critical: { variant: 'destructive', label: 'Critical' },
    };
    const config = variants[severity];
    return (
      <Badge variant={config.variant} className="font-dm-sans">
        {config.label}
      </Badge>
    );
  };

  const passRate = stats.totalScans > 0 
    ? ((stats.passed / stats.totalScans) * 100).toFixed(1) 
    : '0';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-jost font-bold text-3xl flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-500" />
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground font-dm-sans mt-1">
            Track your content compliance history and statistics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-dm-sans">Total Scans</CardDescription>
            <CardTitle className="text-3xl font-jost">{stats.totalScans}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-dm-sans">
              <Calendar className="w-4 h-4" />
              All time
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="font-dm-sans">Passed</CardDescription>
            <CardTitle className="text-3xl font-jost text-green-600 dark:text-green-400">
              {stats.passed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-dm-sans">
              <TrendingUp className="w-4 h-4" />
              {passRate}% pass rate
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="font-dm-sans">Warnings</CardDescription>
            <CardTitle className="text-3xl font-jost text-yellow-600 dark:text-yellow-400">
              {stats.warnings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 font-dm-sans">
              <AlertTriangle className="w-4 h-4" />
              Review needed
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="font-dm-sans">Blocked</CardDescription>
            <CardTitle className="text-3xl font-jost text-red-600 dark:text-red-400">
              {stats.blocked}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-dm-sans">
              <XCircle className="w-4 h-4" />
              Cannot mint
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/50 bg-purple-50 dark:bg-purple-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="font-dm-sans">Critical</CardDescription>
            <CardTitle className="text-3xl font-jost text-purple-600 dark:text-purple-400">
              {stats.critical}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-dm-sans">
              <Shield className="w-4 h-4" />
              High priority
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-jost">Event History</CardTitle>
              <CardDescription className="font-dm-sans">
                Detailed log of all compliance scans and events
              </CardDescription>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="font-dm-sans">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="scan_completed">Scans</TabsTrigger>
                <TabsTrigger value="warning_issued">Warnings</TabsTrigger>
                <TabsTrigger value="content_blocked">Blocked</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-dm-sans">No events found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => handleViewEvent(event)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getEventIcon(event.eventType)}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold font-dm-sans">
                              {event.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            {getSeverityBadge(event.severity)}
                          </div>
                          {event.metadata?.promptText && (
                            <p className="text-sm text-muted-foreground font-dm-sans line-clamp-2">
                              {event.metadata.promptText}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground font-dm-sans">
                            <span>{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</span>
                            {event.metadata?.aiEngine && <span>Engine: {event.metadata.aiEngine}</span>}
                            {event.metadata?.outputType && <span>Type: {event.metadata.outputType}</span>}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="font-dm-sans">
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent?.scanResult && (
        <ComplianceResultsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          scanResult={selectedEvent.scanResult as ComplianceScanResult}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
