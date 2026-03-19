export const useTranslationStore = (selector: (state: any) => any) => {
    const state = {
        translation: {
            bottom: {
                home: 'Home',
                transactions: 'Bookings',
                agents: 'Explore',
                myStatistics: 'Saved',
                profile: 'Profile',
            }
        }
    };
    return selector(state);
};
