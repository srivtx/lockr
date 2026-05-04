import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Trustlock } from "../target/types/trustlock";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { assert } from "chai";

describe("trustlock", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Trustlock as Program<Trustlock>;

  const wallet = provider.wallet;
  const freelancer = wallet;
  const authority = wallet;

  let mockUsdcMint: PublicKey;
  let freelancerAta: PublicKey;
  let payerAta: PublicKey;

  const findEscrowPda = (
    escrowId: string,
    freelancerPubkey: PublicKey,
    seed: anchor.BN
  ) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        Buffer.from(escrowId),
        freelancerPubkey.toBuffer(),
        seed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  };

  before(async () => {
    // Create a mock USDC mint for local testing
    mockUsdcMint = await createMint(
      provider.connection,
      // @ts-ignore
      authority.payer,
      authority.publicKey,
      null,
      6
    );

    freelancerAta = await createAccount(
      provider.connection,
      // @ts-ignore
      authority.payer,
      mockUsdcMint,
      freelancer.publicKey
    );

    payerAta = await createAccount(
      provider.connection,
      // @ts-ignore
      authority.payer,
      mockUsdcMint,
      authority.publicKey
    );

    // Mint 1,000 USDC to the payer (backend treasury)
    await mintTo(
      provider.connection,
      // @ts-ignore
      authority.payer,
      mockUsdcMint,
      payerAta,
      // @ts-ignore
      authority.payer,
      1_000_000_000
    );
  });

  it("Test 1: Create escrow with 2 milestones", async () => {
    const escrowId = "escrow-001";
    const seed = new anchor.BN(1);
    const [escrowPda] = findEscrowPda(escrowId, freelancer.publicKey, seed);

    const milestones = [
      {
        description: "Upfront payment",
        amount: new anchor.BN(300_000_000),
        status: { pending: {} },
      },
      {
        description: "Final delivery",
        amount: new anchor.BN(700_000_000),
        status: { pending: {} },
      },
    ];

    await program.methods
      .createEscrow(
        escrowId,
        "client@example.com",
        new anchor.BN(1_000_000_000),
        new anchor.BN(Date.now() / 1000 + 86400),
        milestones,
        seed
      )
      .accounts({
        escrow: escrowPda,
        freelancer: freelancer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const escrowAccount = await program.account.escrow.fetch(escrowPda);
    assert.equal(escrowAccount.escrowId, escrowId);
    assert.equal(escrowAccount.totalAmount.toNumber(), 1_000_000_000);
    assert.equal(escrowAccount.milestones.length, 2);
    assert.deepEqual(escrowAccount.status, { pending: {} });
  });

  it("Test 2: Fund first milestone", async () => {
    const escrowId = "escrow-001";
    const seed = new anchor.BN(1);
    const [escrowPda] = findEscrowPda(escrowId, freelancer.publicKey, seed);

    const escrowAta = getAssociatedTokenAddressSync(mockUsdcMint, escrowPda, true);

    await program.methods
      .fundEscrow(escrowId, 0, seed)
      .accounts({
        escrow: escrowPda,
        freelancer: freelancer.publicKey,
        escrowTokenAccount: escrowAta,
        payerTokenAccount: payerAta,
        payer: authority.publicKey,
        usdcMint: mockUsdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const escrowAccount = await program.account.escrow.fetch(escrowPda);
    assert.deepEqual(escrowAccount.milestones[0].status, { funded: {} });
    assert.deepEqual(escrowAccount.status, { funded: {} });

    const escrowToken = await getAccount(provider.connection, escrowAta);
    assert.equal(Number(escrowToken.amount), 300_000_000);
  });

  it("Test 3: Release milestone (with mock signature)", async () => {
    const escrowId = "escrow-001";
    const seed = new anchor.BN(1);
    const [escrowPda] = findEscrowPda(escrowId, freelancer.publicKey, seed);
    const escrowAta = getAssociatedTokenAddressSync(mockUsdcMint, escrowPda, true);

    const mockSignature = Buffer.alloc(64, 0);

    await program.methods
      .releaseMilestone(escrowId, 0, seed, Array.from(mockSignature) as any)
      .accounts({
        escrow: escrowPda,
        freelancer: freelancer.publicKey,
        escrowTokenAccount: escrowAta,
        freelancerTokenAccount: freelancerAta,
        authority: authority.publicKey,
        usdcMint: mockUsdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const escrowAccount = await program.account.escrow.fetch(escrowPda);
    assert.deepEqual(escrowAccount.milestones[0].status, { released: {} });

    const freelancerToken = await getAccount(provider.connection, freelancerAta);
    assert.equal(Number(freelancerToken.amount), 300_000_000);
  });

  it("Test 4: Refund after deadline", async () => {
    const escrowId = "escrow-002";
    const seed = new anchor.BN(2);
    const [escrowPda] = findEscrowPda(escrowId, freelancer.publicKey, seed);

    const milestones = [
      {
        description: "Single milestone",
        amount: new anchor.BN(500_000_000),
        status: { pending: {} },
      },
    ];

    await program.methods
      .createEscrow(
        escrowId,
        "client2@example.com",
        new anchor.BN(500_000_000),
        new anchor.BN(1), // deadline in the past
        milestones,
        seed
      )
      .accounts({
        escrow: escrowPda,
        freelancer: freelancer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const escrowAta = getAssociatedTokenAddressSync(mockUsdcMint, escrowPda, true);

    // Fund the escrow
    await program.methods
      .fundEscrow(escrowId, 0, seed)
      .accounts({
        escrow: escrowPda,
        freelancer: freelancer.publicKey,
        escrowTokenAccount: escrowAta,
        payerTokenAccount: payerAta,
        payer: authority.publicKey,
        usdcMint: mockUsdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    // Refund after deadline
    await program.methods
      .refund(escrowId, seed)
      .accounts({
        escrow: escrowPda,
        freelancer: freelancer.publicKey,
        escrowTokenAccount: escrowAta,
        payerTokenAccount: payerAta,
        payer: authority.publicKey,
        usdcMint: mockUsdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const escrowAccount = await program.account.escrow.fetch(escrowPda);
    assert.deepEqual(escrowAccount.status, { refunded: {} });
  });

  it("Test 5: Dispute escalation", async () => {
    const escrowId = "escrow-003";
    const seed = new anchor.BN(3);
    const [escrowPda] = findEscrowPda(escrowId, freelancer.publicKey, seed);

    const milestones = [
      {
        description: "Dispute test",
        amount: new anchor.BN(100_000_000),
        status: { pending: {} },
      },
    ];

    await program.methods
      .createEscrow(
        escrowId,
        "client3@example.com",
        new anchor.BN(100_000_000),
        new anchor.BN(Date.now() / 1000 + 86400),
        milestones,
        seed
      )
      .accounts({
        escrow: escrowPda,
        freelancer: freelancer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const mockSignature = Buffer.alloc(64, 1);

    await program.methods
      .dispute(escrowId, seed, Array.from(mockSignature) as any)
      .accounts({
        escrow: escrowPda,
        freelancer: freelancer.publicKey,
        signer: authority.publicKey,
      })
      .rpc();

    const escrowAccount = await program.account.escrow.fetch(escrowPda);
    assert.deepEqual(escrowAccount.status, { disputed: {} });
  });
});
