import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toHex } from 'viem';
import { GOVERNOR_ABI, GOVERNOR_ADDRESS, GOVERNANCE_PARAMS, formatTokenAmount } from '@/lib/governanceService';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userVotingPower: bigint;
  onSuccess?: () => void;
}

interface ProposalAction {
  target: string;
  value: string;
  calldata: string;
  description: string;
}

export function CreateProposalModal({ 
  open, 
  onOpenChange, 
  userVotingPower,
  onSuccess 
}: CreateProposalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState<ProposalAction[]>([
    { target: '', value: '0', calldata: '0x', description: '' }
  ]);

  const hasEnoughVotingPower = userVotingPower >= GOVERNANCE_PARAMS.proposalThreshold;

  // Create proposal mutation
  const { writeContract: createProposal, data: proposalHash } = useWriteContract();
  const { isLoading: isCreating, isSuccess } = useWaitForTransactionReceipt({
    hash: proposalHash,
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setActions([{ target: '', value: '0', calldata: '0x', description: '' }]);
  };

  const addAction = () => {
    setActions([...actions, { target: '', value: '0', calldata: '0x', description: '' }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  const updateAction = (index: number, field: keyof ProposalAction, value: string) => {
    const newActions = [...actions];
    newActions[index][field] = value;
    setActions(newActions);
  };

  const handleCreate = () => {
    if (!title || !description) {
      toast({
        title: 'Error',
        description: 'Please provide a title and description',
        variant: 'destructive',
      });
      return;
    }

    if (!hasEnoughVotingPower) {
      toast({
        title: 'Insufficient Voting Power',
        description: `You need at least ${formatTokenAmount(GOVERNANCE_PARAMS.proposalThreshold)} KOBO voting power to create a proposal`,
        variant: 'destructive',
      });
      return;
    }

    // Validate actions
    for (const action of actions) {
      if (!action.target || !action.target.startsWith('0x')) {
        toast({
          title: 'Invalid Action',
          description: 'All actions must have a valid target address',
          variant: 'destructive',
        });
        return;
      }
    }

    const targets = actions.map(a => a.target as `0x${string}`);
    const values = actions.map(a => parseEther(a.value || '0'));
    const calldatas = actions.map(a => (a.calldata || '0x') as `0x${string}`);
    const fullDescription = `${title}\n\n${description}`;

    createProposal({
      address: GOVERNOR_ADDRESS,
      abi: GOVERNOR_ABI,
      functionName: 'propose',
      args: [targets, values, calldatas, fullDescription],
    });
  };

  // Handle success
  if (isSuccess && proposalHash) {
    toast({
      title: 'Proposal Created!',
      description: 'Your governance proposal has been submitted',
    });
    resetForm();
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Governance Proposal</DialogTitle>
          <DialogDescription>
            Submit a proposal for the DAO to vote on
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Voting Power Check */}
          {!hasEnoughVotingPower && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need at least {formatTokenAmount(GOVERNANCE_PARAMS.proposalThreshold)} KOBO voting power to create a proposal.
                You currently have {formatTokenAmount(userVotingPower)} voting power.
              </AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Increase Community Allocation"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of your proposal..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Proposal Actions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            </div>

            {actions.map((action, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Action {index + 1}</span>
                  {actions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Target Contract Address</Label>
                  <Input
                    value={action.target}
                    onChange={(e) => updateAction(index, 'target', e.target.value)}
                    placeholder="0x..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>ETH Value (optional)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={action.value}
                    onChange={(e) => updateAction(index, 'value', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Calldata (optional)</Label>
                  <Input
                    value={action.calldata}
                    onChange={(e) => updateAction(index, 'calldata', e.target.value)}
                    placeholder="0x"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Action Description</Label>
                  <Input
                    value={action.description}
                    onChange={(e) => updateAction(index, 'description', e.target.value)}
                    placeholder="What does this action do?"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg space-y-1">
            <p>• Voting starts after 1 day delay</p>
            <p>• Voting period lasts 1 week</p>
            <p>• Requires 4% quorum to pass</p>
            <p>• Successful proposals are queued for 2 days before execution</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !hasEnoughVotingPower || !title || !description}
            className="flex-1"
          >
            {isCreating ? 'Creating...' : 'Create Proposal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
