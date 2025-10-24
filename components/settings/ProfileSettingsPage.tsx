import React, { useState } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { useAppStore } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import SettingsCard from './SettingsCard';
import { useToast } from '../../hooks/useToast';
import { labelClasses, inputClasses } from '../ui/constants';

const ProfileSettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { currentUser } = useUserStore();
    const { updateUser } = useAppStore();
    
    const [name, setName] = useState(currentUser!.name);
    const [email, setEmail] = useState(currentUser!.email);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSaveProfile = () => {
        if (!currentUser) return;
        updateUser({ ...currentUser, name, email });
        toast.success(t('profileUpdated'));
    };

    const handleSavePassword = () => {
        if(password !== confirmPassword) {
            toast.error(t('passwordsDoNotMatch'));
            return;
        }
        if (!currentUser) return;
        // In real app, this would be a secure API call
        updateUser({ ...currentUser, password });
        toast.success(t('passwordUpdated'));
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="space-y-6">
            <SettingsCard
                title={t('personalInformation')}
                description={t('personalInformationDescription')}
                footer={<button onClick={handleSaveProfile} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('save')}</button>}
            >
                <div>
                    <label htmlFor="name" className={labelClasses}>{t('name')}</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="email" className={labelClasses}>{t('userEmail')}</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} />
                </div>
            </SettingsCard>

            <SettingsCard
                title={t('password')}
                description={t('passwordDescription')}
                footer={<button onClick={handleSavePassword} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700">{t('updatePassword')}</button>}
            >
                 <div>
                    <label htmlFor="password" className={labelClasses}>{t('newPassword')}</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className={labelClasses}>{t('confirmPassword')}</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses} />
                </div>
            </SettingsCard>
        </div>
    );
};

export default ProfileSettingsPage;
