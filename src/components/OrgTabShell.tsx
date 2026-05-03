import { useState } from 'react';
import BottomNav from './BottomNav';
import HomeTab from './HomeTab';
import OffersTab from './OffersTab';
import MapTab from './MapTab';
import CafeDetailView from './CafeDetailView';
import GdprModal from './GdprModal';
import SmartChatWidget from './SmartChatWidget';
import type { Organization, Partner, FAQ } from '../lib/supabase';

type Tab = 'home' | 'offers' | 'map';
type Menu = { partnerName: string; menuText: string };

type Props = {
  org: Organization;
  partners: Partner[];
  menus: Menu[];
  faqs: FAQ[];
};

export default function OrgTabShell({ org, partners, menus, faqs }: Props) {
  const [tab, setTab] = useState<Tab>('home');
  const [selectedCafe, setSelectedCafe] = useState<Partner | null>(null);

  function switchTab(next: Tab) {
    setTab(next);
    // Clear cafe detail when switching away from offers
    if (next !== 'offers') setSelectedCafe(null);
  }

  function openCafe(partner: Partner) {
    setTab('offers');
    setSelectedCafe(partner);
  }

  function openCafeById(partnerId: string) {
    const cafe = partners.find((p) => p.id === partnerId);
    if (cafe) openCafe(cafe);
  }

  const faqsForChat = faqs.map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <>
      <GdprModal />

      {/* Tab content */}
      <div className="max-w-lg mx-auto px-4 py-4 pb-40">
        {tab === 'home' && <HomeTab org={org} />}
        {tab === 'offers' && (
          <OffersTab partners={partners} onSelectCafe={openCafe} />
        )}
        {tab === 'map' && (
          <MapTab
            org={org}
            partners={partners}
            onViewMenus={() => switchTab('offers')}
          />
        )}
      </div>

      {/* Cafe detail sub-view — slides in over offers tab, nav stays visible */}
      {selectedCafe && tab === 'offers' && (
        <CafeDetailView cafe={selectedCafe} onBack={() => setSelectedCafe(null)} />
      )}

      {/*
        SmartChatWidget lift trick:
        transform: translateY(0) creates a new CSS containing block.
        The widget's own `fixed bottom-0` positions relative to this div
        (at bottom: 64px) rather than the viewport — lifting it above the nav.
      */}
      <div
        style={{
          position: 'fixed',
          bottom: 64,
          left: 0,
          right: 0,
          zIndex: 40,
          transform: 'translateY(0)',
        }}
      >
        <SmartChatWidget
          menus={menus}
          partners={partners}
          orgSlug={org.slug}
          faqs={faqsForChat}
          onOpenCafe={openCafeById}
        />
      </div>

      {/* Bottom nav — always on top at z-50, shows correct tab even in sub-view */}
      <BottomNav active={tab} onSwitch={switchTab} />
    </>
  );
}
