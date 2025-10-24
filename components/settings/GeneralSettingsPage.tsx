import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { AppSettings } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import SettingsCard from './SettingsCard';
import { useToast } from '../../hooks/useToast';
import ImageUpload from './ImageUpload';
import ColorPicker from './ColorPicker';
import { labelClasses, inputClasses } from '../ui/constants';

const GeneralSettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { appSettings, updateAppSettings } = useAppStore();
    const [settings, setSettings] = useState<AppSettings>(appSettings!);

    const handleSave = () => {
        updateAppSettings(settings);
        toast.success(t('settingsUpdated'));
        // Force a reload to see primary color changes globally
        window.location.reload();
    };

    const handleGlobeChange = (field: keyof AppSettings['globeSettings'], value: any) => {
        setSettings(s => ({
            ...s,
            globeSettings: { ...s.globeSettings, [field]: value }
        }));
        // Debounce this in a real app
        updateAppSettings({
            ...settings,
            globeSettings: { ...settings.globeSettings, [field]: value }
        });
    }

    return (
        <div className="space-y-6">
            <SettingsCard
                title={t('branding')}
                description={t('brandingDescription')}
                // FIX: Cast translation key to any
                footer={<button onClick={handleSave} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('saveChanges' as any)}</button>}
            >
                <div>
                    <label htmlFor="appName" className={labelClasses}>{t('appName')}</label>
                    <input type="text" id="appName" value={settings.appName} onChange={e => setSettings(s => ({ ...s, appName: e.target.value }))} className={inputClasses} />
                </div>
                <div>
                     <label className={labelClasses}>{t('appLogo')}</label>
                     <ImageUpload currentImage={settings.logoUrl} onImageChange={url => setSettings(s => ({...s, logoUrl: url}))} />
                </div>
                <div>
                    <label className={labelClasses}>{t('primaryColor')}</label>
                    <ColorPicker color={settings.primaryColor} onChange={color => setSettings(s => ({...s, primaryColor: color}))} />
                </div>
            </SettingsCard>

            <SettingsCard title={t('loginPageGlobe')} description={t('loginPageGlobeDescription')}>
                 <div>
                    <label className={labelClasses}>{t('glowColor')}</label>
                    <ColorPicker color={settings.globeSettings.glowColor} onChange={color => handleGlobeChange('glowColor', color)} />
                </div>
                 <div>
                    <label htmlFor="darkness" className={labelClasses}>{t('darkness')} ({settings.globeSettings.darkness})</label>
                    <input type="range" id="darkness" min="0" max="1" step="0.1" value={settings.globeSettings.darkness} onChange={e => handleGlobeChange('darkness', parseFloat(e.target.value))} className="w-full" />
                </div>
            </SettingsCard>
        </div>
    );
};

export default GeneralSettingsPage;