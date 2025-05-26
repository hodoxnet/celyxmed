import { PrismaClient } from '@/generated/prisma';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // SuccessStoriesSection ana kaydını kontrol et/oluştur
    const existingSection = await prisma.successStoriesSection.findUnique({
      where: { id: 'main' },
    });
    
    if (existingSection === null) {
      console.log('Creating SuccessStoriesSection main record...');
      await prisma.successStoriesSection.create({
        data: {
          id: 'main',
        },
      });
      console.log('SuccessStoriesSection main record created.');
    } else {
      console.log('SuccessStoriesSection main record already exists.');
    }
    
    // WhyTrustSection ana kaydını kontrol et/oluştur
    const existingTrustSection = await prisma.whyTrustSection.findUnique({
      where: { id: 'main' },
    });
    
    if (existingTrustSection === null) {
      console.log('Creating WhyTrustSection main record...');
      await prisma.whyTrustSection.create({
        data: {
          id: 'main',
        },
      });
      console.log('WhyTrustSection main record created.');
    } else {
      console.log('WhyTrustSection main record already exists.');
    }
    
    console.log('Initial data setup completed.');
  } catch (error) {
    console.error('Error creating initial data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });