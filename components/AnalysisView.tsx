
import React from 'react';
import { AnalysisResult, TableSuggestion } from '../types';
import { 
  Workflow, 
  Database, 
  Lightbulb, 
  ChevronRight, 
  Table as TableIcon, 
  Key, 
  Link as LinkIcon 
} from 'lucide-react';

interface AnalysisViewProps {
  data: AnalysisResult;
}

const TableCard: React.FC<{ table: TableSuggestion }> = ({ table }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
      <TableIcon className="w-5 h-5 text-indigo-600" />
      <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">{table.tableName}</h3>
    </div>
    <div className="p-4">
      <p className="text-sm text-slate-600 mb-4 italic">{table.reasoning}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-2 font-semibold text-slate-700">Trường</th>
              <th className="pb-2 font-semibold text-slate-700">Kiểu</th>
              <th className="pb-2 font-semibold text-slate-700">Ràng buộc</th>
              <th className="pb-2 font-semibold text-slate-700">Mô tả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {table.fields.map((field, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 font-mono text-indigo-600">{field.name}</td>
                <td className="py-2.5 text-slate-500">{field.type}</td>
                <td className="py-2.5">
                  <div className="flex gap-1">
                    {field.isPrimaryKey && (
                      <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <Key size={10} /> PK
                      </span>
                    )}
                    {field.isForeignKey && (
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <LinkIcon size={10} /> FK
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 text-slate-600">{field.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const AnalysisView: React.FC<AnalysisViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Workflow & Logic */}
      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Workflow size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Phân tích Workflow</h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-600 leading-relaxed mb-6">
              {data.workflowSummary}
            </p>
            <div className="space-y-4">
              {data.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                      ${step.type === 'decision' ? 'bg-amber-500 rotate-45' : step.type === 'start' ? 'bg-emerald-500' : step.type === 'end' ? 'bg-slate-800' : 'bg-indigo-500'}
                    `}>
                      <span className={step.type === 'decision' ? '-rotate-45' : ''}>{idx + 1}</span>
                    </div>
                    {idx < data.steps.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1 group-hover:bg-indigo-200 transition-colors" />}
                  </div>
                  <div className="pb-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      {step.title}
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-normal">
                        {step.type}
                      </span>
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Lightbulb size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Gợi ý tối ưu hóa</h2>
          </div>
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
            <ul className="space-y-3">
              {data.optimizationTips.map((tip, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-amber-900">
                  <ChevronRight size={18} className="flex-shrink-0 text-amber-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Right Column: Database Schema */}
      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Database size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Gợi ý tổ chức bảng dữ liệu</h2>
          </div>
          <div className="space-y-2">
            {data.databaseSchema.map((table, idx) => (
              <TableCard key={idx} table={table} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalysisView;
