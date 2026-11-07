import { publicApi } from '~/api/factories/publicApi';

export interface PlatformCampaign { enabled: boolean; percentOff: number; label: string; bannerText: string; badgeText: string }
const EMPTY: PlatformCampaign = { enabled: false, percentOff: 0, label: '', bannerText: '', badgeText: '' };

export function usePlatformCampaign() {
  const campaign = useState<PlatformCampaign>('platform-campaign', () => EMPTY);
  const loaded = useState('platform-campaign-loaded', () => false);
  async function load() {
    if (loaded.value) return campaign.value;
    try { campaign.value = await publicApi.platformCampaign(); }
    catch { campaign.value = EMPTY; }
    loaded.value = true;
    return campaign.value;
  }
  return { campaign, load };
}
