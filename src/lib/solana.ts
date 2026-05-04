import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { AnchorProvider, Program, Wallet, Idl, BN } from '@coral-xyz/anchor';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Import the real TrustLock IDL
import trustlockIdl from './idl/trustlock.json';

const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL;
const NEXT_PUBLIC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

export const connection = new Connection(
  HELIUS_RPC_URL || NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Program ID from IDL metadata
export const TRUSTLOCK_PROGRAM_ID = new PublicKey(
  (trustlockIdl as any).metadata?.address || 'TrustLock1111111111111111111111111111111111'
);

// USDC Devnet mint
export const USDC_MINT_DEVNET = new PublicKey(
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
);

// Shared program instance (read-only, no signer needed for PDA derivation)
export const trustlockProgram = new Program(
  trustlockIdl as Idl,
  TRUSTLOCK_PROGRAM_ID,
  { connection } as any
);

// Backend signer — ONLY used in server-side functions
let _escrowKeypair: Keypair | null = null;
function getEscrowKeypair(): Keypair {
  if (_escrowKeypair) return _escrowKeypair;
  const raw = process.env.ESCROW_KEYPAIR;
  if (!raw) {
    throw new Error('ESCROW_KEYPAIR env var is required for backend signing');
  }
  const arr = JSON.parse(raw) as number[];
  if (arr.length !== 64) {
    throw new Error(`ESCROW_KEYPAIR must be 64 bytes, got ${arr.length}`);
  }
  _escrowKeypair = Keypair.fromSecretKey(new Uint8Array(arr));
  return _escrowKeypair;
}

function getBackendProvider(): AnchorProvider {
  const kp = getEscrowKeypair();
  const wallet = new Wallet(kp);
  return new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
}

function getBackendProgram(): Program {
  return new Program(trustlockIdl as Idl, TRUSTLOCK_PROGRAM_ID, getBackendProvider());
}

export function getExplorerUrl(
  signature: string,
  cluster: string = 'devnet'
): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

export function getEscrowPda(
  escrowId: string,
  freelancer: PublicKey,
  seed: BN
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('escrow'),
      Buffer.from(escrowId),
      freelancer.toBuffer(),
      seed.toArrayLike(Buffer, 'le', 8),
    ],
    TRUSTLOCK_PROGRAM_ID
  );
}

export async function getOrCreateTokenAccount(
  mint: PublicKey,
  owner: PublicKey,
  payer?: Keypair
): Promise<PublicKey> {
  const ata = getAssociatedTokenAddressSync(mint, owner, true);
  try {
    await connection.getAccountInfo(ata);
    return ata;
  } catch {
    // Account doesn't exist, create it
    const tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer ? payer.publicKey : owner,
        ata,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    if (payer) {
      await sendAndConfirmTransaction(connection, tx, [payer]);
    }
    return ata;
  }
}

export async function buildCreateEscrowTx(
  escrowId: string,
  clientEmail: string,
  totalAmount: BN,
  deadline: BN,
  milestones: { description: string; amount: BN }[],
  seed: BN,
  freelancer: PublicKey
): Promise<{ tx: Transaction; pda: PublicKey; bump: number }> {
  const program = getBackendProgram();
  const [pda, bump] = getEscrowPda(escrowId, freelancer, seed);

  const tx = await program.methods
    .createEscrow(
      escrowId,
      clientEmail,
      totalAmount,
      deadline,
      milestones.map((m) => ({
        description: m.description,
        amount: m.amount,
        status: { pending: {} },
      })),
      seed
    )
    .accounts({
      escrow: pda,
      freelancer: freelancer,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  return { tx, pda, bump };
}

export async function buildFundMilestoneTx(
  escrowId: string,
  milestoneIndex: number,
  seed: BN,
  escrowPda: PublicKey,
  freelancer: PublicKey
): Promise<Transaction> {
  const program = getBackendProgram();
  const kp = getEscrowKeypair();

  const escrowTokenAccount = getAssociatedTokenAddressSync(USDC_MINT_DEVNET, escrowPda, true);
  const payerTokenAccount = getAssociatedTokenAddressSync(USDC_MINT_DEVNET, kp.publicKey, true);

  const tx = await program.methods
    .fundEscrow(escrowId, milestoneIndex, seed)
    .accounts({
      escrow: escrowPda,
      freelancer: freelancer,
      escrowTokenAccount,
      payerTokenAccount,
      payer: kp.publicKey,
      usdcMint: USDC_MINT_DEVNET,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SystemProgram.programId,
    })
    .transaction();

  // Add memo for auditability
  const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  tx.add(
    new TransactionInstruction({
      keys: [],
      programId: memoProgram,
      data: Buffer.from(`fund:${escrowId}:${milestoneIndex}`),
    })
  );

  return tx;
}

export async function buildApproveReleaseTx(
  escrowId: string,
  milestoneIndex: number,
  seed: BN,
  escrowPda: PublicKey,
  freelancer: PublicKey,
  clientSignature: Uint8Array
): Promise<Transaction> {
  const program = getBackendProgram();
  const kp = getEscrowKeypair();

  const escrowTokenAccount = getAssociatedTokenAddressSync(USDC_MINT_DEVNET, escrowPda, true);
  const freelancerTokenAccount = getAssociatedTokenAddressSync(USDC_MINT_DEVNET, freelancer, true);

  const tx = await program.methods
    .releaseMilestone(
      escrowId,
      milestoneIndex,
      seed,
      Array.from(clientSignature) as any
    )
    .accounts({
      escrow: escrowPda,
      freelancer: freelancer,
      escrowTokenAccount,
      freelancerTokenAccount,
      authority: kp.publicKey,
      usdcMint: USDC_MINT_DEVNET,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .transaction();

  return tx;
}

export async function buildRefundTx(
  escrowId: string,
  seed: BN,
  escrowPda: PublicKey,
  freelancer: PublicKey
): Promise<Transaction> {
  const program = getBackendProgram();
  const kp = getEscrowKeypair();

  const escrowTokenAccount = getAssociatedTokenAddressSync(USDC_MINT_DEVNET, escrowPda, true);
  const payerTokenAccount = getAssociatedTokenAddressSync(USDC_MINT_DEVNET, kp.publicKey, true);

  const tx = await program.methods
    .refund(escrowId, seed)
    .accounts({
      escrow: escrowPda,
      freelancer: freelancer,
      escrowTokenAccount,
      payerTokenAccount,
      payer: kp.publicKey,
      usdcMint: USDC_MINT_DEVNET,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .transaction();

  return tx;
}

export async function signAndSendTransaction(tx: Transaction): Promise<string> {
  const kp = getEscrowKeypair();
  tx.feePayer = kp.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(kp);

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}
