import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Camera, Check, RefreshCw, AtSign, Calendar, Sparkles, ShieldCheck, Cloud, AlertCircle, Users, UserPlus } from 'lucide-react';
import { UserProfile, ThemeStyle, Friend } from '../../types';
import { AVATAR_PRESETS } from '../../constants/presets';
import { getBirthMonth, getZodiacSign, isImageUrl, resolveImageUrl } from '../../utils/helpers';
import { playMagicalBell } from '../../utils/synth';
import { uploadImageToSupabase } from '../../lib/supabase';

interface ProfileViewProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => Promise<void> | void;
  profileSaving?: boolean;
  profileSuccessMsg?: string;
  theme: ThemeStyle;
  supabaseUser?: any;
  onOpenAuthModal?: () => void;
  friends?: Friend[];
  onOpenAddFriendModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onSaveProfile,
  profileSaving = false,
  profileSuccessMsg = '',
  theme,
  supabaseUser,
  onOpenAuthModal,
  friends = [],
  onOpenAddFriendModal,
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    fullName: userProfile.fullName || '',
    username: userProfile.username || '',
    avatarUrl: userProfile.avatarUrl || '🎂',
    dateOfBirth: userProfile.dateOfBirth || '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [localSuccessMsg, setLocalSuccessMsg] = useState('');
  const [localErrorMsg, setLocalErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErrorMsg('');
    setLocalSuccessMsg('');

    const cleanUsername = (formData.username || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9_]/g, '');

    const updatedProfile: UserProfile = {
      fullName: formData.fullName.trim() || 'Studio Guest',
      username: cleanUsername,
      avatarUrl: formData.avatarUrl || '🎂',
      dateOfBirth: formData.dateOfBirth || '',
    };

    try {
      await onSaveProfile(updatedProfile);
      setLocalSuccessMsg('Profile saved successfully! ✨');
      setTimeout(() => setLocalSuccessMsg(''), 3000);
    } catch (err: any) {
      setLocalErrorMsg(err?.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleImageUpload = async (file: File) => {
    setLocalErrorMsg('');
    try {
      setUploadingImage(true);
      const avatarUrl = await uploadImageToSupabase(file, 'birthday-memories');
      setFormData((prev) => ({ ...prev, avatarUrl }));
      playMagicalBell(880, 0.4);
    } catch (err: any) {
      setLocalErrorMsg(err?.message || 'Failed to process photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const zodiac = getZodiacSign(formData.dateOfBirth);
  const month = getBirthMonth(formData.dateOfBirth);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto w-full space-y-8 pb-12"
    >
      {/* Profile Header Hero */}
      <div className={`p-6 sm:p-8 rounded-[36px] border ${
        theme.isDark
          ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border-indigo-500/30 text-white shadow-2xl'
          : 'bg-gradient-to-br from-indigo-50/80 via-white to-pink-50/80 border-indigo-200 text-slate-800 shadow-xl'
      } relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-indigo-500/15">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight">
                Profile & Settings 👤
              </h1>
              <p className={`text-xs mt-0.5 ${theme.isDark ? 'text-indigo-200/70' : 'text-slate-600'}`}>
                Manage your name, username handle, avatar, and birthday info
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {supabaseUser ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Logged in
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5" /> Login
              </button>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {localErrorMsg && (
            <div className="p-3.5 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localErrorMsg}</span>
            </div>
          )}

          {(localSuccessMsg || profileSuccessMsg) && !localErrorMsg && (
            <div className="p-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-pulse">
              <Check className="w-4 h-4 shrink-0" />
              <span>{localSuccessMsg || profileSuccessMsg}</span>
            </div>
          )}

          {/* Avatar Upload / Selector */}
          <div className="p-5 rounded-3xl border bg-indigo-500/5 border-indigo-500/15 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border-2 overflow-hidden ${
                theme.isDark ? 'bg-slate-800 border-white/20' : 'bg-white border-slate-200'
              }`}>
                {isImageUrl(formData.avatarUrl) ? (
                  <img
                    src={resolveImageUrl(formData.avatarUrl)}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerText = '🎂';
                      }
                    }}
                  />
                ) : (
                  <span className="select-none">{formData.avatarUrl || '🎂'}</span>
                )}
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center text-white">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-sm font-bold">Profile Photo / Avatar</h3>
                <p className={`text-xs ${theme.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                  Upload a photo or pick a fun emoji avatar for your wishlists
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <label className="cursor-pointer">
                  <span className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold border border-indigo-400/30 shadow transition inline-flex items-center gap-1.5 cursor-pointer">
                    <Camera className="w-4 h-4" /> Upload Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>

                <div className="relative group">
                  <button
                    type="button"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                      theme.isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    Emoji Presets 🎨
                  </button>
                  <div className={`absolute top-full left-0 mt-2 hidden group-hover:grid grid-cols-6 p-3 rounded-2xl shadow-2xl gap-2 z-50 border w-72 ${
                    theme.isDark ? 'bg-slate-950/95 border-white/20' : 'bg-white border-slate-200 shadow-xl'
                  }`}>
                    {AVATAR_PRESETS.map((emoji, idx) => (
                      <button
                        key={`${emoji}-${idx}`}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: emoji }))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:bg-indigo-500/20 hover:scale-110 transition cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${
                  theme.isDark ? 'text-white/70' : 'text-slate-600'
                }`}>
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Kenneth Abazu"
                  className={`w-full px-4 py-2.5 rounded-2xl text-sm focus:outline-none border transition ${
                    theme.isDark
                      ? 'bg-white/5 border-white/15 text-white focus:border-indigo-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${
                  theme.isDark ? 'text-white/70' : 'text-slate-600'
                }`}>
                  <AtSign className="w-3.5 h-3.5 text-indigo-400" /> Username / Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono opacity-50">@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      username: e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '')
                    }))}
                    placeholder="kenneth123"
                    className={`w-full pl-8 pr-4 py-2.5 rounded-2xl text-sm font-mono focus:outline-none border transition ${
                      theme.isDark
                        ? 'bg-white/5 border-white/15 text-white focus:border-indigo-500'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 shadow-sm'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${
                theme.isDark ? 'text-white/70' : 'text-slate-600'
              }`}>
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-2xl text-sm font-mono focus:outline-none border transition ${
                  theme.isDark
                    ? 'bg-white/5 border-white/15 text-white focus:border-indigo-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 shadow-sm'
                }`}
              />
            </div>

            {/* Badges preview */}
            {(zodiac || month) && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {month && (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    theme.isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                  }`}>
                    📅 Birth Month: {month}
                  </span>
                )}
                {zodiac && (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    theme.isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    ✨ Zodiac Sign: {zodiac.name} {zodiac.symbol}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-indigo-500/15 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={profileSaving || uploadingImage}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {profileSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Friends Overview Card */}
      <div className={`p-6 sm:p-8 rounded-[36px] border ${
        theme.isDark
          ? 'bg-slate-900/90 border-white/10 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-800 shadow-xl'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg">
              👥
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                My Friends List ({friends.length})
              </h2>
              <p className={`text-xs ${theme.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                Add real users as friends to get real upcoming birthday notifications & send cards
              </p>
            </div>
          </div>

          {onOpenAddFriendModal && (
            <button
              type="button"
              onClick={onOpenAddFriendModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Manage & Add Friends
            </button>
          )}
        </div>

        <div className="mt-4">
          {friends.length === 0 ? (
            <div className="text-center py-6 opacity-70 space-y-1">
              <p className="text-xs font-bold">You haven't added any friends yet.</p>
              <p className="text-[11px]">Search users by username or add custom contacts to receive birthday alerts!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 ${
                    theme.isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {isImageUrl(friend.avatarUrl) ? (
                      <img
                        src={resolveImageUrl(friend.avatarUrl)}
                        alt={friend.fullName}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      friend.avatarUrl || '🎂'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{friend.fullName}</p>
                    <p className="text-[11px] opacity-60 font-mono truncate">@{friend.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
