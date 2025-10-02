import React, { useState, useCallback } from 'react';
import { AppSettings } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import SettingsCard from './SettingsCard';
import { useAppStore } from '../../stores/useAppStore';
import { useToast } from '../../hooks/useToast';
import { useDebouncedCallback } from 'use-debounce';

const GeneralSettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const appSettings = useAppStore((state) => state.appSettings)!;
    const updateAppSettings = useAppStore((state) => state.updateAppSettings);
    
    const [settings, setSettings] = useState<AppSettings>(appSettings);
    
    const debouncedUpdate = useDebouncedCallback((newSettings: AppSettings) => {
        updateAppSettings(newSettings);
    }, 300);

    const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        debouncedUpdate(newSettings);
    };

    const handleGlobeChange = <K extends keyof AppSettings['globeSettings']>(key: K, value: AppSettings['globeSettings'][K]) => {
        const newSettings = { 
            ...settings, 
            globeSettings: {
                ...settings.globeSettings,
                [key]: value
            }
        };
        setSettings(newSettings);
        debouncedUpdate(newSettings);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('logoUrl', reader.result as string);
                toast.success(t('logoUpdated'));
            };
            reader.readAsDataURL(file);
        } else {
            toast.error(t('invalidFile'));
        }
    };
    
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClasses = "mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white";

    const SettingRow: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className={labelClasses}>{label}</label>
            <div className="md:col-span-2">{children}</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <SettingsCard title={t('generalSettings')} description={t('generalSettingsDescription')}>
                 <SettingRow label={t('appName')}><input type="text" value={settings.appName} onChange={e => handleChange('appName', e.target.value)} className={inputClasses} /></SettingRow>
                 <SettingRow label={t('primaryColor')}><input type="color" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} className="w-full h-10" /></SettingRow>
            </SettingsCard>

            <SettingsCard title={t('branding')} description={t('brandingDescription')}>
                <div className="flex items-center gap-6">
                    <img src={settings.logoUrl || './logo.svg'} alt="Logo Preview" className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 p-2 object-contain" />
                    <div className="flex-grow">
                        <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        <label htmlFor="logo-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600">{t('uploadLogo')}</label>
                        {settings.logoUrl && <button onClick={() => handleChange('logoUrl', '')} className="ml-2 text-sm text-red-600 hover:underline">{t('removeLogo')}</button>}
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title={t('loginPageGlobe')} description={t('loginPageGlobeDescription')}>
                 <SettingRow label={t('baseColor')}><input type="color" value={settings.globeSettings.baseColor} onChange={e => handleGlobeChange('baseColor', e.target.value)} className="w-full h-10" /></SettingRow>
                 <SettingRow label={t('markerColor')}><input type="color" value={settings.globeSettings.markerColor} onChange={e => handleGlobeChange('markerColor', e.target.value)} className="w-full h-10" /></SettingRow>
                 <SettingRow label={t('glowColor')}><input type="color" value={settings.globeSettings.glowColor} onChange={e => handleGlobeChange('glowColor', e.target.value)} className="w-full h-10" /></SettingRow>
                 <SettingRow label={t('rotationSpeed')}>
                    <div className="flex items-center gap-2">
                        <input type="range" min="0" max="0.1" step="0.005" value={settings.globeSettings.rotationSpeed} onChange={e => handleGlobeChange('rotationSpeed', parseFloat(e.target.value))} className="w-full" />
                        <span className="text-xs w-10 text-right">{settings.globeSettings.rotationSpeed.toFixed(3)}</span>
                    </div>
                </SettingRow>
                 <SettingRow label={t('scale')}>
                    <div className="flex items-center gap-2">
                        <input type="range" min="1" max="4" step="0.1" value={settings.globeSettings.scale} onChange={e => handleGlobeChange('scale', parseFloat(e.target.value))} className="w-full" />
                        <span className="text-xs w-10 text-right">{settings.globeSettings.scale.toFixed(1)}</span>
                    </div>
                 </SettingRow>
                 <SettingRow label={t('lightIntensity')}>
                    <div className="flex items-center gap-2">
                        <input type="range" min="0" max="10" step="0.5" value={settings.globeSettings.lightIntensity} onChange={e => handleGlobeChange('lightIntensity', parseFloat(e.target.value))} className="w-full" />
                        <span className="text-xs w-10 text-right">{settings.globeSettings.lightIntensity.toFixed(1)}</span>
                    </div>
                 </SettingRow>
                 <SettingRow label={t('darkness')}>
                    <div className="flex items-center gap-2">
                        <input type="range" min="0" max="1" step="0.05" value={settings.globeSettings.darkness} onChange={e => handleGlobeChange('darkness', parseFloat(e.target.value))} className="w-full" />
                        <span className="text-xs w-10 text-right">{settings.globeSettings.darkness.toFixed(2)}</span>
                    </div>
                 </SettingRow>
            </SettingsCard>
        </div>
    );
};

export default GeneralSettingsPage;