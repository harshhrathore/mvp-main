import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export type DrawerNavItem = {
  label: string;
  to?: string;
  disabled?: boolean;
};

type LeftDrawerNavProps = {
  items?: DrawerNavItem[];
  buttonClassName?: string;
};

const DEFAULT_ITEMS: DrawerNavItem[] = [
  { label: "Home", to: "/dashboard" },
  { label: "Ayurveda", to: "/ayurveda" },
  { label: "About", disabled: true },
  { label: "Blog", to: "/blog" },
  { label: "Yoga", to: "/yoga" },
  { label: "Contact", to: "/contact" },
];

const LeftDrawerNav: React.FC<LeftDrawerNavProps> = ({
  items,
  buttonClassName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => items ?? DEFAULT_ITEMS, [items]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const go = (item: DrawerNavItem) => {
    if (item.disabled || !item.to) return;
    setOpen(false);
    navigate(item.to);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className={
          buttonClassName ??
          "inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/40 border border-black/10 backdrop-blur-sm press"
        }
      >
        <span className="sr-only">Open menu</span>
        <span className="block w-5">
          <span className="block h-[2px] bg-black/80 rounded-full" />
          <span className="block h-[2px] bg-black/80 rounded-full mt-1.5" />
          <span className="block h-[2px] bg-black/80 rounded-full mt-1.5" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/30"
            />

            <motion.aside
              role="navigation"
              aria-label="Primary"
              className="absolute left-0 top-0 h-full w-[280px] bg-[#F0F2EE] border-r border-black/10 shadow-xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="px-4 py-4 bg-[#7f957e] text-black">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Menu</div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-9 h-9 rounded-xl bg-white/30 border border-black/10 press"
                    aria-label="Close menu"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-1">
                {navItems.map((item) => {
                  const active = item.to && location.pathname === item.to;
                  const disabled = !!item.disabled || !item.to;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => go(item)}
                      disabled={disabled}
                      className={
                        "w-full text-left px-4 py-3 rounded-xl border transition-colors " +
                        (disabled
                          ? "opacity-50 cursor-not-allowed bg-white/40 border-black/10"
                          : active
                            ? "bg-white/70 border-black/20"
                            : "bg-white/50 hover:bg-white/70 border-black/10")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {disabled && item.label !== "Home" && (
                          <span className="text-xs opacity-70">Soon</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LeftDrawerNav;
