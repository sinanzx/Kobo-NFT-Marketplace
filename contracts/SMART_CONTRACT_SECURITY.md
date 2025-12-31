# Smart Contract Security Guide

## Pre-Mainnet Deployment Checklist

Before deploying any smart contract to mainnet, complete ALL items in this checklist.

### 1. Professional Security Audit

**MANDATORY**: All contracts must undergo professional security audit before mainnet deployment.

#### Recommended Audit Firms

- **OpenZeppelin** - https://openzeppelin.com/security-audits/
- **Trail of Bits** - https://www.trailofbits.com/
- **ConsenSys Diligence** - https://consensys.net/diligence/
- **Certora** - https://www.certora.com/
- **Quantstamp** - https://quantstamp.com/

#### Audit Requirements

- [ ] Contract code frozen (no changes during audit)
- [ ] Complete test suite with >95% coverage
- [ ] All dependencies up to date
- [ ] Documentation complete (NatSpec comments)
- [ ] Audit report received
- [ ] All CRITICAL findings resolved
- [ ] All HIGH findings resolved
- [ ] MEDIUM findings addressed or accepted risk documented
- [ ] Audit report published publicly

**Estimated Cost**: $10,000 - $50,000 depending on contract complexity  
**Timeline**: 2-4 weeks

### 2. Multi-Signature Wallet Setup

**MANDATORY**: Use multi-sig wallet for contract ownership and critical operations.

#### Recommended Solutions

- **Gnosis Safe** (recommended) - https://safe.global/
- **Multi-Sig Wallet by Gnosis** - https://github.com/gnosis/MultiSigWallet

#### Multi-Sig Configuration

```solidity
// Recommended configuration for production
Signers: 5 trusted individuals/entities
Threshold: 3 of 5 signatures required

Recommended signers:
1. Project Lead
2. Technical Lead
3. Security Advisor
4. Community Representative
5. Legal/Compliance Officer
```

#### Setup Steps

1. **Deploy Gnosis Safe**
   ```bash
   # Use Gnosis Safe UI or deploy via script
   # https://app.safe.global/
   ```

2. **Configure Signers**
   - Add 5 trusted wallet addresses
   - Set threshold to 3
   - Test with small transaction first

3. **Transfer Contract Ownership**
   ```solidity
   // Transfer ownership from deployer to multi-sig
   koboNFT.transferOwnership(MULTISIG_ADDRESS);
   koboGovernor.transferOwnership(MULTISIG_ADDRESS);
   koboTraitMarketplace.transferOwnership(MULTISIG_ADDRESS);
   ```

4. **Document Key Holders**
   - Maintain secure record of all signers
   - Document backup procedures
   - Establish communication protocol for signing

#### Multi-Sig Best Practices

- [ ] Signers geographically distributed
- [ ] Signers use hardware wallets (Ledger/Trezor)
- [ ] Regular key rotation schedule (annually)
- [ ] Backup signers identified
- [ ] Emergency procedures documented
- [ ] Test multi-sig with small transactions first

### 3. Timelock Controller

**RECOMMENDED**: Implement timelock for governance actions to allow community review.

#### Timelock Configuration

```solidity
// KoboTimelock.sol already implements this
Minimum Delay: 48 hours (2 days)
Maximum Delay: 7 days

// This allows community to:
// 1. Review proposed changes
// 2. Exit positions if they disagree
// 3. Prepare for upcoming changes
```

#### Timelock Setup

1. **Deploy Timelock**
   ```bash
   forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast
   ```

2. **Configure Roles**
   ```solidity
   // Proposer: Governor contract
   // Executor: Governor contract or multi-sig
   // Admin: Multi-sig wallet (can update roles)
   ```

3. **Test Timelock**
   - [ ] Queue a test proposal
   - [ ] Wait for delay period
   - [ ] Execute proposal
   - [ ] Verify changes applied

### 4. Testing Requirements

**MANDATORY**: Comprehensive testing before mainnet deployment.

#### Test Coverage Requirements

- [ ] Unit tests: >95% code coverage
- [ ] Integration tests: All contract interactions
- [ ] Fuzz testing: Critical functions
- [ ] Invariant testing: Core protocol invariants
- [ ] Gas optimization tests
- [ ] Edge case testing

#### Run Tests

```bash
# Run all tests
forge test -vvv

# Check coverage
forge coverage

# Run gas report
forge test --gas-report

# Fuzz testing (extended runs)
forge test --fuzz-runs 10000
```

#### Mainnet Fork Testing

```bash
# Test against mainnet fork
forge test --fork-url $MAINNET_RPC_URL

# Test specific scenarios
forge test --match-test testMintingFlow --fork-url $MAINNET_RPC_URL
```

### 5. Security Best Practices

#### Access Control

- [ ] All privileged functions have proper access control
- [ ] Role-based access control (RBAC) implemented
- [ ] Owner can be transferred to multi-sig
- [ ] Emergency pause functionality exists
- [ ] Pause can only be triggered by authorized addresses

#### Reentrancy Protection

- [ ] All external calls use Checks-Effects-Interactions pattern
- [ ] ReentrancyGuard applied to vulnerable functions
- [ ] No state changes after external calls

#### Integer Overflow/Underflow

- [ ] Using Solidity 0.8+ (built-in overflow checks)
- [ ] SafeMath used where necessary (for older versions)
- [ ] All arithmetic operations checked

#### Front-Running Protection

- [ ] Commit-reveal scheme for sensitive operations
- [ ] Slippage protection for price-sensitive functions
- [ ] Transaction ordering independence

#### Oracle Security

- [ ] Multiple oracle sources (if using oracles)
- [ ] Price manipulation resistance
- [ ] Stale data checks
- [ ] Circuit breakers for extreme values

### 6. Deployment Security

#### Pre-Deployment

- [ ] All environment variables secured
- [ ] Deployer private key stored in hardware wallet
- [ ] Deployment script tested on testnet
- [ ] Gas price strategy defined
- [ ] Sufficient ETH for deployment

#### Deployment Process

```bash
# 1. Final security check
forge build
forge test
slither .

# 2. Deploy to testnet first
forge script script/Deploy.s.sol --rpc-url $TESTNET_RPC_URL --broadcast --verify

# 3. Verify on testnet
# Test all functions manually
# Run integration tests

# 4. Deploy to mainnet (only after testnet validation)
forge script script/Deploy.s.sol --rpc-url $MAINNET_RPC_URL --broadcast --verify

# 5. Verify on Etherscan
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --chain-id 1
```

#### Post-Deployment

- [ ] Verify contract source code on Etherscan
- [ ] Transfer ownership to multi-sig
- [ ] Configure timelock
- [ ] Test all critical functions
- [ ] Monitor contract for 24-48 hours
- [ ] Announce deployment to community

### 7. Monitoring & Incident Response

#### Monitoring Setup

- [ ] Set up contract event monitoring (e.g., Tenderly, Defender)
- [ ] Configure alerts for critical events
- [ ] Monitor gas usage and transaction patterns
- [ ] Track contract balance and token supply

#### Incident Response Plan

1. **Detection**
   - Automated monitoring alerts
   - Community reports
   - Security researcher disclosure

2. **Assessment**
   - Severity classification (Critical/High/Medium/Low)
   - Impact analysis
   - Exploit potential

3. **Response**
   - **Critical**: Immediate pause if possible, emergency multi-sig action
   - **High**: Coordinate multi-sig response within 24 hours
   - **Medium**: Plan fix, schedule upgrade
   - **Low**: Include in next regular update

4. **Communication**
   - Notify community immediately
   - Provide regular updates
   - Post-mortem report after resolution

### 8. Upgrade Strategy

#### Proxy Pattern (if using upgradeable contracts)

- [ ] Use OpenZeppelin's TransparentUpgradeableProxy or UUPS
- [ ] Storage layout carefully managed
- [ ] Upgrade authority is multi-sig
- [ ] Timelock on upgrades
- [ ] Test upgrades on testnet first

#### Non-Upgradeable Contracts

- [ ] Migration plan documented
- [ ] User communication strategy
- [ ] Data migration scripts tested
- [ ] Backward compatibility considered

### 9. Bug Bounty Program

**RECOMMENDED**: Launch bug bounty program after mainnet deployment.

#### Platforms

- **Immunefi** - https://immunefi.com/ (recommended for DeFi/NFT)
- **HackerOne** - https://www.hackerone.com/
- **Code4rena** - https://code4rena.com/

#### Bounty Structure

See `SECURITY.md` for detailed bug bounty program.

### 10. Documentation

#### Required Documentation

- [ ] Contract architecture diagram
- [ ] Function documentation (NatSpec)
- [ ] Deployment guide
- [ ] User guide
- [ ] Security considerations
- [ ] Known limitations
- [ ] Audit reports (published)

#### Public Disclosure

- [ ] Contract source code verified on Etherscan
- [ ] Audit reports published
- [ ] Security policy published (SECURITY.md)
- [ ] Bug bounty program announced
- [ ] Multi-sig signers disclosed (optional but recommended)

## Contract-Specific Security Notes

### KoboNFT.sol

- **Minting**: Rate-limited, max supply enforced
- **Royalties**: EIP-2981 compliant, immutable after deployment
- **Metadata**: IPFS-based, immutable after minting
- **Access**: Owner can pause minting, update base URI

### KoboGovernor.sol

- **Voting**: Token-weighted, snapshot-based
- **Proposals**: Timelock enforced, quorum required
- **Execution**: Only after timelock delay
- **Emergency**: Can be paused by guardian

### KoboTraitMarketplace.sol

- **Payments**: Pull payment pattern (safer than push)
- **Pricing**: Seller-defined, no oracle dependency
- **Escrow**: Funds held in contract until completion
- **Fees**: Platform fee capped at 5%

### KoboGiftWrapper.sol

- **Wrapping**: NFT locked in contract
- **Unwrapping**: Only recipient can unwrap
- **Messages**: Encrypted, privacy-preserving
- **Expiry**: Optional expiry date

## Emergency Procedures

### Contract Pause

```solidity
// If emergency detected
multiSig.execute(
  koboNFT.address,
  0,
  abi.encodeWithSignature("pause()")
);
```

### Fund Recovery (if applicable)

```solidity
// Only for stuck funds, requires multi-sig
multiSig.execute(
  contract.address,
  0,
  abi.encodeWithSignature("emergencyWithdraw(address)", recipient)
);
```

### Communication Template

```
🚨 SECURITY ALERT 🚨

Issue: [Brief description]
Severity: [Critical/High/Medium/Low]
Status: [Investigating/Mitigating/Resolved]
Impact: [User impact description]
Action Required: [What users should do]

We are working to resolve this issue. Updates will be posted every [X] hours.

Contact: security@kobo-nft.com
```

## Mainnet Deployment Timeline

1. **Week 1-2**: Final testing and security review
2. **Week 3-4**: Professional audit
3. **Week 5**: Address audit findings
4. **Week 6**: Multi-sig setup and testing
5. **Week 7**: Testnet deployment and validation
6. **Week 8**: Mainnet deployment
7. **Week 9+**: Monitoring and bug bounty launch

## Estimated Costs

- **Security Audit**: $10,000 - $50,000
- **Bug Bounty Program**: $5,000 - $20,000 (initial pool)
- **Deployment Gas**: ~$500 - $2,000 (depending on gas prices)
- **Multi-Sig Setup**: Free (Gnosis Safe)
- **Monitoring Tools**: $100 - $500/month

**Total Initial Investment**: ~$15,000 - $75,000

## Resources

- [OpenZeppelin Security Best Practices](https://docs.openzeppelin.com/contracts/4.x/security)
- [Consensys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Ethereum Smart Contract Security](https://ethereum.org/en/developers/docs/smart-contracts/security/)
- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)

---

**REMEMBER**: Security is not a one-time task. Continuous monitoring, updates, and community engagement are essential for long-term security.

**DO NOT DEPLOY TO MAINNET** until ALL items in this checklist are completed and verified.
