import { useStore } from '@nanostores/react';
import { motion } from 'framer-motion';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { toggleSidebar } from '~/lib/stores/sidebar';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={classNames('flex items-center px-5 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-buildstack-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-3 z-logo text-buildstack-elements-textPrimary">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-transparent hover:bg-transparent border-none cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <div className="i-ph:sidebar-simple-duotone text-lg text-buildstack-elements-textPrimary" />
        </motion.button>
        <a href="/" className="flex items-center select-none">
          <span
            className="text-lg font-bold text-buildstack-elements-textPrimary tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            BuildStack
          </span>
        </a>
      </div>
      {chat.started && (
        <>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex-1 px-4 truncate text-center text-buildstack-elements-textTertiary text-sm"
          >
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </motion.span>
          <ClientOnly>
            {() => (
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <HeaderActionButtons chatStarted={chat.started} />
              </motion.div>
            )}
          </ClientOnly>
        </>
      )}
    </motion.header>
  );
}
