import React, { useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../common/ThemeProvider';
import { LanguageContext } from '../common/LanguageProvider';
import SettingsCard from './SettingsCard';
import { AppSettings, UserRole } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { MoonIcon, SunIcon, TrashIcon, ArrowUpOnSquareIcon } from '../icons';
import { LogoIcon } from '../icons';
import { useToast } from '@/hooks/useToast';

const GeneralSettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang } = useContext(LanguageContext);
    const toast = useToast();
    
    const { appSettings, updateAppSettings: onUpdateSettings } = useAppStore();
    const [settings, setSettings] = useState<AppSettings | null>(appSettings);
    const [logoPreview, setLogoPreview] = useState<string | null>(appSettings?.logoUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setSettings(appSettings);
        setLogoPreview(appSettings?.logoUrl || null);
    }, [appSettings]);

    if (!settings) {
        return null; // Or a loading indicator
    }

    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        setSettings(prev => prev ? ({ ...prev, [key]: value }) : null);
    };

    const handlePolicyChange = (key: keyof AppSettings['passwordPolicy'], value: any) => {
        setSettings(prev => prev ? ({
            ...prev,
            passwordPolicy: {
                ...prev.passwordPolicy,
                [key]: value
            }
        }) : null);
    };

    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                handleSettingChange('logoUrl', result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeLogo = () => {
        setLogoPreview(null);
        handleSettingChange('logoUrl', undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleSave = () => {
        if (settings) {
            onUpdateSettings(settings);
            toast.success(t('saveChanges'));
        }
    };

    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const selectClasses = "mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white";
    const inputClasses = "mt-1 w-24 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white";
    const checkboxClasses = "h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded";

    return (
        <div className="space-y-6">
            <SettingsCard title={t('appearance')} description={t('appearanceDescription')}>
                <div>
                    <label className={labelClasses}>{t('language')}</label>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                        <button onClick={() => lang !== 'en' && toggleLang()} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${lang === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-primary' : 'text-slate-600 dark:text-slate-300'}`}>{t('english')}</button>
                        <button onClick={() => lang !== 'ar' && toggleLang()} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${lang === 'ar' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-primary' : 'text-slate-600 dark:text-slate-300'}`}>{t('arabic')}</button>
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>{t('theme')}</label>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                        <button onClick={() => theme !== 'light' && toggleTheme()} className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-primary' : 'text-slate-600 dark:text-slate-300'}`}><SunIcon className="w-5 h-5"/>{t('light')}</button>
                        <button onClick={() => theme !== 'dark' && toggleTheme()} className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-primary' : 'text-slate-600 dark:text-slate-300'}`}><MoonIcon className="w-5 h-5"/>{t('dark')}</button>
                    </div>
                </div>
            </SettingsCard>
            
            <SettingsCard title={t('branding')} description={t('brandingDescription')}>
                <div>
                    <label htmlFor="primaryColor" className={labelClasses}>{t('primaryColor')}</label>
                    <div className="mt-1 flex items-center gap-2">
                        <input 
                            type="color" 
                            id="primaryColor" 
                            value={settings.primaryColor || '#4f46e5'} 
                            onChange={e => handleSettingChange('primaryColor', e.target.value)}
                            className="p-1 h-10 w-14 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                        />
                        <input 
                            type="text"
                            value={settings.primaryColor || '#4f46e5'}
                            onChange={e => handleSettingChange('primaryColor', e.target.value)}
                            className={`${inputClasses} w-32`}
                        />
                    </div>
                </div>
                <div className="pt-4 border-t border-brand-border dark:border-dark-brand-border">
                    <label className={labelClasses}>{t('appLogo')}</label>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-brand-border dark:border-dark-brand-border">
                            {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" /> : <LogoIcon className="w-8 h-8 text-slate-400" />}
                        </div>
                        <div className="flex flex-col gap-2">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoFileChange} className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                                <ArrowUpOnSquareIcon className="w-4 h-4" />
                                {t('uploadLogo')}
                            </button>
                            {logoPreview && <button type="button" onClick={removeLogo} className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
                                <TrashIcon className="w-4 h-4" />
                                {t('removeLogo')}
                            </button>}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{t('logoRecommendation')}</p>
                </div>
            </SettingsCard>

            <SettingsCard 
                title={t('general')} 
                description={t('defaultUserRoleDescription')}
            >
                <div>
                    <label htmlFor="default-role" className={labelClasses}>{t('defaultUserRole')}</label>
                    <select 
                        id="default-role" 
                        value={settings.defaultUserRole} 
                        onChange={e => handleSettingChange('defaultUserRole', e.target.value as UserRole)} 
                        className={selectClasses}
                    >
                        {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClasses}>{t('passwordPolicy')}</label>
                    <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('passwordPolicyDescription')}</p>
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="minLength" className="text-sm">{t('minLength')}</label>
                            <input type="number" id="minLength" value={settings.passwordPolicy.minLength} onChange={e => handlePolicyChange('minLength', parseInt(e.target.value))} className={inputClasses}/>
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="requireUppercase" className="text-sm">{t('requireUppercase')}</label>
                            <input type="checkbox" id="requireUppercase" checked={settings.passwordPolicy.requireUppercase} onChange={e => handlePolicyChange('requireUppercase', e.target.checked)} className={checkboxClasses}/>
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="requireNumber" className="text-sm">{t('requireNumber')}</label>
                            <input type="checkbox" id="requireNumber" checked={settings.passwordPolicy.requireNumber} onChange={e => handlePolicyChange('requireNumber', e.target.checked)} className={checkboxClasses}/>
                        </div>
                    </div>
                </div>
            </SettingsCard>
            <div className="flex justify-end pt-4">
                <button onClick={handleSave} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">
                    {t('saveAllSettings')}
                </button>
            </div>
        </div>
    );
};

export default GeneralSettingsPage;
