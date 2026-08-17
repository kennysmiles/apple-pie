import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, UserCheck, Calendar, Sparkles, PartyPopper, Trash2, Heart, Plus, Users } from 'lucide-react';
import { Friend, ThemeStyle } from '../../types';
import { searchUsersInSupabase } from '../../lib/supabase';
import { getZodiacSign, isImageUrl, resolveImageUrl } from '../../utils/helpers';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  onAddFriend: (friend: Omit<Friend, 'id'> | Friend) => void;
  onRemoveFriend: (friendId: string) => void;
  onSendCardToFriend?: (friend: Friend) => void;
  theme: ThemeStyle;
  currentUserId?: string;
}

// Default suggested platform community profiles so search is never empty
const SUGGESTED_COMMUNITY_USERS = [
  { fullName: 'Sarah Miller', username: 'sarahm', avatarUrl: '🌸', dateOfBirth: '1997-08-15' },
  { fullName: 'Marcus Vance', username: 'marcus_v', avatarUrl: '🚀', dateOfBirth: '1995-09-02' },
  { fullName: 'Emma Watson', username: 'emma_w', avatarUrl: '💖', dateOfBirth: '1999-10-24' },
  { fullName: 'Alex Rivera', username: 'alexr', avatarUrl: '🎨', dateOfBirth: '1996-03-12' },
  { fullName: 'David Chen', username: 'davidc', avatarUrl: '⚡', dateOfBirth: '1998-11-18' },
  { fullName: 'Chloe Bennett', username: 'chloeb', avatarUrl: '👑', dateOfBirth: '2000-01-29' },
];

const EMOJI_AVATARS = ['🎂', '🌸', '💖', '👑', '🚀', '⚡', '🎈', '🎁', '⭐', '🎨', '🦁', '🦄', '🎉', '🍀'];

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  friends,
  onAddFriend,
  onRemoveFriend,
  onSendCardToFriend,
  theme,
  currentUserId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'search' | 'manual' | 'list'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id?: string; fullName: string; username: string; avatarUrl: string; dateOfBirth: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Manual Friend Form State
  const [manualName, setManualName] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [manualDob, setManualDob] = useState('');
  const [manualAvatar, setManualAvatar] = useState('🎂');
  const [manualError, setManualError] = useState('');

  // Perform search
  useEffect(() => {
    if (!isOpen) return;

    const performSearch = async () => {
      if (!searchQuery.trim()) {
        // Show suggested users if search query is empty
        setSearchResults(SUGGESTED_COMMUNITY_USERS.map((u, i) => ({ ...u, id: `suggested-${i}` })));
        return;
      }

      setIsSearching(true);
      try {
        const cloudResults = await searchUsersInSupabase(searchQuery, currentUserId);
        
        const queryLower = searchQuery.toLowerCase().replace(/^@/, '');
        const matchingSuggested = SUGGESTED_COMMUNITY_USERS.filter(
          u => u.username.toLowerCase().includes(queryLower) || u.fullName.toLowerCase().includes(queryLower)
        ).map((u, i) => ({ ...u, id: `suggested-${i}` }));

        if (cloudResults && cloudResults.length > 0) {
          // If real database results exist, prioritize them!
          const cloudUsernames = new Set(cloudResults.map(r => r.username.toLowerCase()));
          const filteredSuggested = matchingSuggested.filter(s => !cloudUsernames.has(s.username.toLowerCase()));
          setSearchResults([...cloudResults, ...filteredSuggested]);
        } else {
          setSearchResults(matchingSuggested);
        }
      } catch (e) {
        // fallback
        const queryLower = searchQuery.toLowerCase().replace(/^@/, '');
        setSearchResults(
          SUGGESTED_COMMUNITY_USERS.filter(
            u => u.username.toLowerCase().includes(queryLower) || u.fullName.toLowerCase().includes(queryLower)
          ).map((u, i) => ({ ...u, id: `suggested-${i}` }))
        );
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, currentUserId]);

  if (!isOpen) return null;

  const isFriendAdded = (username: string, fullName: string) => {
    return friends.some(
      f => f.username?.toLowerCase() === username?.toLowerCase() || f.fullName?.toLowerCase() === fullName?.toLowerCase()
    );
  };

  const handleAddFoundUser = (user: { id?: string; fullName: string; username: string; avatarUrl: string; dateOfBirth: string }) => {
    onAddFriend({
      fullName: user.fullName,
      username: user.username,
      avatarUrl: user.avatarUrl || '🎂',
      dateOfBirth: user.dateOfBirth || new Date().toISOString().split('T')[0],
      addedAt: new Date().toISOString(),
      userId: user.id
    });
    setSuccessMessage(`Added ${user.fullName} (@${user.username}) as a friend! 🎉`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    if (!manualName.trim()) {
      setManualError('Please enter a friend name');
      return;
    }
    if (!manualDob) {
      setManualError('Please select a Date of Birth');
      return;
    }

    const username = manualUsername.trim()
      ? manualUsername.trim().replace(/^@/, '')
      : manualName.trim().toLowerCase().replace(/\s+/g, '');

    onAddFriend({
      fullName: manualName.trim(),
      username,
      avatarUrl: manualAvatar,
      dateOfBirth: manualDob,
      addedAt: new Date().toISOString()
    });

    setSuccessMessage(`Added ${manualName.trim()} to your friends! 🎉`);
    setManualName('');
    setManualUsername('');
    setManualDob('');
    setTimeout(() => setSuccessMessage(''), 3000);
    setActiveSubTab('list');
  };

  // Helper to calculate days until birthday
  const getDaysUntilBirthday = (dob: string) => {
    if (!dob) return null;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bdate = new Date(dob);
      let nextBirthday = new Date(today.getFullYear(), bdate.getMonth(), bdate.getDate());
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      const diffTime = nextBirthday.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          theme.isDark
            ? 'bg-slate-900 border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${theme.isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                Friends & Birthdays 👥
              </h2>
              <p className={`text-xs ${theme.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                Add real users to receive upcoming birthday alerts & send cards!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition cursor-pointer ${
              theme.isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className={`flex border-b text-xs font-bold ${theme.isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-100/50'}`}>
          <button
            onClick={() => setActiveSubTab('search')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeSubTab === 'search'
                ? 'border-indigo-500 text-indigo-500 font-black bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" /> Search Users
          </button>
          <button
            onClick={() => setActiveSubTab('manual')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeSubTab === 'manual'
                ? 'border-indigo-500 text-indigo-500 font-black bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" /> Custom Friend
          </button>
          <button
            onClick={() => setActiveSubTab('list')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeSubTab === 'list'
                ? 'border-indigo-500 text-indigo-500 font-black bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-pink-500" /> My Friends ({friends.length})
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" /> {successMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* 1. SEARCH TAB */}
          {activeSubTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or @username (e.g. sarahm)..."
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm transition outline-none ${
                    theme.isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                  }`}
                  autoFocus
                />
              </div>

              <div className="text-[11px] uppercase font-extrabold tracking-wider opacity-60 flex justify-between items-center pt-1">
                <span>{searchQuery ? 'Search Results' : 'Suggested Community Users'}</span>
                <span>{searchResults.length} found</span>
              </div>

              {isSearching ? (
                <div className="py-8 text-center text-xs opacity-60 animate-pulse">
                  Searching community members...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm font-bold opacity-80">No user found matching "{searchQuery}"</p>
                  <p className="text-xs opacity-60">You can add them manually in the "Custom Friend" tab!</p>
                  <button
                    onClick={() => {
                      setManualName(searchQuery.replace(/^@/, ''));
                      setActiveSubTab('manual');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                  >
                    ➕ Add "{searchQuery}" as Custom Friend
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {searchResults.map((user, idx) => {
                    const added = isFriendAdded(user.username, user.fullName);
                    const daysLeft = user.dateOfBirth ? getDaysUntilBirthday(user.dateOfBirth) : null;
                    const zodiac = user.dateOfBirth ? getZodiacSign(user.dateOfBirth) : null;

                    return (
                      <div
                        key={user.id || `user-${idx}`}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          theme.isDark
                            ? 'bg-white/5 border-white/10 hover:border-indigo-500/50'
                            : 'bg-slate-50 border-slate-200 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                            {isImageUrl(user.avatarUrl) ? (
                              <img
                                src={resolveImageUrl(user.avatarUrl)}
                                alt={user.fullName}
                                className="w-full h-full object-cover rounded-2xl"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              user.avatarUrl || '🎂'
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm">{user.fullName}</h4>
                              <span className="text-xs opacity-60 font-mono">@{user.username}</span>
                              {(user as any).isRealUser || (user.id && !user.id.startsWith('suggested-')) ? (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                                  ⚡
                                </span>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] opacity-70 mt-0.5">
                              {user.dateOfBirth && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {new Date(user.dateOfBirth).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              {zodiac && (
                                <span className="text-amber-400 font-medium">✨ {zodiac.name}</span>
                              )}
                              {daysLeft !== null && (
                                <span className="text-pink-400 font-extrabold">🎉 {daysLeft}d left</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {added ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" /> Added
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddFoundUser(user)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. MANUAL FRIEND FORM TAB */}
          {activeSubTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {manualError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
                  ⚠️ {manualError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase opacity-80 mb-1.5">
                  Friend's Full Name *
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="e.g. Jessica Taylor"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition outline-none ${
                    theme.isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-80 mb-1.5">
                  Username (optional)
                </label>
                <input
                  type="text"
                  value={manualUsername}
                  onChange={e => setManualUsername(e.target.value)}
                  placeholder="e.g. jessica_t"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition outline-none ${
                    theme.isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-80 mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={manualDob}
                  onChange={e => setManualDob(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition outline-none ${
                    theme.isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-80 mb-1.5">
                  Choose Avatar Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_AVATARS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setManualAvatar(emoji)}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition cursor-pointer border ${
                        manualAvatar === emoji
                          ? 'border-indigo-500 bg-indigo-500/20 scale-110'
                          : 'border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-xs font-black shadow-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Save Friend to List
              </button>
            </form>
          )}

          {/* 3. MY FRIENDS LIST TAB */}
          {activeSubTab === 'list' && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Users className="w-12 h-12 mx-auto text-slate-400 opacity-50" />
                  <p className="text-sm font-bold opacity-80">You haven't added any friends yet!</p>
                  <p className="text-xs opacity-60">Add friends to track their upcoming birthdays right on your dashboard.</p>
                  <button
                    onClick={() => setActiveSubTab('search')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                  >
                    🔍 Find & Add Friends
                  </button>
                </div>
              ) : (
                friends.map((friend) => {
                  const daysLeft = getDaysUntilBirthday(friend.dateOfBirth);
                  const zodiac = friend.dateOfBirth ? getZodiacSign(friend.dateOfBirth) : null;

                  return (
                    <div
                      key={friend.id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        theme.isDark
                          ? 'bg-white/5 border-white/10 hover:border-indigo-500/50'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                          {isImageUrl(friend.avatarUrl) ? (
                            <img
                              src={resolveImageUrl(friend.avatarUrl)}
                              alt={friend.fullName}
                              className="w-full h-full object-cover rounded-2xl"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            friend.avatarUrl || '🎂'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm">{friend.fullName}</h4>
                            <span className="text-xs opacity-60 font-mono">@{friend.username}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs opacity-80 mt-1">
                            <span className="flex items-center gap-1 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              {new Date(friend.dateOfBirth).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                            </span>
                            {zodiac && (
                              <span className="text-amber-400 font-bold">✨ {zodiac.name}</span>
                            )}
                            {daysLeft !== null && (
                              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-black text-[11px] border border-pink-500/30">
                                🎉 {daysLeft === 0 ? 'Today!' : `${daysLeft} days left`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {onSendCardToFriend && (
                          <button
                            onClick={() => {
                              onSendCardToFriend(friend);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold transition shadow flex items-center gap-1 cursor-pointer"
                            title="Design birthday card for this friend"
                          >
                            <PartyPopper className="w-3.5 h-3.5" /> Send Card
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveFriend(friend.id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                          title="Remove friend"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
