type Tab = 'home' | 'offers' | 'map';

type Props = {
  active: Tab;
  onSwitch: (tab: Tab) => void;
};

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'home',   label: 'Home',   icon: '🏠' },
  { key: 'offers', label: 'Offers', icon: '🎁' },
  { key: 'map',    label: 'Map',    icon: '🗺️' },
];

export default function BottomNav({ active, onSwitch }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 flex">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onSwitch(t.key)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            active === t.key ? 'text-brand-600' : 'text-gray-400'
          }`}
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
