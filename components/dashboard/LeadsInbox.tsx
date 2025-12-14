'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LeadDetailPanel } from './LeadDetailPanel';
import { Badge } from '../ui/badge';

type Lead = any; // Ideally import the type, but reusing loose type for now

export function LeadsInbox({ leads }: { leads: Lead[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedLeadId = searchParams.get('leadId');

    const selectedLead = leads.find(l => l.id === selectedLeadId);

    // Helper to select a lead (shallow update preferred usually, but push is standard)
    const selectLead = (id: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (id) {
            params.set('leadId', id);
        } else {
            params.delete('leadId');
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm relative">

            {/* List Pane - Hidden on Mobile if lead selected */}
            <div className={`
          w-full md:w-2/5 border-r border-slate-200 overflow-y-auto bg-white
          ${selectedLeadId ? 'hidden md:block' : 'block'}
      `}>
                {leads.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">No leads found.</div>
                )}
                <div className="divide-y divide-slate-100">
                    {leads.map(lead => (
                        <div
                            key={lead.id}
                            onClick={() => selectLead(lead.id)}
                            className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedLeadId === lead.id ? 'bg-brand-50/50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold text-sm ${lead.status === 'NEW' ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {lead.name}
                                </span>
                                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                    {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="text-xs text-slate-600 line-clamp-1 mb-2 font-medium">{lead.listings?.title || 'Unknown Property'}</div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 line-clamp-1 flex-1 mr-2">{lead.message}</span>
                                <Badge variant={lead.status === 'NEW' ? 'default' : 'secondary'} className={
                                    lead.status === 'NEW' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 text-[10px] h-5' :
                                        lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0 text-[10px] h-5' :
                                            'bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 text-[10px] h-5'
                                }>{lead.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Pane (Desktop) */}
            <div className="hidden md:block md:w-3/5 bg-slate-50/50 h-full overflow-hidden">
                {selectedLead ? (
                    <LeadDetailPanel
                        lead={selectedLead}
                        onClose={() => selectLead(null)}
                        isMobile={false}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm space-y-2">
                        <p>Select a lead to view details</p>
                    </div>
                )}
            </div>

            {/* Mobile Detail View (Full Screen Replacement) */}
            {selectedLeadId && (
                <div className="md:hidden absolute inset-0 z-50 bg-white h-full flex flex-col">
                    {selectedLead ? (
                        <LeadDetailPanel
                            lead={selectedLead}
                            onClose={() => selectLead(null)}
                            isMobile={true}
                        />
                    ) : (
                        // Edge case: leadId in URL but not in current list (maybe pagination?)
                        <div className="p-8 text-center bg-white h-full">
                            <p className="text-slate-500 mb-4">Lead not found in current view.</p>
                            <button onClick={() => selectLead(null)} className="text-brand-600 font-medium">Back to Inbox</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
