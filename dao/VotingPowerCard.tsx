import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTokenAmount } from '@/lib/governanceService';
import { Vote, TrendingUp, Users } from 'lucide-react';

interface VotingPowerCardProps {
  balance: bigint;
  votingPower: bigint;
  delegatedTo: string;
  userAddress?: string;
  onDelegate?: () => void;
}

export function VotingPowerCard({ 
  balance, 
  votingPower, 
  delegatedTo,
  userAddress,
  onDelegate 
}: VotingPowerCardProps) {
  const isDelegated = delegatedTo.toLowerCase() !== userAddress?.toLowerCase();
  const isSelfDelegated = delegatedTo.toLowerCase() === userAddress?.toLowerCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="w-5 h-5" />
          Your Voting Power
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Token Balance</p>
            <p className="text-2xl font-bold">{formatTokenAmount(balance)}</p>
            <p className="text-xs text-muted-foreground">KOBO</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Voting Power</p>
            <p className="text-2xl font-bold">{formatTokenAmount(votingPower)}</p>
            <p className="text-xs text-muted-foreground">Votes</p>
          </div>
        </div>

        {/* Delegation Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Delegation Status</span>
            {isSelfDelegated && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Users className="w-3 h-3 mr-1" />
                Self-Delegated
              </Badge>
            )}
            {isDelegated && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <TrendingUp className="w-3 h-3 mr-1" />
                Delegated
              </Badge>
            )}
            {!isSelfDelegated && !isDelegated && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                Not Delegated
              </Badge>
            )}
          </div>

          {isDelegated && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Delegated to: {delegatedTo.slice(0, 6)}...{delegatedTo.slice(-4)}
            </div>
          )}
        </div>

        {/* Delegate Button */}
        <Button 
          onClick={onDelegate} 
          variant="outline" 
          className="w-full"
        >
          {isSelfDelegated ? 'Change Delegation' : 'Delegate Voting Power'}
        </Button>

        {!isSelfDelegated && !isDelegated && (
          <p className="text-xs text-muted-foreground text-center">
            You must delegate your voting power to participate in governance
          </p>
        )}
      </CardContent>
    </Card>
  );
}
