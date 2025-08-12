import { PrismaClient } from '@prisma/client';
import { PasswordUtil } from '../src/common/utils/password.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default categories
  const categories = [
    { name: 'electronics', description: 'Electronic devices and gadgets', icon: '📱', color: 'blue' },
    { name: 'jewelry', description: 'Jewelry and accessories', icon: '💍', color: 'purple' },
    { name: 'clothing', description: 'Clothing and apparel', icon: '👕', color: 'green' },
    { name: 'documents', description: 'Important documents and papers', icon: '📄', color: 'red' },
    { name: 'pets', description: 'Lost pets and animals', icon: '🐕', color: 'orange' },
    { name: 'vehicles', description: 'Cars, bikes, and other vehicles', icon: '🚗', color: 'gray' },
    { name: 'books', description: 'Books and educational materials', icon: '📚', color: 'brown' },
    { name: 'sports', description: 'Sports equipment and gear', icon: '⚽', color: 'yellow' },
    { name: 'other', description: 'Other miscellaneous items', icon: '📦', color: 'slate' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Create a test user
  const hashedPassword = await PasswordUtil.hash('Password123!');
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      bio: 'A test user for the lost item platform',
      city: 'New York',
      state: 'NY',
      country: 'USA',
    },
  });

  // Create some sample posts
  const samplePosts = [
    {
      title: 'Lost iPhone 13 Pro',
      description: 'Lost my iPhone 13 Pro at Central Park yesterday. It has a black case and a cracked screen. Please contact me if found!',
      status: 'LOST',
      category: 'electronics',
      address: 'Central Park',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      latitude: 40.7829,
      longitude: -73.9654,
      contactPhone: '+1234567890',
      contactEmail: 'test@example.com',
      preferredContact: 'EMAIL',
      reward: 100,
      tags: ['iphone', 'black case', 'cracked screen'],
      authorId: testUser.id,
    },
    {
      title: 'Found Golden Retriever',
      description: 'Found a friendly golden retriever near Times Square. Wearing a red collar with no tags. Please help me find the owner!',
      status: 'FOUND',
      category: 'pets',
      address: 'Times Square',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      latitude: 40.7580,
      longitude: -73.9855,
      contactPhone: '+1234567890',
      contactEmail: 'test@example.com',
      preferredContact: 'BOTH',
      tags: ['golden retriever', 'red collar', 'friendly'],
      authorId: testUser.id,
    },
  ];

  for (const postData of samplePosts) {
    const category = await prisma.category.findUnique({
      where: { name: postData.category },
    });

    if (category) {
      await prisma.post.create({
        data: {
          title: postData.title,
          description: postData.description,
          status: postData.status as any,
          address: postData.address,
          city: postData.city,
          state: postData.state,
          country: postData.country,
          latitude: postData.latitude,
          longitude: postData.longitude,
          contactPhone: postData.contactPhone,
          contactEmail: postData.contactEmail,
          preferredContact: postData.preferredContact as any,
          reward: postData.reward,
          tags: postData.tags,
          authorId: postData.authorId,
          categoryId: category.id,
        },
      });
    }
  }

  console.log('✅ Database seeding completed!');
  console.log('📧 Test user email: test@example.com');
  console.log('🔑 Test user password: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
