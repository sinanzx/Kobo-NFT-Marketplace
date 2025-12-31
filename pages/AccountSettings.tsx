import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  requestAccountDeletion,
  cancelAccountDeletion,
  getDeletionRequestStatus,
  requestDataExport,
  getDataExportRequests,
  getUserConsents,
  withdrawConsent,
  type DeletionRequest,
  type DataExport,
  type UserConsent,
} from '@/lib/gdprService';
import { Download, Trash2, AlertTriangle, Shield, FileText, X } from 'lucide-react';

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null);
  const [dataExports, setDataExports] = useState<DataExport[]>([]);
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deletionData, exportsData, consentsData] = await Promise.all([
        getDeletionRequestStatus(),
        getDataExportRequests(),
        getUserConsents(),
      ]);

      setDeletionRequest(deletionData);
      setDataExports(exportsData);
      setConsents(consentsData);
    } catch (error) {
      console.error('Failed to load account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    try {
      setActionLoading(true);
      const request = await requestAccountDeletion(deleteReason);
      setDeletionRequest(request);
      setShowDeleteConfirm(false);
      setDeleteReason('');
    } catch (error) {
      console.error('Failed to request deletion:', error);
      alert('Failed to request account deletion. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setActionLoading(true);
      const request = await cancelAccountDeletion();
      setDeletionRequest(request);
    } catch (error) {
      console.error('Failed to cancel deletion:', error);
      alert('Failed to cancel deletion request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setActionLoading(true);
      await requestDataExport();
      await loadData(); // Reload to show new export request
      alert('Data export started. You will receive a download link shortly.');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to request data export. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawConsent = async (consent: UserConsent) => {
    try {
      setActionLoading(true);
      await withdrawConsent(consent.consent_type, consent.consent_version);
      await loadData();
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
      alert('Failed to withdraw consent. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-[#ea5c2a] text-xl font-mono">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-mono font-bold text-[#ea5c2a] mb-2">
          // ACCOUNT_SETTINGS
        </h1>
        <p className="text-gray-400 font-mono text-sm mb-8">CONTROL_PANEL // USER_PREFERENCES</p>

        {/* Data Export Section */}
        <div className="bg-[#252525] border border-[#333] rounded p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-[#ea5c2a]" />
            <h2 className="text-2xl font-mono font-bold text-[#ea5c2a]">
              // DATA_EXPORT
            </h2>
          </div>
          <p className="text-gray-300 mb-4">
            Download a copy of all your data in JSON format. This includes your profile, NFTs, battles, collaborations, and more.
          </p>
          <button
            onClick={handleExportData}
            disabled={actionLoading}
            className="px-6 py-3 bg-[#ea5c2a] hover:bg-[#d14d1a] text-black font-mono font-semibold rounded transition-colors disabled:opacity-50"
          >
            {actionLoading ? 'PROCESSING...' : 'REQUEST_DATA_EXPORT'}
          </button>

          {dataExports.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-mono font-semibold text-white mb-3">EXPORT_HISTORY</h3>
              <div className="space-y-2">
                {dataExports.map((exp) => (
                  <div key={exp.id} className="bg-[#1e1e1e] rounded p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-mono font-medium">
                        {new Date(exp.requested_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-sm font-mono uppercase">{exp.status}</p>
                    </div>
                    {exp.status === 'completed' && exp.export_url && (
                      <a
                        href={exp.export_url}
                        download
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-mono font-semibold transition-colors"
                      >
                        DOWNLOAD
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Consent Management Section */}
        <div className="bg-[#252525] border border-[#333] rounded p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#ea5c2a]" />
            <h2 className="text-2xl font-mono font-bold text-[#ea5c2a]">
              // PRIVACY_CONSENTS
            </h2>
          </div>
          <p className="text-gray-300 mb-4">
            Manage your privacy preferences and consent settings.
          </p>

          {consents.length > 0 ? (
            <div className="space-y-3">
              {consents.map((consent) => (
                <div key={consent.id} className="bg-[#1e1e1e] rounded p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-mono font-medium uppercase">
                      {consent.consent_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-gray-400 text-sm font-mono">
                      {consent.consent_given ? 'CONSENT_GIVEN' : 'CONSENT_WITHDRAWN'} •{' '}
                      {new Date(consent.consented_at || consent.withdrawn_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  {consent.consent_given && (
                    <button
                      onClick={() => handleWithdrawConsent(consent)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-mono font-semibold transition-colors disabled:opacity-50"
                    >
                      WITHDRAW
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 font-mono">NO_CONSENT_RECORDS_FOUND</p>
          )}
        </div>

        {/* Account Deletion Section */}
        <div className="bg-[#252525] border border-[#333] rounded p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-mono font-bold text-red-400">
              // DELETE_ACCOUNT
            </h2>
          </div>

          {deletionRequest?.status === 'pending' ? (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-white font-mono font-semibold mb-2">ACCOUNT_DELETION_SCHEDULED</p>
                  <p className="text-gray-300 text-sm mb-3 font-mono">
                    SCHEDULED_FOR: {new Date(deletionRequest.scheduled_deletion_at).toLocaleDateString()}
                    <br />
                    You can cancel this request at any time before that date.
                  </p>
                  <button
                    onClick={handleCancelDeletion}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-mono font-semibold transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'PROCESSING...' : 'CANCEL_DELETION'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
                You will have a 30-day grace period to cancel the deletion.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-mono font-semibold transition-colors"
                >
                  REQUEST_ACCOUNT_DELETION
                </button>
              ) : (
                <div className="bg-red-500/20 border border-red-500/50 rounded p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-white font-mono font-semibold mb-2">ARE_YOU_ABSOLUTELY_SURE?</p>
                      <p className="text-gray-300 text-sm mb-3">
                        This will permanently delete your account after 30 days. All your NFTs, battles,
                        collaborations, and other data will be anonymized or removed.
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Optional: Tell us why you're leaving (helps us improve)"
                    className="w-full bg-[#1e1e1e] border border-[#333] rounded p-3 text-white placeholder-gray-500 mb-4 resize-none font-mono"
                    rows={3}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={handleRequestDeletion}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-mono font-semibold transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'PROCESSING...' : 'YES_DELETE_MY_ACCOUNT'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteReason('');
                      }}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-[#333] hover:bg-[#444] text-white rounded font-mono font-semibold transition-colors disabled:opacity-50"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Legal Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <a href="/privacy" className="text-gray-400 hover:text-[#ea5c2a] transition-colors flex items-center gap-2 font-mono">
            <FileText className="w-4 h-4" />
            PRIVACY_POLICY
          </a>
          <a href="/terms" className="text-gray-400 hover:text-[#ea5c2a] transition-colors flex items-center gap-2 font-mono">
            <FileText className="w-4 h-4" />
            TERMS_OF_SERVICE
          </a>
          <a href="/cookies" className="text-gray-400 hover:text-[#ea5c2a] transition-colors flex items-center gap-2 font-mono">
            <FileText className="w-4 h-4" />
            COOKIE_POLICY
          </a>
        </div>
      </div>
    </div>
  );
}
