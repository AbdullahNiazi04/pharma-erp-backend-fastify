import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log("Starting seed script...");

async function main() {
  const categories = [
    // Raw Material
    { type: 'pr_category', label: 'API', value: 'api' },
    { type: 'pr_category', label: 'Excipient', value: 'excipient' },
    { type: 'pr_category', label: 'Testing Material', value: 'testing_material' },
    // Packing Material
    { type: 'pr_category', label: 'Bottle', value: 'bottle' },
    { type: 'pr_category', label: 'Unit Carton', value: 'unit_carton' },
    { type: 'pr_category', label: 'Plastic Tube', value: 'plastic_tube' },
    { type: 'pr_category', label: 'Aluminium Tube', value: 'aluminium_tube' },
    { type: 'pr_category', label: 'Aluminium Foil', value: 'aluminium_foil' },
    { type: 'pr_category', label: 'Labels', value: 'labels' },
    { type: 'pr_category', label: 'Batch Number Printed', value: 'batch_number_printed' },
    { type: 'pr_category', label: 'Batch Number Not Printed', value: 'batch_number_not_printed' },
  ];

  console.log('Seeding procurement categories...');

  for (const cat of categories) {
    const existing = await prisma.procurement_options.findFirst({
      where: { type: cat.type, value: cat.value },
    });

    if (!existing) {
      await prisma.procurement_options.create({
        data: {
          ...cat,
          is_system: true,
        },
      });
      console.log(`Created: ${cat.label}`);
    } else {
      console.log(`Skipped (exists): ${cat.label}`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
