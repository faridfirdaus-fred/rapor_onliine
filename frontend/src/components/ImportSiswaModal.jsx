import React, { useState } from 'react';
import axios from 'axios';

function ImportSiswaModal({ kelas, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Hanya file CSV yang diperbolehkan');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Pilih file CSV terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kelasId', kelas.id);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/siswa/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setResult(response.data);
      
      if (response.data.success) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal import data');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'nisn,nama\n1234567890,Ahmad Fadli\n1234567891,Budi Santoso\n1234567892,Citra Dewi';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-siswa.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            📥 Import Siswa dari CSV
          </h2>
          <p className="text-gray-600 mt-1">Kelas {kelas.nama}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                File CSV
              </label>
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                📄 Download Template
              </button>
            </div>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {file && (
              <p className="text-sm text-green-600 mt-2">
                ✓ File: {file.name}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Format CSV:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Header: <code className="bg-blue-100 px-1 rounded">nisn,nama</code></li>
              <li>• NISN dan Nama wajib diisi</li>
              <li>• Nomor absen otomatis berdasarkan urutan abjad nama</li>
              <li>• Contoh: <code className="bg-blue-100 px-1 rounded">1234567890,Ahmad Fadli</code></li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {result && (
            <div className={`mb-4 p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-yellow-50 border-yellow-300 text-yellow-700'
            }`}>
              <p className="font-semibold mb-2">{result.message}</p>
              <div className="text-sm space-y-1">
                <p>✓ Berhasil ditambahkan: {result.imported} siswa</p>
                {result.totalExisting !== undefined && (
                  <p>📊 Total siswa sebelumnya: {result.totalExisting}</p>
                )}
                {result.totalNow !== undefined && (
                  <p>📊 Total siswa sekarang: {result.totalNow}</p>
                )}
                {result.duplicates > 0 && (
                  <p className="text-orange-600">⚠️ Duplikat (dilewati): {result.duplicates} siswa</p>
                )}
                {result.failed > 0 && (
                  <p className="text-red-600">❌ Gagal: {result.failed} baris</p>
                )}
              </div>
              
              {result.duplicateDetails && result.duplicateDetails.length > 0 && (
                <div className="mt-3 p-2 bg-orange-100 rounded max-h-32 overflow-y-auto">
                  <p className="text-sm font-semibold mb-1">Siswa Duplikat (Sudah Ada):</p>
                  {result.duplicateDetails.map((dup, idx) => (
                    <p key={idx} className="text-xs">
                      • Baris {dup.row}: {dup.nama} (NISN: {dup.nisn})
                    </p>
                  ))}
                </div>
              )}
              
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3 p-2 bg-red-100 rounded max-h-32 overflow-y-auto">
                  <p className="text-sm font-semibold mb-1">Error Details:</p>
                  {result.errors.map((err, idx) => (
                    <p key={idx} className="text-xs">
                      Baris {err.row}: {err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Importing...' : '📥 Import'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition duration-200"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImportSiswaModal;
