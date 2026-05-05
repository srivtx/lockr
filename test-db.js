const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const escrows = await prisma.escrow.findMany();
  console.log('Total escrows:', escrows.length);
  if (escrows.length > 0) {
    console.log(escrows.map(e => ({ id: e.id, status: e.status, wallet: e.freelancerWallet })));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
