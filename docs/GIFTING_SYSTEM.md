# NFT Gifting System Documentation

## Overview

The NFT Gifting System allows users to wrap their NFTs as gifts with personal messages and send them to other users. Recipients can unwrap gifts with an animated reveal experience, earning XP rewards in the process.

## Smart Contract

### KoboGiftWrapper Contract

**Deployed Address:** `0xF109D0938462ef95FF1274e8f4E981c3C10393D6` (devnet)

**Key Features:**
- Wrap NFTs with encrypted messages
- Batch gift wrapping support
- Gift cancellation before unwrapping
- Emergency recovery mechanisms
- Event tracking for all gift operations

**Main Functions:**

```solidity
// Wrap a single NFT as a gift
function wrapGift(
    address nftContract,
    uint256 tokenId,
    address recipient,
    string memory message
) external returns (uint256 giftId)

// Unwrap a gift (recipient only)
function unwrapGift(uint256 giftId) external

// Cancel a gift before unwrapping (sender only)
function cancelGift(uint256 giftId) external

// Batch wrap multiple NFTs
function batchWrapGifts(
    address nftContract,
    uint256[] memory tokenIds,
    address[] memory recipients,
    string[] memory messages
) external returns (uint256[] memory giftIds)

// Query functions
function getGift(uint256 giftId) external view returns (Gift memory)
function getGiftsBySender(address sender) external view returns (uint256[] memory)
function getGiftsByRecipient(address recipient) external view returns (uint256[] memory)
```

**Events:**
- `GiftWrapped(uint256 indexed giftId, address indexed sender, address indexed recipient, address nftContract, uint256 tokenId)`
- `GiftUnwrapped(uint256 indexed giftId, address indexed recipient)`
- `GiftCancelled(uint256 indexed giftId, address indexed sender)`

## Database Schema

### gift_wraps Table

Tracks all gift wrapping transactions and their status.

```sql
CREATE TABLE gift_wraps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id BIGINT NOT NULL,
  chain TEXT NOT NULL,
  token_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_user_id UUID REFERENCES auth.users(id),
  recipient_address TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  message_encrypted TEXT,
  message_ipfs_hash TEXT,
  wrapped_at TIMESTAMPTZ DEFAULT NOW(),
  unwrapped_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'unwrapped', 'cancelled')),
  wrap_tx_hash TEXT NOT NULL,
  unwrap_tx_hash TEXT,
  cancel_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### gift_messages Table

Stores gift messages separately for better organization.

```sql
CREATE TABLE gift_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_wrap_id UUID REFERENCES gift_wraps(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### gift_unwrap_events Table

Tracks unwrapping events for analytics and gamification.

```sql
CREATE TABLE gift_unwrap_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_wrap_id UUID REFERENCES gift_wraps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  unwrapped_at TIMESTAMPTZ DEFAULT NOW(),
  animation_type TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Frontend Components

### GiftWrapModal

Modal component for wrapping NFTs as gifts.

**Location:** `src/components/gifting/GiftWrapModal.tsx`

**Features:**
- Recipient address validation
- Personal message composer (500 character limit)
- Transaction status tracking
- XP reward preview
- Error handling

**Usage:**
```tsx
<GiftWrapModal
  isOpen={true}
  onClose={() => setShowModal(false)}
  tokenId={123}
  tokenUri="https://..."
  onSuccess={() => console.log('Gift wrapped!')}
/>
```

### UnwrapAnimation

Animated unwrapping experience with confetti effects.

**Location:** `src/components/gifting/UnwrapAnimation.tsx`

**Features:**
- Three-stage animation (wrapped → unwrapping → revealed)
- Confetti celebration using canvas-confetti
- Message reveal with fade-in animation
- NFT preview display
- XP reward notification

**Usage:**
```tsx
<UnwrapAnimation
  isOpen={true}
  onComplete={() => console.log('Unwrapped!')}
  tokenId={123}
  tokenUri="https://..."
  message="Happy Birthday!"
  senderAddress="0x..."
/>
```

### GiftingDashboard

Complete dashboard for managing sent and received gifts.

**Location:** `src/components/gifting/GiftingDashboard.tsx`

**Features:**
- Tabbed interface (Received/Sent)
- Gift status tracking
- Unwrap functionality with animation
- Cancel gift functionality
- Transaction links to block explorer
- Real-time updates

**Usage:**
```tsx
<GiftingDashboard />
```

## Gift Service

**Location:** `src/lib/giftService.ts`

### Key Functions

```typescript
// Create a gift wrap record
createGiftWrap(params: {
  giftId: number;
  tokenId: number;
  contractAddress: string;
  senderAddress: string;
  recipientAddress: string;
  message?: string;
  wrapTxHash: string;
}): Promise<GiftWrap>

// Get pending gifts for recipient
getPendingGifts(recipientAddress: string): Promise<GiftWrap[]>

// Get all gifts for a user
getUserGifts(userAddress: string): Promise<{
  sent: GiftWrap[];
  received: GiftWrap[];
}>

// Mark gift as unwrapped
markGiftUnwrapped(params: {
  giftWrapId: string;
  unwrapTxHash: string;
  animationType?: string;
}): Promise<GiftWrap>

// Mark gift as cancelled
markGiftCancelled(params: {
  giftWrapId: string;
  cancelTxHash: string;
}): Promise<GiftWrap>
```

### Message Encryption

Basic encryption/decryption utilities are provided:

```typescript
// Encrypt message (demo - use proper encryption in production)
encryptMessage(message: string, key: string): string

// Decrypt message (demo - use proper encryption in production)
decryptMessage(encryptedMessage: string, key: string): string
```

**⚠️ Production Note:** The current implementation uses base64 encoding for demonstration. For production, implement proper encryption using:
- Web Crypto API
- crypto-js library
- Or server-side encryption with Supabase Edge Functions

## Gamification Integration

### XP Rewards

The gifting system is integrated with the gamification layer:

- **Send Gift:** 50 XP
- **Unwrap Gift:** 100 XP

**Activity Types:**
- `gift_sent` - Awarded when wrapping a gift
- `gift_unwrapped` - Awarded when unwrapping a gift

### Implementation

```typescript
import { awardXP } from '@/lib/gamificationService';

// Award XP for sending gift
await awardXP(senderAddress, 50, 'gift_sent', `Sent gift #${tokenId}`);

// Award XP for unwrapping gift
await awardXP(recipientAddress, 100, 'gift_unwrapped', `Unwrapped gift #${tokenId}`);
```

## User Flow

### Sending a Gift

1. User navigates to Gallery
2. Clicks on an NFT they own
3. Clicks "Gift" button in NFT detail modal
4. Enters recipient address
5. Writes optional personal message
6. Confirms transaction
7. NFT is transferred to gift wrapper contract
8. Gift record created in database
9. Sender earns 50 XP

### Receiving a Gift

1. User navigates to Gifts page (`/gifts`)
2. Views pending gifts in "Received" tab
3. Clicks "Unwrap Gift" button
4. Animated unwrapping sequence plays
5. Confetti celebration
6. Personal message revealed (if any)
7. NFT preview displayed
8. Transaction confirmed on-chain
9. NFT transferred to recipient
10. Recipient earns 100 XP

### Cancelling a Gift

1. User navigates to Gifts page
2. Switches to "Sent" tab
3. Finds pending gift
4. Clicks "Cancel Gift" button
5. Confirms transaction
6. NFT returned to sender
7. Gift marked as cancelled

## Navigation

The gifting system is accessible through:

1. **Gallery Page:** Gift button in NFT detail modal
2. **Gifts Page:** Dedicated page at `/gifts` route
3. **Main Navigation:** "Gifts" link in navigation bar

## Security Considerations

### Smart Contract Security

- ✅ Reentrancy protection
- ✅ Access control (only sender can cancel, only recipient can unwrap)
- ✅ Emergency recovery for stuck NFTs
- ✅ Event emission for all state changes
- ✅ Comprehensive test coverage

### Frontend Security

- ✅ Address validation
- ✅ Transaction confirmation before state updates
- ✅ Error handling and user feedback
- ✅ Wallet connection verification

### Database Security

- ✅ Row Level Security (RLS) policies
- ✅ Foreign key constraints
- ✅ Timestamp tracking
- ✅ Status validation

## Testing

### Smart Contract Tests

Located in `contracts/test/KoboGiftWrapper.t.sol`

Run tests:
```bash
cd contracts
forge test
```

### Frontend Testing

Test the gifting flow:

1. **Wrap Gift:**
   - Connect wallet
   - Navigate to Gallery
   - Select an NFT you own
   - Click Gift button
   - Enter valid recipient address
   - Add message
   - Confirm transaction

2. **Unwrap Gift:**
   - Switch to recipient wallet
   - Navigate to Gifts page
   - Click Unwrap on pending gift
   - Watch animation
   - Verify NFT received

3. **Cancel Gift:**
   - Switch back to sender wallet
   - Navigate to Gifts → Sent tab
   - Click Cancel on pending gift
   - Verify NFT returned

## Future Enhancements

### Planned Features

1. **Scheduled Gifts:** Set future delivery dates
2. **Gift Themes:** Custom wrapping paper designs
3. **Gift Notifications:** Email/push notifications for recipients
4. **Gift History:** Complete transaction history
5. **Batch Unwrapping:** Unwrap multiple gifts at once
6. **Gift Previews:** Peek at gift without unwrapping
7. **Gift Reactions:** Recipients can react to gifts
8. **Gift Leaderboards:** Top gift senders/receivers

### Technical Improvements

1. **IPFS Message Storage:** Store messages on IPFS
2. **Proper Encryption:** Implement end-to-end encryption
3. **Gas Optimization:** Reduce transaction costs
4. **Cross-chain Gifting:** Support multiple chains
5. **Gift Marketplace:** Trade wrapped gifts
6. **Gift Insurance:** Protect high-value gifts

## Troubleshooting

### Common Issues

**Gift won't wrap:**
- Ensure NFT is approved for gift wrapper contract
- Verify recipient address is valid
- Check wallet has sufficient gas

**Gift won't unwrap:**
- Ensure connected wallet is the recipient
- Verify gift is still pending (not cancelled)
- Check transaction hasn't already been processed

**Animation not playing:**
- Clear browser cache
- Check browser console for errors
- Verify canvas-confetti is loaded

**XP not awarded:**
- Check wallet connection
- Verify user is authenticated
- Check database connection

## Support

For issues or questions:
- Check contract events on block explorer
- Review browser console for errors
- Verify database records in Supabase
- Check transaction status on-chain

## License

MIT License - See LICENSE file for details
