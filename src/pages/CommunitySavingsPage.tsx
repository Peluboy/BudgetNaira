import React, { useEffect, useState } from 'react';
import { communitySavingsService } from '../services/api';

interface Group {
  _id: string;
  groupName: string;
  totalCycles: number;
  currentCycle: number;
  admin: any;
  members: any[];
  contributions: any[];
  payoutSchedule: any[];
  inviteLink?: string;
  unpaidMembers?: any[];
}

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const CommunitySavingsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createCycles, setCreateCycles] = useState(4);
  const [joinId, setJoinId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionLoading, setContributionLoading] = useState(false);
  const [contributionError, setContributionError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [fixedAmount, setFixedAmount] = useState(0);
  const [adminSlot, setAdminSlot] = useState(0);
  const [slot, setSlot] = useState(0);

  // Fetch user's groups
  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await communitySavingsService.getUserGroups();
      setGroups(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await communitySavingsService.getNotifications();
      setNotifications(res.data);
    } catch {}
  };

  // Handle invite link auto-join
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinGroupId = params.get('join');
    if (joinGroupId) {
      setShowJoin(true);
      setJoinId(joinGroupId);
    }
    fetchGroups();
    fetchNotifications();
  }, []);

  // Create group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await communitySavingsService.createGroup({ groupName: createName, totalCycles: createCycles, fixedAmount, adminSlot });
      setShowCreate(false);
      setCreateName('');
      setCreateCycles(4);
      fetchGroups();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  // Join group
  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await communitySavingsService.joinGroup(joinId, slot);
      setShowJoin(false);
      setJoinId('');
      fetchGroups();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  // Select group and fetch details
  const handleSelectGroup = async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communitySavingsService.getGroup(groupId);
      setSelectedGroup(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  // Contribute to group
  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setContributionLoading(true);
    setContributionError(null);
    try {
      await communitySavingsService.contribute(selectedGroup._id, Number(contributionAmount));
      setContributionAmount('');
      handleSelectGroup(selectedGroup._id); // Refresh group details
    } catch (err: any) {
      setContributionError(err?.response?.data?.message || 'Failed to contribute');
    } finally {
      setContributionLoading(false);
    }
  };

  // Mark payout as completed (admin only)
  const handleMarkPayout = async (memberId: string, cycle: number) => {
    if (!selectedGroup) return;
    setPayoutLoading(true);
    setPayoutError(null);
    try {
      await communitySavingsService.markPayout(selectedGroup._id, memberId, cycle);
      handleSelectGroup(selectedGroup._id); // Refresh group details
    } catch (err: any) {
      setPayoutError(err?.response?.data?.message || 'Failed to mark payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Community Savings (Ajo/Esusu)</h1>
        <div className="relative">
          <button className="relative" onClick={() => setShowNotifications((v) => !v)}>
            <span role="img" aria-label="bell" className="text-2xl">🔔</span>
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">!</span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded p-4 z-50">
              <h3 className="font-semibold mb-2">Notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-gray-500">No notifications</p>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li key={n._id} className="mb-2 text-sm">
                      {n.message}
                      <span className="block text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Group List */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Groups</h2>
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : groups.length === 0 ? (
            <p className="text-gray-500">No groups yet. Join or create one!</p>
          ) : (
            <ul>
              {groups.map((group) => (
                <li key={group._id} className="mb-2 flex items-center justify-between">
                  <span className="font-medium cursor-pointer text-blue-700" onClick={() => handleSelectGroup(group._id)}>
                    {group.groupName} (Cycle {group.currentCycle}/{group.totalCycles})
                  </span>
                  <span className="text-xs text-gray-500">Members: {group.members.length}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-4 mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? 'Cancel' : 'Create Group'}
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowJoin((v) => !v)}>
            {showJoin ? 'Cancel' : 'Join Group'}
          </button>
        </div>
      </section>
{/* Create Group Modal */}
{showCreate && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    onClick={() => setShowCreate(false)}
    aria-modal="true"
    role="dialog"
  >
    <div
      className="bg-white dark:bg-gray-800 rounded shadow p-6 w-full max-w-md relative"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        onClick={() => setShowCreate(false)}
        aria-label="Close"
      >
        ×
      </button>
      <h2 className="text-xl font-semibold mb-4">Create a Group</h2>
      <form className="flex flex-col gap-4" onSubmit={handleCreateGroup}>
        <div>
          <label htmlFor="create-group-name" className="block mb-1 font-medium">Group Name</label>
          <input
            id="create-group-name"
            type="text"
            className="border rounded px-3 py-2 w-full"
            value={createName}
            onChange={e => setCreateName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="create-total-cycles" className="block mb-1 font-medium">Total Cycles</label>
          <input
            id="create-total-cycles"
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={createCycles}
            onChange={e => setCreateCycles(Number(e.target.value))}
            min={2}
            max={24}
            required
          />
        </div>
        <div>
          <label htmlFor="create-fixed-amount" className="block mb-1 font-medium">Fixed Amount (₦)</label>
          <input
            id="create-fixed-amount"
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={fixedAmount}
            onChange={e => setFixedAmount(Number(e.target.value))}
            min={1}
            required
          />
        </div>
        <div>
          <label htmlFor="create-admin-slot" className="block mb-1 font-medium">Your Slot (e.g. 1 for first month)</label>
          <input
            id="create-admin-slot"
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={adminSlot}
            onChange={e => setAdminSlot(Number(e.target.value))}
            min={1}
            max={createCycles}
            required
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  </div>
)}

{/* Join Group Modal */}
{showJoin && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    onClick={() => setShowJoin(false)}
    aria-modal="true"
    role="dialog"
  >
    <div
      className="bg-white dark:bg-gray-800 rounded shadow p-6 w-full max-w-md relative"
      onClick={e => e.stopPropagation()}
    >
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        onClick={() => setShowJoin(false)}
        aria-label="Close"
      >
        ×
      </button>
      <h2 className="text-xl font-semibold mb-4">Join a Group</h2>
      <form className="flex flex-col gap-4" onSubmit={handleJoinGroup}>
        <div>
          <label htmlFor="join-group-id" className="block mb-1 font-medium">Group ID</label>
          <input
            id="join-group-id"
            type="text"
            className="border rounded px-3 py-2 w-full"
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="join-slot" className="block mb-1 font-medium">Your Slot (e.g. 2 for second month)</label>
          <input
            id="join-slot"
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={slot}
            onChange={e => setSlot(Number(e.target.value))}
            min={1}
            required
          />
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>
          {loading ? 'Joining...' : 'Join Group'}
        </button>
      </form>
    </div>
  </div>
)}
      {/* Group Details */}
      {selectedGroup && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Group Details</h2>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
            <div className="mb-2">
              <span className="font-bold">Name:</span> {selectedGroup.groupName}
            </div>
            <div className="mb-2">
              <span className="font-bold">Admin:</span> {selectedGroup.admin?.firstName || selectedGroup.admin?.email || 'N/A'}
            </div>
            <div className="mb-2">
              <span className="font-bold">Cycle:</span> {selectedGroup.currentCycle} / {selectedGroup.totalCycles}
            </div>
            <div className="mb-2">
              <span className="font-bold">Invite Link:</span> <a href={selectedGroup.inviteLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{selectedGroup.inviteLink}</a>
            </div>
            <div className="mb-2">
              <span className="font-bold">Members:</span>
              <ul className="list-disc ml-6">
                {selectedGroup.members.map((m: any) => (
                  <li key={m.user?._id || m.user}>{m.user?.firstName || m.user?.email || m.user}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-bold">Unpaid Members (Current Cycle):</span>
              <ul className="list-disc ml-6">
                {selectedGroup.unpaidMembers && selectedGroup.unpaidMembers.length > 0 ? (
                  selectedGroup.unpaidMembers.map((m: any) => (
                    <li key={m.user?._id || m.user}>{m.user?.firstName || m.user?.email || m.user}</li>
                  ))
                ) : (
                  <li>All members have paid</li>
                )}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-bold">Contributions (Current Cycle):</span>
              <ul className="list-disc ml-6">
                {selectedGroup.contributions
                  .filter((c: any) => c.cycle === selectedGroup.currentCycle)
                  .map((c: any, idx: number) => (
                    <li key={idx}>{c.member?.firstName || c.member?.email || c.member}: ₦{c.amount}</li>
                  ))}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-bold">Payout Schedule:</span>
              <ul className="list-disc ml-6">
                {selectedGroup.payoutSchedule.map((p: any, idx: number) => (
                  <li key={idx}>
                    {p.member?.firstName || p.member?.email || p.member} - Cycle {p.cycle} - {p.paid ? 'Paid' : 'Pending'}
                    {selectedGroup.admin && (window.localStorage.getItem('userId') === selectedGroup.admin._id || window.localStorage.getItem('userId') === selectedGroup.admin) && !p.paid && (
                      <button
                        className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs"
                        onClick={() => handleMarkPayout(p.member?._id || p.member, p.cycle)}
                        disabled={payoutLoading}
                      >
                        {payoutLoading ? 'Marking...' : 'Mark as Paid'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {payoutError && <p className="text-red-500 mt-2">{payoutError}</p>}
            </div>
            {/* Contribute Form */}
            <form className="flex gap-2 mt-4" onSubmit={handleContribute}>
              <input
                type="number"
                placeholder="Amount"
                className="border rounded px-3 py-2"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                min={1}
                required
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={contributionLoading}>
                {contributionLoading ? 'Contributing...' : 'Contribute'}
              </button>
            </form>
            {contributionError && <p className="text-red-500 mt-2">{contributionError}</p>}
          </div>
          <button className="text-blue-600 underline" onClick={() => setSelectedGroup(null)}>
            Back to group list
          </button>
        </section>
      )}
    </div>
  );
};

export default CommunitySavingsPage;
