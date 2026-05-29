const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const cols = await p.college.findMany({ select: { name: true, slug: true, type: true } });
  console.log('Total:', cols.length);
  cols.forEach(c => console.log(c.type, '|', c.slug, '|', c.name));
  await p.$disconnect();
})();