import React, { useState, useEffect } from "react";

// Data dummy siswa (nanti akan diambil dari backend)
const initialSiswaList = [
  { absen: 1, nisn: "1234567890", nama: "Budi", mapel1: 80, mapel2: 85 },
  { absen: 2, nisn: "1234567891", nama: "Ani", mapel1: 90, mapel2: 88 },
  { absen: 3, nisn: "1234567892", nama: "Siti", mapel1: 75, mapel2: 80 },
  { absen: 4, nisn: "1234567893", nama: "Joko", mapel1: 85, mapel2: 82 },
  { absen: 5, nisn: "1234567894", nama: "Rina", mapel1: 88, mapel2: 90 },
  { absen: 6, nisn: "1234567895", nama: "Dani", mapel1: 72, mapel2: 75 },
];

const getRataRata = (siswa) => ((siswa.mapel1 + siswa.mapel2) / 2).toFixed(2);

const Perankingan = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "absen",
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);

  // Simulasi fetch data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulasi delay API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Menambahkan ranking ke data siswa
        const dataWithRanking = initialSiswaList.map((siswa) => ({
          ...siswa,
          rataRata: parseFloat(getRataRata(siswa)),
        }));

        // Sort berdasarkan rata-rata untuk ranking
        const sortedForRanking = [...dataWithRanking].sort(
          (a, b) => b.rataRata - a.rataRata
        );
        const dataWithRankingFinal = dataWithRanking.map((siswa) => ({
          ...siswa,
          ranking: sortedForRanking.findIndex((s) => s.nisn === siswa.nisn) + 1,
        }));

        setSiswaList(dataWithRankingFinal);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
  return (
    <div className="p-8 min-h-screen bg-green-50">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Perankingan Siswa
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
                  onClick={() => handleSort("absen")}
                >
                  <div className="flex items-center">
                    No Absen
                    {getSortIcon("absen")}
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
                  Mapel 1
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mapel 2
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rata-rata
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
                  key={siswa.nisn}
                  className={`hover:bg-gray-50 transition-colors ${
                    siswa.ranking <= 3 ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {siswa.absen}
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
                    {siswa.mapel1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {siswa.mapel2}
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
                          ? "bg-green-100 text-green-800"
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
            • Data perankingan otomatis terupdate dari nilai mata pelajaran
          </li>
          <li>• Siswa dengan ranking 1-3 mendapat highlight khusus</li>
          <li>
            • Data ini bersifat read-only dan tersinkron dengan input nilai
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Perankingan;
