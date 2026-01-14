
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Loader2, 
  AlertCircle, 
  FileText,
  BrainCircuit,
  Database,
  Send,
  MessageSquareCode,
  Paperclip,
  X,
  FileUp,
  Settings2
} from 'lucide-react';
import { analyzeWorkflowImage, ReferenceFile } from './services/geminiService';
import { AnalysisResult } from './types';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialInstructions, setInitialInstructions] = useState('');
  const [refineText, setRefineText] = useState('');
  const [refineFile, setRefineFile] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refineFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
        setRefineText('');
        setInitialInstructions('');
        setRefineFile(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefineFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefineFile({
          data: (reader.result as string).split(',')[1],
          mimeType: file.type || 'image/png',
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (customInstructions?: string, referenceFile?: ReferenceFile) => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const base64Data = image.split(',')[1];
      // Use initialInstructions if this is the first analysis and no customInstructions provided
      const finalInstructions = customInstructions || initialInstructions;
      const analysis = await analyzeWorkflowImage(base64Data, finalInstructions, referenceFile);
      setResult(analysis);
      if (customInstructions) {
        setRefineText('');
        setRefineFile(null);
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra trong quá trình phân tích. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!refineText.trim() && !refineFile) || isAnalyzing) return;
    
    const reference = refineFile ? { data: refineFile.data, mimeType: refineFile.mimeType } : undefined;
    startAnalysis(refineText, reference);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-100 shadow-lg">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none tracking-tight">Workflow Architect</h1>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-60">AI Engineering</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-semibold text-slate-400 hidden sm:inline px-3 py-1 bg-slate-100 rounded-full tracking-tight">Gemini 3 Pro-Image</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Phân tích Workflow <span className="text-indigo-600">&</span> Dữ liệu</h2>
              <p className="text-lg text-slate-600">Kiến tạo cấu trúc database từ quy trình nghiệp vụ chỉ bằng một tấm ảnh.</p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-100 flex flex-col items-center justify-center min-h-[500px] transition-all">
              {image ? (
                <div className="w-full space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left: Preview */}
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
                      <img src={image} alt="Uploaded workflow" className="w-full h-auto max-h-[400px] object-contain mx-auto" />
                      <button 
                        onClick={() => setImage(null)}
                        className="absolute top-3 right-3 bg-white/95 hover:bg-white p-2 rounded-full shadow-xl text-red-500 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm active:scale-90"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Right: Initial Configuration */}
                    <div className="space-y-6">
                      <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3 text-indigo-700">
                          <Settings2 size={18} />
                          <h4 className="font-bold text-sm uppercase tracking-wider">Cấu hình phân tích</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Bạn có yêu cầu đặc biệt nào cho AI không?</p>
                        <textarea 
                          value={initialInstructions}
                          onChange={(e) => setInitialInstructions(e.target.value)}
                          placeholder="VD: Chỉ tập trung vào quy trình thanh toán, Thêm các bảng quản lý người dùng, v.v..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all resize-none shadow-sm"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => startAnalysis()}
                          disabled={isAnalyzing}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="animate-spin" /> Đang thiết kế hệ thống...
                            </>
                          ) : (
                            <>
                              <BrainCircuit /> Phân tích ngay
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold py-3 px-8 rounded-2xl transition-all text-sm"
                        >
                          Thay đổi sơ đồ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center group cursor-pointer w-full" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all shadow-inner shadow-indigo-100">
                    <Upload size={44} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Tải lên sơ đồ quy trình</h3>
                  <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">AI sẽ đọc sơ đồ của bạn và tự động thiết kế cơ sở dữ liệu chuẩn hóa.</p>
                  <div className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95">
                    <FileUp size={20} /> Chọn từ máy tính
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {error && (
              <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-700 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold">Đã xảy ra lỗi</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <button 
                  onClick={() => setResult(null)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1.5 mb-2 transition-all group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Quay lại trang chủ
                </button>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kết Quả Phân Tích Hệ Thống</h2>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <FileText size={18} /> Tải PDF
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  <Database size={18} /> Xuất SQL
                </button>
              </div>
            </div>

            <AnalysisView data={result} />

            {/* Refinement Input Bar - Sticky Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-8px_40px_rgba(0,0,0,0.06)] z-30">
              <div className="max-w-7xl mx-auto relative">
                
                {/* File Preview Bubble */}
                {refineFile && (
                  <div className="absolute -top-16 left-4 right-4 sm:left-auto flex justify-center sm:justify-end animate-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-white border border-indigo-200 rounded-xl px-3 py-1.5 flex items-center gap-3 shadow-xl">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                        <FileText size={16} />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-700 max-w-[150px] truncate">{refineFile.name}</p>
                        <p className="text-slate-400">Tài liệu tham khảo</p>
                      </div>
                      <button 
                        onClick={() => setRefineFile(null)}
                        className="p-1 hover:bg-red-50 text-red-400 rounded-md transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRefineSubmit} className="relative group max-w-4xl mx-auto">
                  <div className={`absolute -top-12 left-0 right-0 flex justify-center transition-all ${isAnalyzing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="bg-indigo-600 text-white text-xs font-bold px-5 py-2 rounded-full flex items-center gap-2 shadow-xl shadow-indigo-200">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Hệ thống đang điều chỉnh thiết kế...
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-3 bg-white border-2 border-slate-100 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 rounded-3xl p-2.5 shadow-sm transition-all">
                    <div className="flex flex-col gap-1">
                      <button 
                        type="button"
                        onClick={() => refineFileInputRef.current?.click()}
                        className={`p-2.5 rounded-2xl transition-all active:scale-90 ${refineFile ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-400 hover:text-indigo-500'}`}
                        title="Đính kèm tài liệu tham khảo"
                      >
                        <Paperclip size={22} />
                      </button>
                    </div>

                    <textarea 
                      value={refineText}
                      onChange={(e) => setRefineText(e.target.value)}
                      placeholder="Nhập yêu cầu hiệu chỉnh (VD: Tách bảng lịch sử thầu, Thêm trường fStatus...)"
                      rows={1}
                      disabled={isAnalyzing}
                      className="w-full bg-transparent border-none focus:ring-0 text-slate-800 py-2.5 resize-none max-h-32 text-sm sm:text-base font-medium placeholder:text-slate-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleRefineSubmit(e);
                        }
                      }}
                    />
                    
                    <button 
                      type="submit"
                      disabled={(!refineText.trim() && !refineFile) || isAnalyzing}
                      className="p-3 bg-indigo-600 text-white rounded-2xl disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex-shrink-0"
                      title="Gửi yêu cầu"
                    >
                      {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send size={24} />}
                    </button>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={refineFileInputRef} 
                    onChange={handleRefineFileUpload} 
                    className="hidden" 
                    accept="image/*,application/pdf,text/plain"
                  />
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={`bg-slate-50 border-t border-slate-200 py-12 ${result ? 'mb-24' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-30 grayscale">
             <BrainCircuit size={20} />
             <span className="font-bold text-sm tracking-widest uppercase">Workflow Architect</span>
          </div>
          <p className="text-slate-400 text-xs font-medium tracking-tight">© 2024 Design & Analysis Powered by Gemini Advanced.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
