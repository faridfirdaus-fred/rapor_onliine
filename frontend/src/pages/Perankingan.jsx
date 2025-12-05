import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/useAuth";

const Perankingan = () => {
  const { token, user } = useAuth();
  const [siswaList, setSiswaList] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "ranking",
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);
  const [namaKelas, setNamaKelas] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user?.kelasId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch ranking data
        const rankingResponse = await axios.get(
          `http://localhost:5000/api/nilai/ranking/${user.kelasId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch siswa data to get details (NISN, nama, noAbsen)
        const siswaResponse = await axios.get(
          `http://localhost:5000/api/siswa?kelasId=${user.kelasId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch kelas data to get kelas name
        const kelasResponse = await axios.get(
          `http://localhost:5000/api/kelas/${user.kelasId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setNamaKelas(kelasResponse.data.nama);

        // Merge ranking with siswa details
        const mergedData = rankingResponse.data.map((ranking) => {
          const siswa = siswaResponse.data.find(
            (s) => s.id === ranking.siswaId
          );
          return {
            siswaId: ranking.siswaId,
            ranking: ranking.ranking,
            rataRata: ranking.rataRata,
            jumlahMapel: ranking.jumlahMapel,
            nisn: siswa?.nisn || "-",
            nama: siswa?.nama || "Tidak ditemukan",
            noAbsen: siswa?.noAbsen || "-",
          };
        });

        setSiswaList(mergedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error.response?.data?.error || "Gagal memuat data perankingan"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  // Fungsi sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Data yang sudah diurutkan
  const sortedData = React.useMemo(() => {
    const sortableItems = [...siswaList];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle different data types
        if (sortConfig.key === "nama") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [siswaList, sortConfig]);

  // Icon untuk sorting
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400 ml-1">↕</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="text-green-600 ml-1">↑</span>
    ) : (
      <span className="text-green-600 ml-1">↓</span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data perankingan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (siswaList.length === 0) {
    return (
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Belum ada data nilai untuk kelas ini. Silakan input nilai terlebih dahulu.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8 min-h-screen bg-green-50">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Perankingan Siswa - {namaKelas}
        </h2>
        <p className="text-gray-600">
          Data perankingan berdasarkan rata-rata nilai semua mata pelajaran
        </p>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Siswa</h3>
          <p className="text-2xl font-semibold text-green-600">
            {siswaList.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">
            Rata-rata Tertinggi
          </h3>
          <p className="text-2xl font-semibold text-green-600">
            {siswaList.length > 0
              ? Math.max(...siswaList.map((s) => s.rataRata)).toFixed(2)
              : "-"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">
            Rata-rata Terendah
          </h3>
          <p className="text-2xl font-semibold text-red-600">
            {siswaList.length > 0
              ? Math.min(...siswaList.map((s) => s.rataRata)).toFixed(2)
              : "-"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Rata-rata Kelas</h3>
          <p className="text-2xl font-semibold text-gray-700">
            {siswaList.length > 0
              ? (
                  siswaList.reduce((acc, s) => acc + s.rataRata, 0) /
                  siswaList.length
                ).toFixed(2)
              : "-"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("noAbsen")}
                >
                  <div className="flex items-center">
                    No Absen
                    {getSortIcon("noAbsen")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("nisn")}
                >
                  <div className="flex items-center">
                    NISN
                    {getSortIcon("nisn")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("nama")}
                >
                  <div className="flex items-center">
                    Nama
                    {getSortIcon("nama")}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Mapel
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("rataRata")}
                >
                  <div className="flex items-center justify-center">
                    Rata-rata
                    {getSortIcon("rataRata")}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("ranking")}
                >
                  <div className="flex items-center justify-center">
                    Ranking
                    {getSortIcon("ranking")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((siswa) => (
                <tr
                  key={siswa.siswaId}
                  className={`hover:bg-gray-50 transition-colors ${
                    siswa.ranking <= 3 ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {siswa.noAbsen}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {siswa.nisn}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {siswa.ranking <= 3 && (
                        <span className="mr-2">
                          {siswa.ranking === 1
                            ? "🥇"
                            : siswa.ranking === 2
                            ? "🥈"
                            : "🥉"}
                        </span>
                      )}
                      {siswa.nama}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {siswa.jumlahMapel}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {siswa.rataRata.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        siswa.ranking === 1
                          ? "bg-yellow-100 text-yellow-800"
                          : siswa.ranking <= 3
                          ? "bg-green-100 text-green-800"
                          : siswa.ranking <= 10
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      #{siswa.ranking}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informasi */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-2">Informasi</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Klik header kolom untuk mengurutkan data</li>
          <li>
            • Perankingan dihitung berdasarkan rata-rata nilai akhir semua mata pelajaran
          </li>
          <li>• Siswa dengan ranking 1-3 mendapat highlight khusus</li>
          <li>
            • Data otomatis terupdate setiap kali nilai diinput atau diubah
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Perankingan;
