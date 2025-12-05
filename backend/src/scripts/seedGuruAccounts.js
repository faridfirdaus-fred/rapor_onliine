import "dotenv/config";
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seedGuruAccounts() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB\n');

    // Create 5 kelas
    const kelasData = [
      { nama: 'Kelas 1' },
      { nama: 'Kelas 2' },
      { nama: 'Kelas 3' },
      { nama: 'Kelas 4' },
      { nama: 'Kelas 5' }
    ];

    console.log('📚 Creating kelas...');
    const kelasList = [];
    for (const kelas of kelasData) {
      const created = await prisma.kelas.create({ data: kelas });
      kelasList.push(created);
      console.log(`  ✅ Created: ${created.nama}`);
    }

    console.log('\n👨‍🏫 Creating guru accounts...');
    
    // Create guru accounts for each kelas
    for (let i = 0; i < kelasList.length; i++) {
      const kelas = kelasList[i];
      const username = `kelas${i + 1}`;
      const password = await bcrypt.hash(username, 10); // Password sama dengan username
      
      const guru = await prisma.user.create({
        data: {
          username: username,
          password: password,
          name: `Guru ${kelas.nama}`,
          kelasId: kelas.id
        }
      });
      
      console.log(`  ✅ ${guru.name}: ${guru.username} (password: ${username})`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Guru Kelas 1: kelas1 / kelas1');
    console.log('   Guru Kelas 2: kelas2 / kelas2');
    console.log('   Guru Kelas 3: kelas3 / kelas3');
    console.log('   Guru Kelas 4: kelas4 / kelas4');
    console.log('   Guru Kelas 5: kelas5 / kelas5');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGuruAccounts();
