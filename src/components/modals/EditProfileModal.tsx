import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Check, RefreshCw, User, Sparkles, Calendar, AtSign, AlertCircle } from 'lucide-react';
import { UserProfile, ThemeStyle } from '../../types';
import { AVATAR_PRESETS } from '../../constants/presets';
import { getBirthMonth, getZodiacSign, compressImage } from '../../utils/helpers';
import { playMagicalBell } from '../../utils/synth';
import { uploadImageToSupabase, isSupabaseConfigured } from '../../lib/supabase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => Promise<void> | void;
  profileSaving?: boolean;
  profileSuccessMsg?: string;
  theme: ThemeStyle;
  supabaseUser?: any;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  profileSaving = false,
  profileSuccessMsg = '',
  theme,
  supabaseUser,
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    fullName: '',
    username: '',
    avatarUrl: '🎂',
    dateOfBirth: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [localSuccessMsg, setLocalSuccessMsg] = useState('');
  const [localErrorMsg, setLocalErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: userProfile.fullName || '',
        username: userProfile.username || '',
        avatarUrl: userProfile.avatarUrl || '🎂',
        dateOfBirth: userProfile.dateOfBirth || '',
      });
      setLocalSuccessMsg('');
      setLocalErrorMsg('');
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

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

    console.info('[EditProfileModal Debug] Saving updated profile:', updatedProfile);

    try {
      await onSaveProfile(updatedProfile);
      setLocalSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setLocalSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg = err?.message || 'Failed to update profile. Please try again.';
      console.error('[EditProfileModal Debug Error] Save profile error:', err);
      setLocalErrorMsg(msg);
    }
  };

  const handleImageUpload = async (file: File) => {
    setLocalErrorMsg('');
    try {
      setUploadingImage(true);
      console.info('[EditProfileModal Debug] Uploading image file:', file.name, file.size);
      const avatarUrl = await uploadImageToSupabase(file, 'birthday-memories');
      setFormData((prev) => ({ ...prev, avatarUrl }));
      playMagicalBell(880, 0.4);
    } catch (err: any) {
      const msg = err?.message || 'Failed to process photo. Please try another image.';
      console.error('[EditProfileModal Debug Error] Photo upload error:', err);
      setLocalErrorMsg(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const zodiac = getZodiacSign(formData.dateOfBirth);
  const month = getBirthMonth(formData.dateOfBirth);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative ${
            theme.isDark
              ? 'bg-slate-900 border-white/10 text-white shadow-indigo-950/50'
              : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
          }`}
        >
          {/* Header */}
          <div className={`p-5 px-6 border-b flex items-center justify-between ${
            theme.isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Edit Profile</h3>
                <p className={`text-xs ${theme.isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  Customize your name, handle, avatar, and birthday details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                theme.isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {localErrorMsg && (
              <div className="p-3.5 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <div className="flex-1">
                  <p className="font-extrabold">Profile Update Issue</p>
                  <p className="font-normal opacity-90">{localErrorMsg}</p>
                </div>
              </div>
            )}

            {(profileSuccessMsg || localSuccessMsg) && !localErrorMsg && (
              <div className="p-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                <Check className="w-4 h-4 shrink-0" />
                {localSuccessMsg || profileSuccessMsg}
              </div>
            )}

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border bg-indigo-500/5 border-indigo-500/10">
              <div className="relative shrink-0">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 overflow-hidden ${
                  theme.isDark ? 'bg-slate-800 border-white/20' : 'bg-white border-slate-200'
                }`}>
                  {formData.avatarUrl && (formData.avatarUrl.startsWith('http') || formData.avatarUrl.startsWith('data:')) ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="select-none">{formData.avatarUrl || '🎂'}</span>
                  )}
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <p className="text-xs font-bold">Profile Photo or Emoji</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="cursor-pointer">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border inline-flex items-center gap-1.5 transition shadow-sm ${
                      theme.isDark
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                    }`}>
                      <Camera className="w-3.5 h-3.5" /> Upload Photo
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
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                        theme.isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                          : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Presets 🎨
                    </button>
                    <div className={`absolute top-full left-0 mt-2 hidden group-hover:grid grid-cols-6 p-2.5 rounded-2xl shadow-2xl gap-1.5 z-50 border w-64 ${
                      theme.isDark ? 'bg-slate-950/95 border-white/15' : 'bg-white border-slate-200 shadow-xl'
                    }`}>
                      {AVATAR_PRESETS.map((emoji, idx) => (
                        <button
                          key={`${emoji}-${idx}`}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: emoji }))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-indigo-500/20 hover:scale-110 transition cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className={`text-[11px] font-bold tracking-wider uppercase block mb-1 flex items-center gap-1.5 ${
                  theme.isDark ? 'text-white/60' : 'text-slate-600'
                }`}>
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Kenneth Abazu"
                  className={`rounded-xl px-4 py-2.5 text-sm focus:outline-none transition w-full border ${
                    theme.isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[11px] font-bold tracking-wider uppercase block mb-1 flex items-center gap-1.5 ${
                  theme.isDark ? 'text-white/60' : 'text-slate-600'
                }`}>
                  <AtSign className="w-3.5 h-3.5 text-indigo-400" /> Username / Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono opacity-50">@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, ''),
                      }))
                    }
                    placeholder="kenneth123"
                    className={`rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono focus:outline-none transition w-full border ${
                      theme.isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-[11px] font-bold tracking-wider uppercase block mb-1 flex items-center gap-1.5 ${
                  theme.isDark ? 'text-white/60' : 'text-slate-600'
                }`}>
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  className={`rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none transition w-full border ${
                    theme.isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 shadow-sm'
                  }`}
                />
              </div>

              {/* Dynamic Badges Preview */}
              {(zodiac || month) && (
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  {month && (
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border ${
                      theme.isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                    }`}>
                      📅 Month: {month}
                    </span>
                  )}
                  {zodiac && (
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border ${
                      theme.isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      ✨ Zodiac: {zodiac.name} {zodiac.symbol}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  theme.isDark ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileSaving || uploadingImage}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {profileSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
