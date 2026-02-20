import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import bgImage from "../assets/profile-bg.png";
import { useAuth } from "../contexts/AuthContext";

type ProfileData = {
  name: string;
  email: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  phone: string;
  aiVoice: "Female" | "Male";
  avatarDataUrl?: string;
};

// Store only UI preferences separately
const PREFERENCES_KEY = "samaa:profilePreferences";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize profile from authenticated user
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (!user) {
      return {
        name: "",
        email: "",
        gender: "Male",
        dob: "",
        phone: "",
        aiVoice: "Female",
        avatarDataUrl: undefined,
      };
    }

    // Load UI preferences from localStorage
    const prefs = localStorage.getItem(PREFERENCES_KEY);
    const savedPrefs = prefs ? JSON.parse(prefs) : {};

    return {
      name: user.full_name || "",
      email: user.email || "",
      gender: (user.gender as "Male" | "Female" | "Other") || "Male",
      dob: user.birth_date || "",
      phone: user.phone || "",
      aiVoice: savedPrefs.aiVoice || "Female",
      avatarDataUrl: savedPrefs.avatarDataUrl,
    };
  });

  const [draft, setDraft] = useState<ProfileData>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Sync profile when user data changes
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const prefs = localStorage.getItem(PREFERENCES_KEY);
    const savedPrefs = prefs ? JSON.parse(prefs) : {};

    const updatedProfile = {
      name: user.full_name || "",
      email: user.email || "",
      gender: (user.gender as "Male" | "Female" | "Other") || "Male",
      dob: user.birth_date || "",
      phone: user.phone || "",
      aiVoice: savedPrefs.aiVoice || "Female",
      avatarDataUrl: savedPrefs.avatarDataUrl,
    };

    setProfile(updatedProfile);
    setDraft(updatedProfile);
  }, [user, navigate]);

  // Save UI preferences separately
  useEffect(() => {
    try {
      const prefs = {
        aiVoice: profile.aiVoice,
        avatarDataUrl: profile.avatarDataUrl,
      };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [profile.aiVoice, profile.avatarDataUrl]);

  const startEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const saveEdit = () => {
    setProfile(draft);

    // Update the authenticated user data
    if (user) {
      updateUser({
        full_name: draft.name,
        email: draft.email,
        gender: draft.gender,
        birth_date: draft.dob,
        phone: draft.phone,
      });
    }

    setIsEditing(false);
  };

  const onPickAvatar = () => {
    fileInputRef.current?.click();
  };

  const onAvatarSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      setDraft((prev) => ({ ...prev, avatarDataUrl: dataUrl }));
      if (!isEditing) {
        setProfile((prev) => ({ ...prev, avatarDataUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const view = isEditing ? draft : profile;

  return (
    <motion.div
      className="min-h-screen relative font-serif overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-[#FAF7F2]" />

      {/* NAVBAR */}
      <motion.div
        className="bg-[#7f957e] text-black rounded-b-3xl px-4 sm:px-6 md:px-10 py-4 md:py-6 relative z-10"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <motion.button
            type="button"
            className="text-xl md:text-2xl"
            onClick={() => navigate("/dashboard")}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            ←
          </motion.button>
          <h2 className="text-2xl sm:text-3xl mx-auto">Profile</h2>
          <div className="w-8 md:w-10" />
        </div>
      </motion.div>

      {/* PROFILE AVATAR */}
      <motion.div
        className="flex flex-col items-center mt-8 md:mt-12 relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
      >
        <div
          className="
            w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32
            bg-[#8ea98f]
            rounded-full
            flex items-center justify-center
            shadow-md
            overflow-hidden
          "
        >
          {view.avatarDataUrl ? (
            <img
              src={view.avatarDataUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl sm:text-5xl text-[#4e6a50]">👤</span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onAvatarSelected}
        />

        <button
          type="button"
          onClick={onPickAvatar}
          className="mt-3 md:mt-4 text-base md:text-lg underline opacity-80 hover:opacity-100"
        >
          Upload / Change
        </button>

        <div className="mt-4 flex items-center gap-3">
          {!isEditing ? (
            <motion.button
              type="button"
              onClick={startEdit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 rounded-full bg-[#7d9b7f] text-white shadow-sm press"
            >
              Edit profile
            </motion.button>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={saveEdit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 rounded-full bg-[#7d9b7f] text-white shadow-sm press"
              >
                Save
              </motion.button>
              <motion.button
                type="button"
                onClick={cancelEdit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 rounded-full bg-white/70 border border-black/10 text-black shadow-sm press"
              >
                Cancel
              </motion.button>
            </>
          )}

          <motion.button
            type="button"
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 rounded-full bg-[#D68A6A] text-white shadow-sm press"
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* PROFILE DETAILS */}
      <div className="max-w-4xl mx-auto mt-8 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 sm:px-6 relative z-10">
        {[
          {
            label: "Name",
            view: view.name,
            edit: (
              <input
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-white/70 border border-black/10 rounded-lg px-3 py-2 outline-none"
              />
            ),
          },
          {
            label: "Date Of Birth",
            view: view.dob,
            edit: (
              <input
                type="date"
                value={draft.dob}
                onChange={(e) => setDraft((p) => ({ ...p, dob: e.target.value }))}
                className="w-full bg-white/70 border border-black/10 rounded-lg px-3 py-2 outline-none"
              />
            ),
          },
          {
            label: "Email",
            view: view.email,
            edit: (
              <input
                type="email"
                value={draft.email}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full bg-white/70 border border-black/10 rounded-lg px-3 py-2 outline-none"
              />
            ),
          },
          {
            label: "Gender",
            view: view.gender,
            edit: (
              <select
                value={draft.gender}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    gender: e.target.value as ProfileData["gender"],
                  }))
                }
                className="w-full bg-white/70 border border-black/10 rounded-lg px-3 py-2 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ),
          },
          {
            label: "Phone Number",
            view: view.phone,
            edit: (
              <input
                value={draft.phone}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full bg-white/70 border border-black/10 rounded-lg px-3 py-2 outline-none"
              />
            ),
          },
          {
            label: "AI Voice",
            view: view.aiVoice,
            edit: (
              <select
                value={draft.aiVoice}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    aiVoice: e.target.value as ProfileData["aiVoice"],
                  }))
                }
                className="w-full bg-white/70 border border-black/10 rounded-lg px-3 py-2 outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            ),
          },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-[#fde9dd] rounded-lg px-5 py-4 border border-[#c9a08a]"
          >
            <p className="text-lg font-semibold">{item.label}</p>
            <div className="text-base mt-1">
              {isEditing ? item.edit : <span>{item.view}</span>}
            </div>
          </motion.div>
        ))}

        <motion.button
          type="button"
          onClick={() => navigate("/onboarding-goals")}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="md:col-span-2 bg-white/70 rounded-lg px-5 py-4 border border-black/10 text-left press"
        >
          <div className="text-lg font-semibold">Update Goals</div>
          <div className="text-sm opacity-80 mt-1">
            Change your goals to personalize recommendations.
          </div>
        </motion.button>

      </div>

      {/* ACCOUNT STATUS */}
      <div className="max-w-4xl mx-auto mt-8 md:mt-12 px-4 sm:px-6 relative z-10">
        <button
          type="button"
          onClick={() => setStatusOpen((v) => !v)}
          className="w-full flex justify-between items-center border-b pb-2"
        >
          <h3 className="text-lg md:text-xl">Account Status</h3>
          <motion.span
            className="text-lg md:text-xl"
            animate={{ rotate: statusOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            ⌄
          </motion.span>
        </button>

        <AnimatePresence>
          {statusOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-4 bg-white/60 border border-black/10 rounded-2xl p-4 md:p-5 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#dbe7d7]/70 border border-black/10 rounded-xl p-3">
                  <div className="text-sm opacity-70">Email</div>
                  <div className="text-base font-semibold">Verified</div>
                </div>
                <div className="bg-[#dbe7d7]/70 border border-black/10 rounded-xl p-3">
                  <div className="text-sm opacity-70">Plan</div>
                  <div className="text-base font-semibold">Free</div>
                </div>
                <div className="bg-[#dbe7d7]/70 border border-black/10 rounded-xl p-3">
                  <div className="text-sm opacity-70">Data</div>
                  <div className="text-base font-semibold">Stored on device</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/ai-wellness-guide")}
                  className="px-5 py-2 rounded-full bg-white/70 border border-black/10 press"
                >
                  Open Assistant
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="px-5 py-2 rounded-full bg-white/70 border border-black/10 press"
                >
                  Get Support
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Profile;