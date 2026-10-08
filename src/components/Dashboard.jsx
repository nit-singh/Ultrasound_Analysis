import React, { useState } from 'react';
import { Upload, Image, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
      setError('');
      setResults(null);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch('http://localhost:8000/segment', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const getClassificationColor = (prediction) => {
      switch (prediction) {
        case 'normal': return 'text-green-400';
        case 'benign': return 'text-yellow-400';
        case 'malignant': return 'text-red-400';
        default: return 'text-gray-400';
      }
    };

    const getClassificationBg = (prediction) => {
      switch (prediction) {
        case 'normal': return 'bg-green-900/20 border-green-500';
        case 'benign': return 'bg-yellow-900/20 border-yellow-500';
        case 'malignant': return 'bg-red-900/20 border-red-500';
        default: return 'bg-gray-900/20 border-gray-500';
      }
    };

    return (
      <div className="mt-8 p-4 rounded-xl border max-w-lg bg-neutral-900/60 shadow-lg">
        <h3 className="font-bold text-lg mb-2 text-white">Classification:</h3>
        <div className={`p-3 mb-2 rounded border text-center font-bold text-xl ${getClassificationColor(results.prediction)} ${getClassificationBg(results.prediction)}`}>
          {results.prediction?.toUpperCase()}
        </div>
        <div className="mb-4">
          {results.prediction === 'normal' && <span className="text-green-200">No abnormalities detected</span>}
          {results.prediction === 'benign' && <span className="text-yellow-200">Non-cancerous tissue detected</span>}
          {results.prediction === 'malignant' && <span className="text-red-300">Potentially cancerous tissue detected</span>}
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6">
          <div className="flex-1 mb-5 sm:mb-0">
            <p className="mb-2 text-xs text-gray-400">Original Image</p>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-56 h-auto rounded-lg border shadow"
                style={{ background: 'white' }}
              />
            )}
          </div>
          <div className="flex-1">
            <p className="mb-2 text-xs text-gray-400">Segmentation Mask</p>
            {results.segmentation ? (
              <img
                src={`data:image/png;base64,${results.segmentation}`}
                alt="Segmentation Mask"
                className="w-56 h-auto rounded-lg border shadow"
                style={{ background: 'white' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                {results.prediction === 'normal'
                  ? "No mask (image classified as normal)"
                  : "No segmentation mask returned."}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-6 px-2 bg-neutral-950 text-white transition">
      <h1 className="text-center font-bold text-2xl mb-3 mt-3">Ultrasound Image Analysis</h1>
      <p className="mb-5 max-w-xl text-center text-sm text-gray-400">
        Upload an ultrasound scan to receive automatic classification and region segmentation.
      </p>
      <label className="flex flex-col items-center border-2 border-dashed border-gray-500 p-6 rounded-lg cursor-pointer hover:border-[#00df9a] transition mb-4 bg-neutral-900/70 shadow">
        <Upload className="mb-2" size={32} />
        <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <span className="text-xs opacity-90">
          Click or drag and drop an image (JPG, PNG, GIF, Max 10MB)
        </span>
        {selectedFile && (
          <span className="mt-2 text-xs text-gray-300">{selectedFile.name}</span>
        )}
      </label>

      {/* Preview appears instantly after file selection, above Analyze button */}
      {preview && (
        <div className="mb-4 flex flex-col items-center">
          <span className="font-semibold text-white mb-1">Image Preview</span>
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs rounded shadow border"
            style={{ background: '#fff' }}
          />
        </div>
      )}

      <button
        className="bg-[#00df9a] hover:bg-[#00b97a] text-black font-semibold py-2 px-8 rounded shadow mt-2 transition disabled:opacity-70"
        disabled={loading || !selectedFile}
        onClick={handleUpload}
      >
        {loading ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin mr-2" /> Analyzing...
          </span>
        ) : (
          <span>Analyze</span>
        )}
      </button>
      {error && (
        <div className="mt-4 flex items-center text-red-400 text-sm">
          <AlertCircle className="mr-2" /> {error}
        </div>
      )}
      {renderResults()}
    </div>
  );
};

export default Dashboard;