import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react';

interface ErrorEvent {
  id: string;
  message: string;
  level: 'error' | 'warning' | 'info';
  timestamp: string;
  count: number;
  user_affected: number;
  environment: string;
  url?: string;
}

interface ErrorStats {
  total_errors: number;
  errors_24h: number;
  trend: 'up' | 'down' | 'stable';
  most_common: ErrorEvent[];
  recent: ErrorEvent[];
}

export function ErrorDashboard() {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const sentryOrg = import.meta.env.SENTRY_ORG;
  const sentryProject = import.meta.env.SENTRY_PROJECT;

  const fetchErrorStats = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      // In production, this would fetch from Sentry API
      const mockStats: ErrorStats = {
        total_errors: 1247,
        errors_24h: 23,
        trend: 'down',
        most_common: [
          {
            id: '1',
            message: 'Failed to fetch NFT metadata',
            level: 'error',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            count: 45,
            user_affected: 12,
            environment: 'production',
            url: 'https://sentry.io/issues/123',
          },
          {
            id: '2',
            message: 'Wallet connection timeout',
            level: 'warning',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            count: 32,
            user_affected: 8,
            environment: 'production',
            url: 'https://sentry.io/issues/124',
          },
          {
            id: '3',
            message: 'IPFS upload failed',
            level: 'error',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            count: 18,
            user_affected: 6,
            environment: 'production',
            url: 'https://sentry.io/issues/125',
          },
        ],
        recent: [
          {
            id: '4',
            message: 'Transaction reverted',
            level: 'error',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            count: 1,
            user_affected: 1,
            environment: 'production',
          },
          {
            id: '5',
            message: 'Image generation timeout',
            level: 'warning',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            count: 2,
            user_affected: 2,
            environment: 'production',
          },
        ],
      };

      setStats(mockStats);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorStats();
    const interval = setInterval(fetchErrorStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: string): 'destructive' | 'secondary' | 'default' => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (!sentryDsn) {
    return (
      <Card className="border-yellow-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Sentry Not Configured
          </CardTitle>
          <CardDescription>
            Error tracking is not enabled. Add VITE_SENTRY_DSN to your environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To enable error tracking:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Create a Sentry account at sentry.io</li>
            <li>Create a new project for this application</li>
            <li>Copy your DSN from project settings</li>
            <li>Add VITE_SENTRY_DSN to your .env file</li>
          </ol>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Error Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time application error tracking and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Last updated: {formatTimestamp(lastRefresh.toISOString())}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchErrorStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {sentryOrg && sentryProject && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://sentry.io/organizations/${sentryOrg}/issues/?project=${sentryProject}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Sentry
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_errors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            {stats?.trend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.errors_24h}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.trend === 'down' ? 'Decreasing' : 'Increasing'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={stats?.errors_24h && stats.errors_24h > 50 ? 'destructive' : 'secondary'} className={stats?.errors_24h && stats.errors_24h <= 50 ? 'bg-green-600 text-white' : ''}>
              {stats?.errors_24h && stats.errors_24h > 50 ? 'Needs Attention' : 'Healthy'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">System health</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Lists */}
      <Tabs defaultValue="common" className="space-y-4">
        <TabsList>
          <TabsTrigger value="common">Most Common</TabsTrigger>
          <TabsTrigger value="recent">Recent Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="common" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Common Errors</CardTitle>
              <CardDescription>
                Errors sorted by frequency in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.most_common.map((error) => (
                  <div
                    key={error.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getLevelColor(error.level)}>
                          {error.level}
                        </Badge>
                        <span className="font-medium">{error.message}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{error.count} occurrences</span>
                        <span>{error.user_affected} users affected</span>
                        <span>{formatTimestamp(error.timestamp)}</span>
                      </div>
                    </div>
                    {error.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={error.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest errors in the last hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recent.map((error) => (
                  <div
                    key={error.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getLevelColor(error.level)}>
                          {error.level}
                        </Badge>
                        <span className="font-medium">{error.message}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{error.count} occurrences</span>
                        <span>{formatTimestamp(error.timestamp)}</span>
                      </div>
                    </div>
                    {error.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={error.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
