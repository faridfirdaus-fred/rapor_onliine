import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Initial dummy data siswa
const initialSiswaList = [
  { absen: 1, nisn: "1234567890", nama: "Budi", harian: [80, 85, 90], uas: 88 },
  { absen: 2, nisn: "1234567891", nama: "Ani", harian: [90, 88, 92], uas: 91 },
  { absen: 3, nisn: "1234567892", nama: "Siti", harian: [75, 80, 78], uas: 80 },
  { absen: 4, nisn: "1234567893", nama: "Joko", harian: [85, 82, 87], uas: 86 },
];

const getRataRata = (siswa, jumlahKolom) => {
  const harianValid = siswa.harian
    .slice(0, jumlahKolom)
    .filter((n) => n !== null && n !== undefined);
  const totalHarian = harianValid.reduce((a, b) => a + b, 0);
  const total = totalHarian + (siswa.uas || 0);
  const pembagi = harianValid.length + (siswa.uas ? 1 : 0);
  return pembagi > 0 ? (total / pembagi).toFixed(2) : "0.00";
};

const NilaiMapel = () => {
  // Ambil nama mapel dari state router
  const location = useLocation();
  const navigate = useNavigate();
  const mapel = location.state?.mapel || "Matematika";

  // State untuk mengelola jumlah kolom harian dan data siswa
  const [jumlahKolomHarian, setJumlahKolomHarian] = useState(3);
  const [siswaList, setSiswaList] = useState(() => {
    // Pastikan setiap siswa memiliki array harian dengan panjang sesuai jumlah kolom
    return initialSiswaList.map((siswa) => ({
      ...siswa,
      harian: [
        ...siswa.harian,
        ...Array(Math.max(0, jumlahKolomHarian - siswa.harian.length)).fill(
          null
        ),
      ],
    }));
  });

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
        newList[siswaIndex].harian[kolomIndex] = nilai ? parseInt(nilai) : null;
      } else if (type === "uas") {
        newList[siswaIndex].uas = nilai ? parseInt(nilai) : null;
      }
      return newList;
    });
  };

  return (
    <div className="p-8 min-h-screen bg-green-50">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard/daftar-mapel")}
          className="mr-4 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          ← Kembali
        </button>
        <h2 className="text-2xl font-semibold">Nilai Mapel: {mapel}</h2>
      </div>
      {/* Kontrol Kolom */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">
              Pengaturan Kolom Nilai Harian
            </h3>
            <p className="text-sm text-gray-600">
              Jumlah kolom: {jumlahKolomHarian}
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
              <th className="px-4 py-2 border">Rata-rata</th>
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
              <tr key={siswa.nisn} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-center border">{siswa.absen}</td>
                <td className="px-4 py-2 text-center border">{siswa.nisn}</td>
                <td className="px-4 py-2 border">{siswa.nama}</td>
                {Array.from({ length: jumlahKolomHarian }, (_, kolomIndex) => (
                  <td key={kolomIndex} className="px-2 py-2 text-center border">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={siswa.harian[kolomIndex] || ""}
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
                    value={siswa.uas || ""}
                    onChange={(e) =>
                      updateNilai(siswaIndex, "uas", null, e.target.value)
                    }
                    className="w-16 px-2 py-1 border rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="-"
                  />
                </td>
                <td className="px-4 py-2 text-center border font-medium">
                  {getRataRata(siswa, jumlahKolomHarian)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            // Reset ke data awal
            setSiswaList(
              initialSiswaList.map((siswa) => ({
                ...siswa,
                harian: [
                  ...siswa.harian,
                  ...Array(
                    Math.max(0, jumlahKolomHarian - siswa.harian.length)
                  ).fill(null),
                ],
              }))
            );
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => {
            // Simulasi menyimpan data
            console.log("Data disimpan:", {
              mapel,
              jumlahKolomHarian,
              siswaList,
            });
            alert("Data nilai berhasil disimpan!");
          }}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Simpan Data
        </button>
      </div>

      {/* Informasi */}
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-2">Informasi</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Klik input untuk mengubah nilai (0-100)</li>
          <li>• Kolom kosong akan diabaikan dalam perhitungan rata-rata</li>
          <li>• Maksimal 8 kolom nilai harian</li>
          <li>• Jangan lupa simpan setelah selesai menginput</li>
        </ul>
      </div>
    </div>
  );
};

export default NilaiMapel;
