import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/useAuth";

const getRataRata = (nilaiHarian, uas, bobotHarian, bobotUas) => {
  const harianValid = nilaiHarian.filter((n) => n !== null && n !== undefined && n !== "");
  if (harianValid.length === 0 && !uas) return "0.00";
  
  const avgHarian = harianValid.length > 0 
    ? harianValid.reduce((a, b) => a + Number(b), 0) / harianValid.length 
    : 0;
  
  const nilaiAkhir = ((avgHarian * bobotHarian) + ((uas || 0) * bobotUas)) / 100;
  return nilaiAkhir.toFixed(2);
};

const NilaiMapel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const mapel = location.state?.mapel || "Matematika";
  const kelasId = location.state?.kelasId;
  const namaKelas = location.state?.namaKelas;

  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jumlahKolomHarian, setJumlahKolomHarian] = useState(3);
  const [bobotNilai, setBobotNilai] = useState({ bobotHarian: 40, bobotUas: 60 });
  const [showAddSiswaModal, setShowAddSiswaModal] = useState(false);
  const [newSiswa, setNewSiswa] = useState({ nisn: "", nama: "", noAbsen: "" });

  // Fetch siswa dan nilai
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch siswa
        const siswaResponse = await axios.get("http://localhost:5000/api/siswa", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch bobot nilai
        const bobotResponse = await axios.get(`http://localhost:5000/api/bobot-nilai/${kelasId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { bobotHarian: 40, bobotUas: 60 } }));

        setBobotNilai({
          bobotHarian: bobotResponse.data.bobotHarian || 40,
          bobotUas: bobotResponse.data.bobotUas || 60
        });

        // Fetch nilai untuk mata pelajaran ini
        const nilaiResponse = await axios.get(`http://localhost:5000/api/nilai?kelasId=${kelasId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Map siswa dengan nilai mereka
        const siswaWithNilai = siswaResponse.data.map(siswa => {
          const nilaiSiswa = nilaiResponse.data.find(
            n => n.siswaId === siswa.id && n.mataPelajaran === mapel
          );

          let harianArray = [];
          if (nilaiSiswa && nilaiSiswa.nilaiHarian) {
            harianArray = [...nilaiSiswa.nilaiHarian];
            if (harianArray.length > jumlahKolomHarian) {
              setJumlahKolomHarian(harianArray.length);
            }
          }

          // Pad array to match jumlahKolomHarian
          while (harianArray.length < jumlahKolomHarian) {
            harianArray.push(null);
          }

          return {
            id: siswa.id,
            absen: siswa.noAbsen,
            nisn: siswa.nisn,
            nama: siswa.nama,
            harian: harianArray,
            uas: nilaiSiswa?.uas || null,
            nilaiId: nilaiSiswa?.id || null
          };
        });

        // Sort by absen
        siswaWithNilai.sort((a, b) => a.absen - b.absen);
        setSiswaList(siswaWithNilai);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Gagal memuat data siswa dan nilai");
      } finally {
        setLoading(false);
      }
    };

    if (token && kelasId) {
      fetchData();
    }
  }, [token, kelasId, mapel, jumlahKolomHarian]);

  // Fungsi untuk menambah kolom harian
  const tambahKolom = () => {
    const kolomBaru = jumlahKolomHarian + 1;
    setJumlahKolomHarian(kolomBaru);
    setSiswaList((prev) =>
      prev.map((siswa) => ({
        ...siswa,
        harian: [...siswa.harian, null],
      }))
    );
  };

  // Fungsi untuk mengurangi kolom harian
  const kurangiKolom = () => {
    if (jumlahKolomHarian > 1) {
      const kolomBaru = jumlahKolomHarian - 1;
      setJumlahKolomHarian(kolomBaru);
      setSiswaList((prev) =>
        prev.map((siswa) => ({
          ...siswa,
          harian: siswa.harian.slice(0, kolomBaru),
        }))
      );
    }
  };

  // Fungsi untuk update nilai
  const updateNilai = (siswaIndex, type, kolomIndex = null, nilai) => {
    setSiswaList((prev) => {
      const newList = [...prev];
      if (type === "harian") {
        newList[siswaIndex].harian[kolomIndex] = nilai ? parseFloat(nilai) : null;
      } else if (type === "uas") {
        newList[siswaIndex].uas = nilai ? parseFloat(nilai) : null;
      }
      return newList;
    });
  };

  // Fungsi untuk menyimpan semua nilai
  const simpanNilai = async () => {
    try {
      setSaving(true);

      for (const siswa of siswaList) {
        const harianValid = siswa.harian.filter(n => n !== null && n !== "");
        
        const nilaiData = {
          siswaId: siswa.id,
          kelasId: kelasId,
          mataPelajaran: mapel,
          nilaiHarian: harianValid.map(n => parseFloat(n)),
          uas: siswa.uas ? parseFloat(siswa.uas) : 0,
          bobotHarian: bobotNilai.bobotHarian,
          bobotUas: bobotNilai.bobotUas
        };

        if (siswa.nilaiId) {
          // Update existing
          await axios.put(
            `http://localhost:5000/api/nilai/${siswa.nilaiId}`,
            nilaiData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Create new
          await axios.post(
            "http://localhost:5000/api/nilai",
            nilaiData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      alert("Data nilai berhasil disimpan!");
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error("Error saving nilai:", error);
      alert("Gagal menyimpan nilai: " + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk menambah siswa baru
  const handleAddSiswa = async () => {
    try {
      if (!newSiswa.nisn || !newSiswa.nama || !newSiswa.noAbsen) {
        alert("Semua field harus diisi!");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/siswa",
        {
          nisn: newSiswa.nisn,
          nama: newSiswa.nama,
          noAbsen: parseInt(newSiswa.noAbsen)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Tambahkan siswa baru ke list dengan array harian kosong
      const siswaWithNilai = {
        id: response.data.id,
        absen: response.data.noAbsen,
        nisn: response.data.nisn,
        nama: response.data.nama,
        harian: Array(jumlahKolomHarian).fill(null),
        uas: null,
        nilaiId: null
      };

      setSiswaList(prev => [...prev, siswaWithNilai].sort((a, b) => a.absen - b.absen));
      setShowAddSiswaModal(false);
      setNewSiswa({ nisn: "", nama: "", noAbsen: "" });
      alert("Siswa berhasil ditambahkan! Siswa akan tersedia di semua mata pelajaran kelas ini.");
    } catch (error) {
      console.error("Error adding siswa:", error);
      alert("Gagal menambahkan siswa: " + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-green-50">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard/daftar-mapel")}
          className="mr-4 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          ← Kembali
        </button>
        <div>
          <h2 className="text-2xl font-semibold">{mapel}</h2>
          <p className="text-sm text-gray-600">{namaKelas}</p>
        </div>
      </div>
      
      {/* Kontrol Kolom */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">
              Pengaturan Kolom Nilai Harian
            </h3>
            <p className="text-sm text-gray-600">
              Jumlah kolom: {jumlahKolomHarian} | Bobot: Harian {bobotNilai.bobotHarian}% - UAS {bobotNilai.bobotUas}%
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={kurangiKolom}
              disabled={jumlahKolomHarian <= 1}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              - Kurangi
            </button>
            <button
              onClick={tambahKolom}
              disabled={jumlahKolomHarian >= 8}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              + Tambah
            </button>
          </div>
        </div>
      </div>

      {/* Tombol Tambah Siswa */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAddSiswaModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Siswa
        </button>
      </div>

      {siswaList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Tidak ada siswa di kelas ini</p>
          <button
            onClick={() => setShowAddSiswaModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tambah Siswa Pertama
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-green-100">
                  <th className="px-4 py-2 border">No Absen</th>
                  <th className="px-4 py-2 border">NISN</th>
                  <th className="px-4 py-2 border">Nama</th>
                  <th className="px-4 py-2 border" colSpan={jumlahKolomHarian}>
                    Nilai Harian
                  </th>
                  <th className="px-4 py-2 border">UAS</th>
                  <th className="px-4 py-2 border">Nilai Akhir</th>
                </tr>
                <tr className="bg-green-50">
                  <th className="border"></th>
                  <th className="border"></th>
                  <th className="border"></th>
                  {Array.from({ length: jumlahKolomHarian }, (_, i) => (
                    <th key={i} className="px-4 py-2 border text-sm">
                      {i + 1}
                    </th>
                  ))}
                  <th className="border"></th>
                  <th className="border"></th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((siswa, siswaIndex) => (
                  <tr key={siswa.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-center border">{siswa.absen}</td>
                    <td className="px-4 py-2 text-center border">{siswa.nisn}</td>
                    <td className="px-4 py-2 border">{siswa.nama}</td>
                    {Array.from({ length: jumlahKolomHarian }, (_, kolomIndex) => (
                      <td key={kolomIndex} className="px-2 py-2 text-center border">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={siswa.harian[kolomIndex] ?? ""}
                          onChange={(e) =>
                            updateNilai(
                              siswaIndex,
                              "harian",
                              kolomIndex,
                              e.target.value
                            )
                          }
                          className="w-16 px-2 py-1 border rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="-"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center border">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={siswa.uas ?? ""}
                        onChange={(e) =>
                          updateNilai(siswaIndex, "uas", null, e.target.value)
                        }
                        className="w-16 px-2 py-1 border rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="-"
                      />
                    </td>
                    <td className="px-4 py-2 text-center border font-medium">
                      {getRataRata(siswa.harian, siswa.uas, bobotNilai.bobotHarian, bobotNilai.bobotUas)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={simpanNilai}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </>
      )}

      {/* Informasi */}
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-2">Informasi</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Masukkan nilai 0-100 (desimal diperbolehkan)</li>
          <li>• Kolom kosong tidak akan dihitung dalam rata-rata</li>
          <li>• Maksimal 8 kolom nilai harian</li>
          <li>• Nilai akhir dihitung berdasarkan bobot yang ditentukan</li>
          <li>• Klik "Simpan Data" untuk menyimpan semua perubahan</li>
          <li>• Siswa yang ditambahkan akan otomatis tersedia di semua mata pelajaran kelas ini</li>
        </ul>
      </div>

      {/* Modal Tambah Siswa */}
      {showAddSiswaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Tambah Siswa Baru</h3>
              <button
                onClick={() => {
                  setShowAddSiswaModal(false);
                  setNewSiswa({ nisn: "", nama: "", noAbsen: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSiswa.nisn}
                  onChange={(e) => setNewSiswa({ ...newSiswa, nisn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan NISN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSiswa.nama}
                  onChange={(e) => setNewSiswa({ ...newSiswa, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Absen <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={newSiswa.noAbsen}
                  onChange={(e) => setNewSiswa({ ...newSiswa, noAbsen: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan no. absen"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> Siswa yang ditambahkan akan otomatis tersedia di semua mata pelajaran untuk {namaKelas}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddSiswaModal(false);
                  setNewSiswa({ nisn: "", nama: "", noAbsen: "" });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddSiswa}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tambah Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NilaiMapel;
