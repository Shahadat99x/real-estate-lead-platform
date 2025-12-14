'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setLeadStatusAction, updateLeadNotesAction, deleteLeadAction } from '../../lib/actions/leads';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronLeft, Trash2, Phone, Mail, MapPin, CheckCircle, XCircle, Archive, Inbox, Loader2 } from 'lucide-react';

type Lead = any; // reusing loose type

export function LeadDetailPanel({ lead, onClose, isMobile }: { lead: Lead; onClose: () => void; isMobile: boolean }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [notes, setNotes] = useState(lead.notes || '');

    // Optimistic update for notes
    useEffect(() => {
        setNotes(lead.notes || '');
    }, [lead.id, lead.notes]);

    // Handler to set lead status with proper refresh
    const handleSetStatus = (status: string) => {
        const formData = new FormData();
        formData.append('leadId', lead.id);
        formData.append('status', status);
        startTransition(async () => {
            await setLeadStatusAction(formData);
            router.refresh();
        });
    };

    // Handler to save notes with proper refresh
    const handleSaveNotes = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('leadId', lead.id);
        formData.append('notes', notes);
        startTransition(async () => {
            await updateLeadNotesAction(formData);
            router.refresh();
        });
    };

    // Handler for delete with confirmation and proper refresh
    const handleDelete = () => {
        if (!window.confirm('Are you sure you want to delete this lead? This cannot be undone.')) {
            return;
        }
        const formData = new FormData();
        formData.append('leadId', lead.id);
        startTransition(async () => {
            await deleteLeadAction(formData);
            router.refresh();
            if (isMobile) {
                setTimeout(onClose, 300);
            }
        });
    };

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="flex-none p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {isMobile && (
                        <Button variant="ghost" size="sm" onClick={onClose} className="-ml-2 text-slate-600 hover:text-slate-900 pr-2">
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </Button>
                    )}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">{lead.name}</h2>
                        <p className="text-xs text-slate-500">{new Date(lead.created_at).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                        lead.status === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            lead.status === 'CONTACTED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-slate-50 text-slate-700 border-slate-200'
                    }>{lead.status}</Badge>
                    {!isMobile && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <span className="sr-only">Close</span>
                            <ChevronLeft className="w-5 h-5 rotate-180" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Email
                        </label>
                        <div className="text-sm font-medium">
                            <a href={`mailto:${lead.email}`} className="text-brand-600 hover:underline break-all">{lead.email}</a>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Phone
                        </label>
                        <div className="text-sm font-medium text-slate-900">{lead.phone || 'N/A'}</div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Interested In
                        </label>
                        {lead.listings ? (
                            <div className="text-sm font-medium text-slate-900">
                                {lead.listings.title}
                                <span className="text-slate-500 font-normal"> — {lead.listings.city} ({new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(lead.listings.price)})</span>
                            </div>
                        ) : (
                            <span className="text-sm text-slate-400 italic">Listing deleted</span>
                        )}
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message</label>
                    <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm">
                        {lead.message}
                    </div>
                </div>

                {/* Notes Form */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Notes</label>
                    </div>
                    <form onSubmit={handleSaveNotes} className="relative">
                        <textarea
                            name="notes"
                            className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none bg-slate-50"
                            placeholder="Add private notes here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <div className="absolute bottom-2 right-2">
                            <Button size="sm" type="submit" disabled={isPending} className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white">
                                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Note'}
                            </Button>
                        </div>
                    </form>
                </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="flex-none p-4 bg-white border-t border-slate-100 flex flex-col gap-3 pb-8 md:pb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center md:text-left mb-1">Actions</div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">

                    {/* Mark Contacted */}
                    {lead.status === 'NEW' && (
                        <Button size="sm" onClick={() => handleSetStatus('CONTACTED')} disabled={isPending} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700">
                            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />} Mark Contacted
                        </Button>
                    )}

                    {/* Archive / Unarchive */}
                    {lead.status !== 'ARCHIVED' && (
                        <Button size="sm" variant="outline" onClick={() => handleSetStatus('ARCHIVED')} disabled={isPending} className="flex-1 md:flex-none">
                            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4 mr-2" />} Archive
                        </Button>
                    )}
                    {lead.status === 'ARCHIVED' && (
                        <Button size="sm" variant="outline" onClick={() => handleSetStatus('NEW')} disabled={isPending} className="flex-1 md:flex-none">
                            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Inbox className="w-4 h-4 mr-2" />} Move to Inbox
                        </Button>
                    )}

                    {/* Close */}
                    {lead.status !== 'CLOSED' && (
                        <Button size="sm" variant="outline" onClick={() => handleSetStatus('CLOSED')} disabled={isPending} className="flex-1 md:flex-none border-slate-300">
                            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />} Close Lead
                        </Button>
                    )}

                    <div className="flex-1 md:hidden" />

                    {/* Delete */}
                    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending} className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
