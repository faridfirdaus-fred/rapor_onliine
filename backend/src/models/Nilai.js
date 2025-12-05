import prisma from '../config/database.js';

export class Nilai {
  static calculateNilaiAkhir(nilaiHarian, uas, bobotHarian, bobotUas) {
    if (!nilaiHarian || nilaiHarian.length === 0) {
      return (uas * bobotUas) / 100;
    }
    
    const avgHarian = nilaiHarian.reduce((sum, n) => sum + n, 0) / nilaiHarian.length;
    return ((avgHarian * bobotHarian) + (uas * bobotUas)) / 100;
  }

  static async create(data) {
    const nilaiAkhir = this.calculateNilaiAkhir(
      data.nilaiHarian || [],
      data.uas || 0,
      data.bobotHarian || 40,
      data.bobotUas || 60
    );

    return await prisma.nilai.create({
      data: {
        siswaId: data.siswaId,
        kelasId: data.kelasId,
        mataPelajaran: data.mataPelajaran,
        nilaiHarian: data.nilaiHarian || [],
        uas: data.uas || 0,
        bobotHarian: data.bobotHarian || 40,
        bobotUas: data.bobotUas || 60,
        nilaiAkhir
      }
    });
  }

  static async findAll(siswaId = null) {
    const where = siswaId ? { siswaId } : {};
    return await prisma.nilai.findMany({
      where,
      include: {
        siswa: true,
        kelas: true
      }
    });
  }

  static async findById(id) {
    return await prisma.nilai.findUnique({
      where: { id },
      include: {
        siswa: true,
        kelas: true
      }
    });
  }

  static async findBySiswa(siswaId) {
    return await prisma.nilai.findMany({
      where: { siswaId }
    });
  }

  static async findByKelas(kelasId) {
    return await prisma.nilai.findMany({
      where: { kelasId },
      include: {
        siswa: true
      }
    });
  }

  static async update(id, data) {
    const current = await this.findById(id);
    
    const nilaiHarian = data.nilaiHarian !== undefined ? data.nilaiHarian : current.nilaiHarian;
    const uas = data.uas !== undefined ? data.uas : current.uas;
    const bobotHarian = data.bobotHarian !== undefined ? data.bobotHarian : current.bobotHarian;
    const bobotUas = data.bobotUas !== undefined ? data.bobotUas : current.bobotUas;
    
    const nilaiAkhir = this.calculateNilaiAkhir(nilaiHarian, uas, bobotHarian, bobotUas);

    return await prisma.nilai.update({
      where: { id },
      data: {
        ...data,
        nilaiAkhir
      }
    });
  }

  static async delete(id) {
    try {
      await prisma.nilai.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getSiswaRanking(kelasId) {
    const nilaiList = await this.findByKelas(kelasId);
    
    // Group by siswaId and calculate average
    const siswaScores = {};
    
    for (const nilai of nilaiList) {
      if (!siswaScores[nilai.siswaId]) {
        siswaScores[nilai.siswaId] = {
          siswaId: nilai.siswaId,
          totalNilai: 0,
          count: 0
        };
      }
      siswaScores[nilai.siswaId].totalNilai += nilai.nilaiAkhir;
      siswaScores[nilai.siswaId].count += 1;
    }
    
    // Calculate average and sort
    const rankings = Object.values(siswaScores)
      .map(score => ({
        siswaId: score.siswaId,
        rataRata: score.totalNilai / score.count,
        jumlahMapel: score.count
      }))
      .sort((a, b) => b.rataRata - a.rataRata);
    
    // Add ranking position
    rankings.forEach((item, index) => {
      item.ranking = index + 1;
    });
    
    return rankings;
  }

  static async getJumlahDanRataRata(siswaId) {
    const nilaiList = await this.findBySiswa(siswaId);
    
    if (nilaiList.length === 0) {
      return {
        jumlah: 0,
        rataRata: 0,
        details: []
      };
    }

    let jumlah = 0;
    const details = nilaiList.map(n => {
      jumlah += n.nilaiAkhir;
      return {
        mataPelajaran: n.mataPelajaran,
        nilaiHarian: n.nilaiHarian,
        avgHarian: n.nilaiHarian.length > 0 ? n.nilaiHarian.reduce((sum, v) => sum + v, 0) / n.nilaiHarian.length : 0,
        uas: n.uas,
        bobotHarian: n.bobotHarian,
        bobotUas: n.bobotUas,
        nilaiAkhir: n.nilaiAkhir
      };
    });

    return {
      jumlah,
      rataRata: jumlah / nilaiList.length,
      details
    };
  }

  static async countByMataPelajaran(kelasId, mataPelajaran) {
    return await prisma.nilai.count({
      where: {
        kelasId,
        mataPelajaran
      }
    });
  }
}
