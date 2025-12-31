import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Proposal, 
  ProposalState, 
  PROPOSAL_STATE_LABELS, 
  getProposalStateColor,
  formatTokenAmount,
  calculateVotePercentage,
  parseProposalDescription
} from '@/lib/governanceService';
import { Clock, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const { title, body } = parseProposalDescription(proposal.description);
  const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
  
  const forPercentage = calculateVotePercentage(proposal.forVotes, totalVotes);
  const againstPercentage = calculateVotePercentage(proposal.againstVotes, totalVotes);
  const abstainPercentage = calculateVotePercentage(proposal.abstainVotes, totalVotes);

  const stateColor = getProposalStateColor(proposal.state);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{body}</p>
          </div>
          <Badge className={`${stateColor} border`}>
            {PROPOSAL_STATE_LABELS[proposal.state]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voting Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">For</span>
            </div>
            <p className="text-lg font-bold">{formatTokenAmount(proposal.forVotes)}</p>
            <p className="text-xs text-muted-foreground">{forPercentage.toFixed(1)}%</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-red-500">
              <TrendingDown className="w-4 h-4" />
              <span className="font-medium">Against</span>
            </div>
            <p className="text-lg font-bold">{formatTokenAmount(proposal.againstVotes)}</p>
            <p className="text-xs text-muted-foreground">{againstPercentage.toFixed(1)}%</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Minus className="w-4 h-4" />
              <span className="font-medium">Abstain</span>
            </div>
            <p className="text-lg font-bold">{formatTokenAmount(proposal.abstainVotes)}</p>
            <p className="text-xs text-muted-foreground">{abstainPercentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Vote Progress Bar */}
        <div className="space-y-2">
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-green-500" 
              style={{ width: `${forPercentage}%` }}
            />
            <div 
              className="bg-red-500" 
              style={{ width: `${againstPercentage}%` }}
            />
            <div 
              className="bg-gray-500" 
              style={{ width: `${abstainPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{formatTokenAmount(totalVotes)} votes</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>ID: {proposal.id.toString().slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link to={`/dao/proposal/${proposal.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
